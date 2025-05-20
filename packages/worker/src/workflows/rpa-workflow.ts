import { proxyActivities } from '@temporalio/workflow';
import { 
  NodeType, 
  BrowserActionType, 
  WorkflowNode, 
  WorkflowEdge,
  WorkflowExecutionStatus,
  RPAActivities
} from '@temporal-rpa-engine/shared';

// 代理活动，让工作流能够调用到活动
const activities = proxyActivities<RPAActivities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    maximumAttempts: 3
  }
});

/**
 * 根据工作流节点类型执行对应动作
 */
async function executeNode(
  node: WorkflowNode, 
  input: Record<string, any> = {}
): Promise<any> {
  console.log(`执行节点: ${node.name} (${node.id})`);
  
  switch (node.type) {
    case NodeType.START:
      return { success: true, message: '工作流开始' };
      
    case NodeType.END:
      return { success: true, message: '工作流结束' };
      
    case NodeType.BROWSER_ACTION:
      const browserNode = node as any; // 类型转换
      return await activities.executeBrowserAction({
        actionType: browserNode.actionType,
        url: browserNode.url,
        selector: browserNode.selector,
        text: browserNode.text,
        timeout: browserNode.timeout,
        options: browserNode.options
      });
      
    case NodeType.DELAY:
      const delayNode = node as any; // 类型转换
      await activities.delay(delayNode.milliseconds || 1000);
      return { success: true, message: `延迟${delayNode.milliseconds || 1000}毫秒` };
      
    case NodeType.API_CALL:
      const apiNode = node as any; // 类型转换
      return await activities.executeApiCall({
        url: apiNode.url,
        method: apiNode.method,
        headers: apiNode.headers,
        body: apiNode.body
      });
      
    case NodeType.SCRIPT:
      const scriptNode = node as any; // 类型转换
      return await activities.executeScript({
        code: scriptNode.code,
        context: { ...input, nodeId: node.id }
      });
      
    case NodeType.DECISION:
      // 决策节点在主工作流逻辑中处理
      return { success: true, nodeId: node.id };
      
    default:
      throw new Error(`不支持的节点类型: ${node.type}`);
  }
}

/**
 * 评估决策条件
 */
function evaluateCondition(
  condition: string, 
  context: Record<string, any>
): boolean {
  try {
    // 使用Function构造器创建可执行函数
    // 注意：这在生产环境中可能存在安全风险
    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);
    const fn = new Function(...contextKeys, `return ${condition};`);
    return fn(...contextValues);
  } catch (error: any) {
    console.error(`条件评估失败: ${error}`);
    return false;
  }
}

/**
 * RPA工作流执行主函数
 */
export async function executeRPAWorkflow(
  params: {
    workflowId: string;
    executionId: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    input?: Record<string, any>;
  }
): Promise<any> {
  const { workflowId, executionId, nodes, edges, input = {} } = params;
  
  // 存储中间执行结果
  const results: Record<string, any> = {};
  // 记录已执行节点，防止循环
  const visitedNodes = new Set<string>();
  
  try {
    // 更新工作流状态为运行中
    await activities.logWorkflowStatus({
      executionId,
      status: WorkflowExecutionStatus.RUNNING
    });
    
    // 找到开始节点
    const startNode = nodes.find(node => node.type === NodeType.START);
    if (!startNode) {
      throw new Error('工作流缺少开始节点');
    }
    
    // 从开始节点执行
    let currentNodeId = startNode.id;
    let currentNode = startNode;
    
    // 执行工作流直到结束
    while (currentNode && !visitedNodes.has(currentNodeId)) {
      visitedNodes.add(currentNodeId);
      
      // 执行当前节点
      const nodeResult = await executeNode(currentNode, {
        ...input,
        ...results
      });
      
      // 存储执行结果
      results[currentNodeId] = nodeResult;
      
      // 如果是结束节点，结束工作流
      if (currentNode.type === NodeType.END) {
        break;
      }
      
      // 查找下一个节点
      if (currentNode.type === NodeType.DECISION) {
        // 决策节点需要评估条件
        const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);
        
        // 找到符合条件的边
        let nextEdge = null;
        for (const edge of outgoingEdges) {
          if (!edge.condition) {
            // 无条件边作为默认路径
            nextEdge = edge;
            continue;
          }
          
          const conditionMet = evaluateCondition(edge.condition, {
            ...input,
            ...results
          });
          
          if (conditionMet) {
            nextEdge = edge;
            break;
          }
        }
        
        if (!nextEdge) {
          throw new Error(`决策节点 ${currentNodeId} 没有匹配的条件`);
        }
        
        currentNodeId = nextEdge.target;
      } else {
        // 普通节点，查找唯一的出边
        const outgoingEdge = edges.find(edge => edge.source === currentNodeId);
        if (!outgoingEdge) {
          throw new Error(`节点 ${currentNodeId} 没有下一步节点`);
        }
        
        currentNodeId = outgoingEdge.target;
      }
      
      // 获取下一个节点
      currentNode = nodes.find(node => node.id === currentNodeId);
      if (!currentNode) {
        throw new Error(`找不到节点 ID: ${currentNodeId}`);
      }
    }
    
    // 更新工作流状态为已完成
    await activities.logWorkflowStatus({
      executionId,
      status: WorkflowExecutionStatus.COMPLETED,
      result: results
    });
    
    return {
      executionId,
      workflowId,
      status: WorkflowExecutionStatus.COMPLETED,
      results
    };
  } catch (error: any) {
    console.error(`工作流执行失败: ${error}`);
    
    // 更新工作流状态为失败
    await activities.logWorkflowStatus({
      executionId,
      status: WorkflowExecutionStatus.FAILED,
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      executionId,
      workflowId,
      status: WorkflowExecutionStatus.FAILED,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

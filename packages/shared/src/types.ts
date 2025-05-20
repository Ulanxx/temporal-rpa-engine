/**
 * RPA节点类型枚举
 */
export enum NodeType {
  START = 'start',
  END = 'end',
  TASK = 'task',
  DECISION = 'decision',
  BROWSER_ACTION = 'browser_action',
  DELAY = 'delay',
  API_CALL = 'api_call',
  SCRIPT = 'script',
}

/**
 * 浏览器动作类型
 */
export enum BrowserActionType {
  NAVIGATE = 'navigate',
  CLICK = 'click',
  TYPE = 'type',
  SELECT = 'select',
  WAIT_FOR_SELECTOR = 'waitForSelector',
  WAIT_FOR_NAVIGATION = 'waitForNavigation',
  SCREENSHOT = 'screenshot',
  EXTRACT_DATA = 'extractData',
}

/**
 * 工作流节点基本接口
 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  position: {
    x: number;
    y: number;
  };
}

/**
 * 工作流连接线
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

/**
 * 浏览器动作节点
 */
export interface BrowserActionNode extends WorkflowNode {
  type: NodeType.BROWSER_ACTION;
  actionType: BrowserActionType;
  selector?: string;
  url?: string;
  text?: string;
  timeout?: number;
  options?: Record<string, any>;
}

/**
 * 完整工作流定义
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 工作流执行状态
 */
export enum WorkflowExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

/**
 * 工作流执行记录
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  startTime: string;
  endTime?: string;
  result?: any;
  error?: string;
}

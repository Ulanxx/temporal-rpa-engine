import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  Connection,
  Edge,
  Node,
  OnConnect,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
  ConnectionMode,
  MarkerType,
  ConnectionLineType,
  Panel,
  BackgroundVariant
} from 'reactflow';
import { Button, Tooltip, theme, message } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, FullscreenOutlined, DeleteOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { Layout } from 'antd';
import 'reactflow/dist/style.css';

import NodeTypes from './nodes/NodeTypes';
import CustomEdge from './edges/CustomEdge';
import NodePanel from './panels/NodePanel';
import { NodeType } from '../types';

const { Sider, Content } = Layout;

// 自定义节点类型
const nodeTypes = {
  customNode: NodeTypes,
};

// 自定义边类型
const edgeTypes = {
  customEdge: CustomEdge,
};

interface FlowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeSelect?: (event: React.MouseEvent, node: Node) => void;
}

const FlowEditor: React.FC<FlowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}) => {
  const { token } = theme.useToken();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [selectedElements, setSelectedElements] = useState<{nodes: Node[], edges: Edge[]}>({nodes: [], edges: []});
  
  // 自定义流程编辑器控件样式
  const controlsStyle = {
    button: {
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      backgroundColor: token.colorBgElevated,
      borderColor: token.colorBorder,
      color: token.colorText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      cursor: 'pointer',
      marginBottom: '8px',
      fontSize: '16px',
    } as React.CSSProperties,
  };

  // 处理节点变化
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
  }, [nodes, onNodesChange]);

  // 处理边变化
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);
    if (onEdgesChange) {
      onEdgesChange(updatedEdges);
    }
  }, [edges, onEdgesChange]);

  // 处理连接
  const handleConnect: OnConnect = useCallback((params: Connection) => {
    console.log('Connection attempt:', params);
    if (!params.source || !params.target) {
      console.error('Invalid connection: missing source or target');
      return;
    }
    
    const newEdge = {
      id: `e${uuidv4()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: 'customEdge',
      animated: true,
      data: { label: 'connects to' },
    };
    
    console.log('Creating new edge:', newEdge);
    const updatedEdges = addEdge(newEdge, edges);
    console.log('Updated edges:', updatedEdges);
    
    setEdges(updatedEdges);
    if (onEdgesChange) {
      onEdgesChange(updatedEdges);
    }
  }, [edges, onEdgesChange]);

  // 处理流程实例加载
  const handleLoad = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    instance.fitView();
  }, []);

  // 处理节点拖放
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 处理节点拖拽开始
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // 处理节点放置
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!reactFlowWrapper.current || !reactFlowInstance) return;

    const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
      y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
    }) as XYPosition;

    // 创建新节点
    const newNode: Node = {
      id: `node_${uuidv4()}`,
      position,
      type: 'customNode',
      data: { 
        label: getNodeLabel(nodeType),
        type: nodeType 
      },
    };

    setNodes((nds) => [...nds, newNode]);
    if (onNodesChange) {
      onNodesChange([...nodes, newNode]);
    }
  }, [nodes, reactFlowInstance, onNodesChange]);

  // 根据节点类型获取标签
  const getNodeLabel = (nodeType: NodeType): string => {
    switch (nodeType) {
      case NodeType.START:
        return '开始';
      case NodeType.END:
        return '结束';
      case NodeType.BROWSER_ACTION:
        return '浏览器动作';
      case NodeType.DELAY:
        return '延迟';
      case NodeType.API_CALL:
        return 'API调用';
      case NodeType.SCRIPT:
        return '脚本';
      case NodeType.DECISION:
        return '决策';
      case NodeType.TASK:
        return '任务';
      default:
        return '节点';
    }
  };

  return (
    <Layout style={{ height: '100%', width: '100%' }}>
      <Sider width={200} theme="light" style={{ paddingTop: '20px' }}>
        <NodePanel onDragStart={handleDragStart} />
      </Sider>
      <Content>
        <div
          ref={reactFlowWrapper}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: token.colorBgContainer
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onInit={handleLoad}
            onSelectionChange={(params) => {
              setSelectedElements({nodes: params.nodes, edges: params.edges});
            }}
            fitView
            snapToGrid
            snapGrid={[10, 10]}
            connectionMode={ConnectionMode.Loose}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode={['Control', 'Meta']}
            multiSelectionKeyCode={['Shift']}
            zoomOnScroll={true}
            zoomOnDoubleClick={true}
            panOnScroll={true}
            connectOnClick={false}
            onNodeClick={onNodeSelect}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: 'customEdge',
              animated: true,
              style: { strokeWidth: 2, stroke: token.colorPrimary },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: token.colorPrimary,
              },
            }}
            connectionLineStyle={{
              strokeWidth: 2,
              stroke: token.colorPrimary,
              strokeDasharray: '5 5',
            }}
            connectionLineType={ConnectionLineType.SmoothStep}
          >
            <Background 
              color={token.colorBorderSecondary} 
              gap={16} 
              size={1.5} 
              variant={BackgroundVariant.Dots} 
            />
            
            {/* 自定义控制面板 */}
            <Panel position="top-right" style={{ marginTop: 10, marginRight: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedElements.nodes.length > 0 || selectedElements.edges.length > 0 ? (
                  <Tooltip title="删除所选节点或连线">
                    <Button 
                      icon={<DeleteOutlined />} 
                      onClick={() => {
                        if (window.confirm('确定要删除所选元素吗？')) {
                          const updatedNodes = nodes.filter(node => 
                            !selectedElements.nodes.find(n => n.id === node.id)
                          );
                          const updatedEdges = edges.filter(edge => 
                            !selectedElements.edges.find(e => e.id === edge.id)
                          );
                          setNodes(updatedNodes);
                          setEdges(updatedEdges);
                          if (onNodesChange) onNodesChange(updatedNodes);
                          if (onEdgesChange) onEdgesChange(updatedEdges);
                          message.success('已删除所选元素');
                        }
                      }} 
                      danger
                    />
                  </Tooltip>
                ) : null}
              </div>
            </Panel>
            
            <Panel position="bottom-right" style={{ marginBottom: 20, marginRight: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Tooltip title="放大">
                  <Button 
                    style={controlsStyle.button} 
                    icon={<ZoomInOutlined />} 
                    onClick={() => reactFlowInstance?.zoomIn()}
                  />
                </Tooltip>
                <Tooltip title="缩小">
                  <Button 
                    style={controlsStyle.button} 
                    icon={<ZoomOutOutlined />} 
                    onClick={() => reactFlowInstance?.zoomOut()}
                  />
                </Tooltip>
                <Tooltip title="适应窗口">
                  <Button 
                    style={controlsStyle.button} 
                    icon={<FullscreenOutlined />} 
                    onClick={() => reactFlowInstance?.fitView()}
                  />
                </Tooltip>
              </div>
            </Panel>
            
            <MiniMap 
              nodeStrokeColor={(n) => {
                if (n.selected) return token.colorPrimary;
                return token.colorBorder;
              }}
              nodeColor={(n) => {
                if (n.type === 'customNode') {
                  // 根据节点类型返回不同颜色
                  return n.data.type === 'start' ? '#4CAF50' : 
                         n.data.type === 'end' ? '#F44336' : 
                         n.data.type === 'browser_action' ? '#2196F3' : 
                         '#9E9E9E';
                }
                return '#eee';
              }}
              maskColor={`${token.colorBgContainer}50`}
              style={{ backgroundColor: token.colorBgElevated }}
            />
          </ReactFlow>
        </div>
      </Content>
    </Layout>
  );
};

export default function FlowEditorWithProvider(props: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowEditor {...props} />
    </ReactFlowProvider>
  );
}

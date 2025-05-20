import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { NodeType } from '../../types';

const { Title } = Typography;

interface NodePanelProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({ onDragStart }) => {
  // 定义节点类型和名称
  const nodeTypes = [
    { type: NodeType.START, label: '开始节点', color: '#4CAF50' },
    { type: NodeType.END, label: '结束节点', color: '#F44336' },
    { type: NodeType.BROWSER_ACTION, label: '浏览器动作', color: '#2196F3' },
    { type: NodeType.DELAY, label: '延迟', color: '#FF9800' },
    { type: NodeType.API_CALL, label: 'API调用', color: '#9C27B0' },
    { type: NodeType.SCRIPT, label: '脚本', color: '#607D8B' },
    { type: NodeType.DECISION, label: '决策', color: '#795548' },
    { type: NodeType.TASK, label: '任务', color: '#009688' },
  ];

  return (
    <Card title={<Title level={5}>节点类型</Title>} style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
            style={{
              padding: '10px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              marginBottom: '8px',
              cursor: 'grab',
              backgroundColor: node.color,
              color: 'white',
              textAlign: 'center',
            }}
          >
            {node.label}
          </div>
        ))}
      </Space>
    </Card>
  );
};

export default NodePanel;

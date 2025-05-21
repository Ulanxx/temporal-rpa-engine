import React from 'react';
import { Card, Typography, Space, Divider, theme } from 'antd';
import { NodeType } from '../../types';
import { RobotOutlined, ApiOutlined, FieldTimeOutlined, CodeOutlined, BranchesOutlined, PlayCircleOutlined, StopOutlined, ChromeOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface NodePanelProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => void;
  enabled?: boolean; // 是否启用拖拽功能
}

const NodePanel: React.FC<NodePanelProps> = ({ onDragStart, enabled = true }) => {
  const { token } = theme.useToken();
  
  // 定义节点类型和名称
  const nodeTypes = [
    { type: NodeType.START, label: 'Start', icon: <PlayCircleOutlined />, color: token.colorSuccess },
    { type: NodeType.END, label: 'End', icon: <StopOutlined />, color: token.colorError },
    { type: NodeType.BROWSER_ACTION, label: 'Browser', icon: <ChromeOutlined />, color: token.colorInfo },
    { type: NodeType.DELAY, label: 'Delay', icon: <FieldTimeOutlined />, color: token.colorWarning },
    { type: NodeType.API_CALL, label: 'API', icon: <ApiOutlined />, color: '#8c8cde' },
    { type: NodeType.SCRIPT, label: 'Script', icon: <CodeOutlined />, color: '#70a4b9' },
    { type: NodeType.DECISION, label: 'Decision', icon: <BranchesOutlined />, color: '#b58863' },
    { type: NodeType.TASK, label: 'Task', icon: <RobotOutlined />, color: token.colorTextSecondary },
  ];
  
  // 将节点分组
  const nodeGroups = [
    {
      title: 'Flow Control',
      nodes: [NodeType.START, NodeType.END, NodeType.DECISION]
    },
    {
      title: 'Actions',
      nodes: [NodeType.BROWSER_ACTION, NodeType.API_CALL, NodeType.SCRIPT, NodeType.DELAY, NodeType.TASK]
    }
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ fontSize: '14px', margin: 0 }}>Node Library</Title>
          {!enabled && (
            <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
              Create workflow first
            </Typography.Text>
          )}
        </div>
      } 
      style={{ width: '100%' }}
      size="small"
      bodyStyle={{ padding: '8px' }}
    >
      {nodeGroups.map((group, groupIndex) => (
        <div key={group.title}>
          {groupIndex > 0 && <Divider style={{ margin: '8px 0' }} />}
          <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
            {group.title}
          </Typography.Text>
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            {nodeTypes
              .filter(node => group.nodes.includes(node.type))
              .map((node) => (
                <div
                  key={node.type}
                  onDragStart={(event) => enabled && onDragStart(event, node.type)}
                  draggable={enabled}
                  style={{
                    padding: '8px 10px',
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderLeft: `3px solid ${node.color}`,
                    borderRadius: '3px',
                    cursor: enabled ? 'grab' : 'not-allowed',
                    backgroundColor: token.colorBgContainer,
                    opacity: enabled ? 1 : 0.6,
                    color: token.colorText,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ color: node.color }}>{node.icon}</span>
                  {node.label}
                </div>
              ))}
          </Space>
        </div>
      ))}
    </Card>
  );
};

export default NodePanel;

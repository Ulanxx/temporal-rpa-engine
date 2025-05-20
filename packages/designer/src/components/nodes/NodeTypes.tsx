import React from 'react';
import { Handle, Position } from 'reactflow';
import { theme } from 'antd';
import { RobotOutlined, ApiOutlined, FieldTimeOutlined, CodeOutlined, BranchesOutlined, PlayCircleOutlined, StopOutlined, ChromeOutlined } from '@ant-design/icons';
import { NodeType } from '../../types';

interface NodeProps {
  data: {
    label: string;
    type: NodeType;
    [key: string]: any;
  };
  selected: boolean;
}

// 获取 Icon 组件根据节点类型
const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case NodeType.START:
      return <PlayCircleOutlined />;
    case NodeType.END:
      return <StopOutlined />;
    case NodeType.BROWSER_ACTION:
      return <ChromeOutlined />;
    case NodeType.DELAY:
      return <FieldTimeOutlined />;
    case NodeType.API_CALL:
      return <ApiOutlined />;
    case NodeType.SCRIPT:
      return <CodeOutlined />;
    case NodeType.DECISION:
      return <BranchesOutlined />;
    case NodeType.TASK:
      return <RobotOutlined />;
    default:
      return null;
  }
};

const commonStyles = {
  padding: '16px 12px',
  borderRadius: '8px',
  color: 'white',
  width: '180px',
  textAlign: 'center' as const,
  fontSize: '14px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease-in-out',
  fontWeight: 500,
  userSelect: 'none' as const,
};

const NodeTypes: React.FC<NodeProps> = ({ data, selected }) => {
  const { type, label } = data;
  
  // 使用 antd 的主题 token
  const { token } = theme.useToken();
  
  const getNodeStyle = () => {
    const baseStyle = {
      ...commonStyles,
      border: selected ? `2px solid ${token.colorPrimaryActive}` : `1px solid ${token.colorBorder}`,
      boxShadow: selected ? `0 0 12px 3px ${token.colorPrimaryBg}` : '0 2px 10px rgba(0,0,0,0.06)',
    };
    
    // 根据节点类型返回不同样式
    switch (type) {
      case NodeType.START:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          borderColor: '#2E7D32',
        };
      case NodeType.END:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #F44336, #C62828)',
          borderColor: '#C62828',
        };
      case NodeType.BROWSER_ACTION:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #2196F3, #1565C0)',
          borderColor: '#1565C0',
        };
      case NodeType.DELAY:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #FF9800, #EF6C00)',
          borderColor: '#EF6C00',
        };
      case NodeType.API_CALL:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
          borderColor: '#7B1FA2',
        };
      case NodeType.SCRIPT:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #607D8B, #455A64)',
          borderColor: '#455A64',
        };
      case NodeType.DECISION:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #795548, #5D4037)',
          borderColor: '#5D4037',
        };
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #9E9E9E, #757575)',
          borderColor: '#757575',
        };
    }
  };
  
  // 开始节点不需要入口，结束节点不需要出口
  const showSourceHandle = type !== NodeType.END;
  const showTargetHandle = type !== NodeType.START;
  // 创建独立的容器，确保覆盖区域足够大，便于用户交互
  const nodeStyle = React.useMemo(() => {
    const baseStyle = getNodeStyle();
    return {
      ...baseStyle,
      // 使用正确的 CSS position 属性，而不是 ReactFlow 的 Position 枚举
      position: 'relative' as const, 
      padding: '20px 10px', // 增加内边距，确保有足够空间放置连接点
    };
  }, [type, selected]);
  
  return (
    <div style={nodeStyle}>
      {/* 入口连接点 - 更大更容易点击 */}
      {showTargetHandle && (
        <>
          {/* 实际可见的连接点 */}
          <Handle
            id={`target-${type}`}
            type="target"
            position={Position.Top}
            style={{ 
              background: token.colorBgContainer, 
              width: '14px', 
              height: '14px', 
              border: `2px solid ${token.colorPrimary}`,
              zIndex: 10,
              boxShadow: '0 0 3px rgba(0,0,0,0.2)' 
            }}
            isConnectable={true}
          />
          
          {/* 不可见的更大的连接区域，增加可点击范围 */}
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '25px',
            cursor: 'crosshair',
            backgroundColor: 'transparent',
          }} />
        </>
      )}
      
      {/* 节点内容 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '22px', marginBottom: '4px' }}>
          {getNodeIcon(type)}
        </div>
        <div style={{ fontWeight: 'bold' }}>{label}</div>
        <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>{type}</div>
      </div>
      
      {/* 出口连接点 - 更大更容易点击 */}
      {showSourceHandle && (
        <>
          {/* 实际可见的连接点 */}
          <Handle
            id={`source-${type}`}
            type="source"
            position={Position.Bottom}
            style={{ 
              background: token.colorBgContainer, 
              width: '14px', 
              height: '14px', 
              border: `2px solid ${token.colorPrimary}`,
              zIndex: 10,
              boxShadow: '0 0 3px rgba(0,0,0,0.2)' 
            }}
            isConnectable={true}
          />
          
          {/* 不可见的更大的连接区域，增加可点击范围 */}
          <div style={{
            position: 'absolute',
            bottom: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '25px',
            cursor: 'crosshair',
            backgroundColor: 'transparent',
          }} />
        </>
      )}
    </div>
  );
};

export default NodeTypes;

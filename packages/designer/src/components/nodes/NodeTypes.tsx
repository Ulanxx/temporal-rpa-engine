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


const commonStyles = {
  padding: '10px 8px',
  borderRadius: '4px',
  color: 'rgba(0, 0, 0, 0.85)',
  width: '140px',
  textAlign: 'center' as const,
  fontSize: '13px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease-in-out',
  fontWeight: 500,
  userSelect: 'none' as const,
  background: 'white',
};

const NodeTypes: React.FC<NodeProps> = ({ data, selected }) => {
  const { type, label } = data;
   // 使用 antd 的主题 token
   const { token } = theme.useToken();
// 获取节点图标的颜色
const getIconColor = (type: NodeType) => {
  switch (type) {
    case NodeType.START:
      return token.colorSuccess;
    case NodeType.END:
      return token.colorError;
    case NodeType.BROWSER_ACTION:
      return token.colorInfo;
    case NodeType.DELAY:
      return token.colorWarning;
    case NodeType.API_CALL:
      return '#8c8cde';
    case NodeType.SCRIPT:
      return '#70a4b9';
    case NodeType.DECISION:
      return '#b58863';
    default:
      return token.colorTextSecondary;
  }
};

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
 
  
  const getNodeStyle = () => {
    const baseStyle = {
      ...commonStyles,
      border: selected ? `2px solid ${token.colorPrimaryActive}` : `1px solid ${token.colorBorder}`,
      boxShadow: selected ? `0 0 5px 2px ${token.colorPrimaryBg}` : '0 1px 3px rgba(0,0,0,0.06)',
    };
    
    // 根据节点类型返回不同样式 - 使用更柔和的颜色
    switch (type) {
      case NodeType.START:
        return {
          ...baseStyle,
          borderLeft: `4px solid ${token.colorSuccess}`,
          color: token.colorTextSecondary,
        };
      case NodeType.END:
        return {
          ...baseStyle,
          borderLeft: `4px solid ${token.colorError}`,
          color: token.colorTextSecondary,
        };
      case NodeType.BROWSER_ACTION:
        return {
          ...baseStyle,
          borderLeft: `4px solid ${token.colorInfo}`,
          color: token.colorTextSecondary,
        };
      case NodeType.DELAY:
        return {
          ...baseStyle,
          borderLeft: `4px solid ${token.colorWarning}`,
          color: token.colorTextSecondary,
        };
      case NodeType.API_CALL:
        return {
          ...baseStyle,
          borderLeft: `4px solid #8c8cde`,
          color: token.colorTextSecondary,
        };
      case NodeType.SCRIPT:
        return {
          ...baseStyle,
          borderLeft: `4px solid #70a4b9`,
          color: token.colorTextSecondary,
        };
      case NodeType.DECISION:
        return {
          ...baseStyle,
          borderLeft: `4px solid #b58863`,
          color: token.colorTextSecondary,
        };
      default:
        return {
          ...baseStyle,
          borderLeft: `4px solid ${token.colorTextQuaternary}`,
          color: token.colorTextSecondary,
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
      padding: '12px 8px', // 减小内边距，让节点更紧凑
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
              width: '10px', 
              height: '10px', 
              border: `1px solid ${token.colorPrimary}`,
              zIndex: 10,
              boxShadow: '0 0 2px rgba(0,0,0,0.1)' 
            }}
            isConnectable={true}
          />
          
          {/* 不可见的更大的连接区域，增加可点击范围 */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '20px',
            cursor: 'crosshair',
            backgroundColor: 'transparent',
          }} />
        </>
      )}
      
      {/* 节点内容 */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
        <div style={{ fontSize: '16px', color: getIconColor(type) }}>
          {getNodeIcon(type)}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'left' }}>{label}</div>
          <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 'normal', textAlign: 'left' }}>{type}</div>
        </div>
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
              width: '10px', 
              height: '10px', 
              border: `1px solid ${token.colorPrimary}`,
              zIndex: 10,
              boxShadow: '0 0 2px rgba(0,0,0,0.1)' 
            }}
            isConnectable={true}
          />
          
          {/* 不可见的更大的连接区域，增加可点击范围 */}
          <div style={{
            position: 'absolute',
            bottom: '-10px',
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

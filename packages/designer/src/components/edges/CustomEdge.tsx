import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = data?.label || '';
  const condition = data?.condition || '';

  return (
    <>
      <path
        id={id}
        style={{
          stroke: '#555',
          strokeWidth: 2,
          ...style,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <text
          style={{
            fill: '#888',
            fontSize: '10px',
            fontWeight: 700,
            backgroundColor: 'white',
            padding: '2px',
          }}
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="react-flow__edge-text"
        >
          {label}
        </text>
      )}
      {condition && (
        <text
          style={{
            fill: '#666',
            fontSize: '8px',
            fontStyle: 'italic',
          }}
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 + 10}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="react-flow__edge-text"
        >
          {`条件: ${condition}`}
        </text>
      )}
    </>
  );
};

export default CustomEdge;

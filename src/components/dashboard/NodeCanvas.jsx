import React, { useEffect, useRef, useState } from 'react';
import Node from './Node';
import { motion } from 'framer-motion';

// Helper: spiral initial positions (larger radius)
function getSpiralPositions(count, width, height, radiusStep = 200) {
  const positions = [];
  let angle = 0;
  let radius = 320;
  for (let i = 0; i < count; i++) {
    angle = i * (Math.PI * 2) / Math.max(4, count);
    positions.push({
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    });
    radius += radiusStep * 0.22;
  }
  return positions;
}

// Force simulation with stronger collision and repulsion
const useForceLayout = (nodes, width, height) => {
  const nodeRadii = nodes.map(n => n.type === 'project' ? 60 : n.type === 'stat' ? 50 : 45);
  const [positions, setPositions] = useState(() => getSpiralPositions(nodes.length, width, height));

  useEffect(() => {
    let animation;
    const alpha = 0.13;
    const repulsion = 40000;
    const centering = 0.10;
    const attraction = 0.07;
    const collisionPadding = 30;
    const center = { x: width / 2, y: height / 2 };

    function step() {
      setPositions((prev) => {
        const next = prev.map((p, i) => ({ ...p }));
        // Repulsion
        for (let i = 0; i < next.length; i++) {
          for (let j = 0; j < next.length; j++) {
            if (i === j) continue;
            const dx = next[i].x - next[j].x;
            const dy = next[i].y - next[j].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const force = repulsion / (dist * dist);
            next[i].vx += (dx / dist) * force * alpha;
            next[i].vy += (dy / dist) * force * alpha;
            // Collision force
            const minDist = (nodeRadii[i] + nodeRadii[j]) / 2 + collisionPadding;
            if (dist < minDist) {
              const push = (minDist - dist) * 0.35;
              next[i].vx += (dx / dist) * push;
              next[i].vy += (dy / dist) * push;
            }
          }
        }
        // Centering
        for (let i = 0; i < next.length; i++) {
          next[i].vx += (center.x - next[i].x) * centering * alpha;
          next[i].vy += (center.y - next[i].y) * centering * alpha;
        }
        // Attraction (for related nodes)
        for (let i = 0; i < next.length; i++) {
          const node = nodes[i];
          if (node.type === 'project') {
            // Attract to stats and actions
            for (let j = 0; j < next.length; j++) {
              if (nodes[j].type === 'stat' || nodes[j].type === 'action') {
                const dx = next[j].x - next[i].x;
                const dy = next[j].y - next[i].y;
                next[i].vx += dx * attraction * alpha;
                next[i].vy += dy * attraction * alpha;
              }
            }
          }
        }
        // Update positions
        for (let i = 0; i < next.length; i++) {
          next[i].x += next[i].vx;
          next[i].y += next[i].vy;
          // Damping
          next[i].vx *= 0.85;
          next[i].vy *= 0.85;
        }
        return next;
      });
      animation = requestAnimationFrame(step);
    }
    animation = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animation);
  }, [nodes, width, height]);

  return positions;
};

const getConnections = (nodes) => {
  // Example: connect actions to all projects, stats to all projects
  const connections = [];
  nodes.forEach((a, i) => {
    if (a.type === 'action' || a.type === 'stat') {
      nodes.forEach((b, j) => {
        if (b.type === 'project') {
          connections.push([i, j]);
        }
      });
    }
  });
  return connections;
};

const NodeCanvas = ({ nodes }) => {
  const width = 1400;
  const height = 900;
  const positions = useForceLayout(nodes, width, height);
  const connections = getConnections(nodes);

  return (
    <div className="relative w-full min-h-screen overflow-auto" style={{ minHeight: height }}>
      {/* SVG for animated connections */}
      <svg width={width} height={height} className="absolute left-0 top-0 pointer-events-none z-0">
        {connections.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={positions[a]?.x}
            y1={positions[a]?.y}
            x2={positions[b]?.x}
            y2={positions[b]?.y}
            stroke="#38bdf8"
            strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 1, delay: i * 0.03 }}
          />
        ))}
      </svg>
      {/* Nodes */}
      {nodes.map((node, i) => (
        <Node key={node.id} node={node} pos={positions[i]} />
      ))}
    </div>
  );
};

export default NodeCanvas; 
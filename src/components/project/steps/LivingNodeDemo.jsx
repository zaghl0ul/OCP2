import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Tag, Share2, Zap } from "lucide-react";

const actionNodes = [
  {
    key: "preview",
    icon: <Play />,
    label: "Preview",
    color: "bg-blue-500",
  },
  {
    key: "tag",
    icon: <Tag />,
    label: "Tag",
    color: "bg-green-500",
  },
  {
    key: "share",
    icon: <Share2 />,
    label: "Share",
    color: "bg-purple-500",
  },
  {
    key: "ai",
    icon: <Zap />,
    label: "AI Suggest",
    color: "bg-yellow-500",
  },
];

export default function LivingNodeDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div
        className="relative"
        initial={false}
        animate={{
          scale: expanded ? 1.1 : 1,
          boxShadow: expanded
            ? "0 0 60px 10px #38bdf8, 0 0 0 8px #fff2"
            : "0 0 30px 2px #38bdf8",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* Central Video Node */}
        <motion.button
          className="w-32 h-32 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg border-4 border-white/20"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setExpanded((e) => !e)}
          aria-label="Video Node"
        >
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 0 0 0 #38bdf8",
                "0 0 40px 10px #38bdf8",
                "0 0 0 0 #38bdf8",
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.15" />
              <polygon
                points="10,8 16,12 10,16"
                fill="#fff"
                stroke="#fff"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        </motion.button>

        {/* Branching Action Nodes */}
        <AnimatePresence>
          {expanded &&
            actionNodes.map((node, i) => {
              // Position nodes in a circle
              const angle = (i / actionNodes.length) * 2 * Math.PI;
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <motion.button
                  key={node.key}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl ${node.color}`}
                  style={{
                    x,
                    y,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1 + i * 0.07,
                  }}
                  whileHover={{ scale: 1.15, boxShadow: "0 0 30px 5px #fff8" }}
                  aria-label={node.label}
                >
                  <span className="mb-1">{node.icon}</span>
                  <span className="text-xs font-semibold">{node.label}</span>
                </motion.button>
              );
            })}
        </AnimatePresence>
      </motion.div>
      <div className="mt-10 text-center text-gray-200 max-w-xl">
        <h2 className="text-2xl font-bold mb-2">Living Node UI Demo</h2>
        <p>
          This node pulses with life. Click it to reveal context-aware actions that branch out organically. The UI adapts, learns, and maximizes your productivity—making every interaction feel magical and efficient.
        </p>
      </div>
    </div>
  );
} 
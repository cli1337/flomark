import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './ui/Card'
import { MoveRight } from 'lucide-react'
import { cn } from '../utils/cn'

const TaskMoveAnimation = ({ 
  task, 
  fromPosition, 
  toPosition, 
  onComplete,
  isVisible = true 
}) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!isVisible || !toPosition || !task) return

    // Show for duration then complete
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => {
        onComplete?.()
      }, 300) // Wait for exit animation
    }, 800) // Total display duration
    
    return () => clearTimeout(timer)
  }, [toPosition, isVisible, onComplete, task])

  if (!isVisible || !toPosition || !task) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.8,
            y: -20
          }}
          animate={{ 
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{ 
            opacity: 0,
            scale: 0.95,
            y: 10
          }}
          transition={{ 
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${toPosition.x}px`,
            top: `${toPosition.y}px`,
            transform: 'translate(-50%, -50%)',
            width: '300px',
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg blur-xl"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
            }}
          />

          <Card className="relative shadow-2xl border-2 border-blue-400/60 bg-white/10 backdrop-blur-md">
            <CardContent className="p-4">
              {/* Moving indicator */}
              <motion.div 
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.6, 1]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity 
                  }}
                />
                <MoveRight className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">
                  Moved here
                </span>
              </motion.div>

              {/* Task info */}
              <motion.div 
                className="flex items-start gap-2 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-medium text-white text-sm line-clamp-2 flex-1">
                  {task.name}
                </h4>
              </motion.div>
            
              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.labels.slice(0, 3).map((label, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ 
                        backgroundColor: (typeof label === 'string' ? '#ef4444' : label.color),
                        color: 'white'
                      }}
                    >
                      {typeof label === 'string' ? label : label.name}
                    </motion.span>
                  ))}
                </div>
              )}
            
              {/* Pulse indicator */}
              <motion.div
                className="flex items-center gap-2 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default TaskMoveAnimation

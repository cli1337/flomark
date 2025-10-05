import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent } from './ui/Card'
import { cn } from '../utils/cn'

const TaskMoveAnimation = ({ 
  task, 
  fromPosition, 
  toPosition, 
  onComplete,
  isVisible = true 
}) => {
  const [animationPhase, setAnimationPhase] = useState('preparing') // preparing, moving, completing
  const [currentPosition, setCurrentPosition] = useState(fromPosition)
  const taskRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    if (!isVisible || !fromPosition || !toPosition) return

    const animate = () => {
      setAnimationPhase('moving')
      

      const startTime = performance.now()
      const duration = 600 // 600ms animation
      
      const animateFrame = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        

        const easeInOutCubic = (t) => {
          return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
        }
        
        const easedProgress = easeInOutCubic(progress)
        

        const newX = fromPosition.x + (toPosition.x - fromPosition.x) * easedProgress
        const newY = fromPosition.y + (toPosition.y - fromPosition.y) * easedProgress
        
        setCurrentPosition({ x: newX, y: newY })
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateFrame)
        } else {
          setAnimationPhase('completing')

          setTimeout(() => {
            onComplete?.()
          }, 100)
        }
      }
      
      animationRef.current = requestAnimationFrame(animateFrame)
    }


    const timer = setTimeout(animate, 100)
    
    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [fromPosition, toPosition, isVisible, onComplete])

  if (!isVisible || !fromPosition || !toPosition || !task) {
    return null
  }

  return createPortal(
    <div
      ref={taskRef}
      className={cn(
        "fixed z-50 pointer-events-none",
        "transition-opacity duration-200",
        animationPhase === 'preparing' && "opacity-0",
        animationPhase === 'moving' && "opacity-100",
        animationPhase === 'completing' && "opacity-0"
      )}
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        transform: 'translate(-50%, -50%)',
        width: '320px', // Match task card width
      }}
    >
      <Card className="shadow-2xl border-2 border-blue-400 bg-blue-50/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {task.name}
            </h4>
          </div>
          
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.slice(0, 3).map((label, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ 
                    backgroundColor: (typeof label === 'string' ? '#3B82F6' : label.color) + '20',
                    color: typeof label === 'string' ? '#3B82F6' : label.color
                  }}
                >
                  {typeof label === 'string' ? label : label.name}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Moving to new column...
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  )
}

export default TaskMoveAnimation

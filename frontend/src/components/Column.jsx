import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react'
import { cn } from '../utils/cn'
import TaskCard from './TaskCard'

const Column = ({ 
  list, 
  tasks = [], 
  isDragging = false,
  hasPendingUpdate = false,
  onAddTask,
  onEditList,
  onDeleteList,
  onTaskClick,
  useOptimisticUpdates,
  onRegisterTaskElement
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: list.id })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${list.id}`,
  })

  const [isHovered, setIsHovered] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  }

  const taskIds = tasks.map(task => task.id)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex-shrink-0 w-96 sm:w-[28rem] dnd-item",
        isDragging && "dragging column-dragging",
        isSortableDragging && "opacity-50",
        hasPendingUpdate && "optimistic-pending"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="h-fit min-h-24 bg-white border border-gray-200 shadow-sm overflow-hidden"
        data-list-id={list.id}
      >
        <CardContent className="p-4">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Drag Handle */}
              <motion.div 
                className={cn(
                  "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </motion.div>
              
              {/* Column Title */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <motion.div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: list.color || '#3B82F6' }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {list.name}
                </h3>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Badge variant="secondary" className="text-xs">
                    {tasks.length}
                  </Badge>
                </motion.div>
              </div>
            </div>

            {/* Column Actions */}
            <motion.div 
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditList(list)
                }}
                className="h-6 w-6 p-0"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </motion.div>
          </div>

          {/* Tasks Container */}
          <motion.div
            ref={setDroppableRef}
            className={cn(
              "min-h-20 space-y-2 transition-all duration-200 rounded-lg",
              isOver && "drop-zone-active"
            )}
            animate={{
              backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
            }}
            transition={{ duration: 0.2 }}
          >
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      duration: 0.2,
                      delay: index * 0.03
                    }}
                    layout
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      hasPendingUpdate={useOptimisticUpdates?.hasPendingUpdate(task.id)}
                      onRegisterElement={onRegisterTaskElement}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>

            {/* Add Task Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                className="w-full h-10 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                onClick={() => onAddTask(list)}
              >
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 mr-2" />
                <span className="text-gray-500 group-hover:text-gray-700">Add a card</span>
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Column

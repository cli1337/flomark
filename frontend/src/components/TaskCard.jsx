import React, { useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/Card'
import { Checkbox } from './ui/Checkbox'
import { Badge } from './ui/Badge'
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar'
import { Calendar, Users, CheckCircle2, GripVertical } from 'lucide-react'
import { cn } from '../utils/cn'

const TaskCard = ({ 
  task, 
  isDragging = false, 
  hasPendingUpdate = false,
  onClick,
  onRegisterElement 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  }


  useEffect(() => {
    if (onRegisterElement) {
      onRegisterElement(task.id, setNodeRef)
    }
  }, [onRegisterElement, task.id])

  const totalSubtasks = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "task-card",
        hasPendingUpdate && "optimistic-pending",
      )}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          "group cursor-pointer dnd-item relative overflow-hidden",
          "border border-gray-200 bg-white transition-all duration-200",
          isDragging && "dragging",
          isSortableDragging && "opacity-50",
          hasPendingUpdate && "bg-blue-50 border-blue-200",
          "transform-gpu"
        )}
        onClick={onClick}
        {...attributes}
        {...listeners}
      >
        {/* Hover gradient effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/50 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />

        <CardContent className="p-4 relative">
          {/* Task Title */}
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
              {task.name}
            </h4>

            {/* Drag Handle */}
            <motion.div 
              className="ml-2 opacity-0 group-hover:opacity-100"
              initial={{ opacity: 0, x: -5 }}
              whileHover={{ opacity: 1, x: 0, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
            </motion.div>
          </div>

          {/* Description */}
          {task.description && (
            <motion.p 
              className="text-xs text-gray-600 mb-3 line-clamp-2"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              {task.description}
            </motion.p>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.labels.map((label, index) => (
                <motion.div
                  key={label.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5"
                    style={{ backgroundColor: label.color + '20', color: label.color }}
                  >
                    {label.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {totalSubtasks > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-blue-500 h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <motion.div 
              className="flex items-center gap-1 mb-3"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </motion.div>
          )}

          {/* Members */}
          {task.members && task.members.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-400" />
                <div className="flex -space-x-1">
                  {task.members.slice(0, 3).map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ scale: 0, x: -10 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                    >
                      <Avatar className="w-6 h-6 border-2 border-white">
                        {member.profileImage && (
                          <AvatarImage 
                            src={`/api/storage/photos/${member.profileImage}`} 
                            alt={member.name} 
                          />
                        )}
                        <AvatarFallback className="text-xs bg-gray-100">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  ))}
                  {task.members.length > 3 && (
                    <motion.div 
                      className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-xs text-gray-600">
                        +{task.members.length - 3}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-1">
                {task.status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </motion.div>
                )}
                {hasPendingUpdate && (
                  <motion.div 
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity 
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default TaskCard

import React, { useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from './ui/Card'
import { Checkbox } from './ui/Checkbox'
import { Badge } from './ui/Badge'
import { Avatar, AvatarFallback } from './ui/Avatar'
import { Calendar, Users, CheckCircle2 } from 'lucide-react'
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
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-pointer dnd-item",
        "border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
        isDragging && "dragging",
        isSortableDragging && "opacity-50",
        hasPendingUpdate && "optimistic-pending bg-blue-50 border-blue-200",
        "transform-gpu" // Enable hardware acceleration
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        {/* Task Title */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
            {task.name}
          </h4>

          {/* Drag Handle */}
          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-4 h-4 flex flex-col gap-0.5 cursor-grab active:cursor-grabbing">
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs px-2 py-0.5"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.name}
              </Badge>
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
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 mb-3">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Members */}
        {task.members && task.members.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-400" />
              <div className="flex -space-x-1">
                {task.members.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                    <AvatarFallback className="text-xs bg-gray-100">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      +{task.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-1">
              {task.status === 'completed' && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {hasPendingUpdate && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TaskCard

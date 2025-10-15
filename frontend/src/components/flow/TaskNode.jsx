import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Calendar, Users, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const TaskNode = ({ data, isConnectable }) => {
  const task = data.task
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-900/20'
      case 'in-progress':
        return 'border-blue-500 bg-blue-900/20'
      default:
        return 'border-white/20 bg-white/5'
    }
  }

  const formatDeadline = (deadline) => {
    if (!deadline) return null
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' }
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-400' }
    if (diffDays <= 3) return { text: `${diffDays}d`, color: 'text-yellow-400' }
    return { text: date.toLocaleDateString(), color: 'text-gray-400' }
  }

  const deadline = formatDeadline(task.dueDate)

  return (
    <div className="task-flow-node">
      {/* Input Handle - Top */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-blue-500 border-2 border-gray-800"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`w-72 border-2 ${getStatusColor(task.status)} shadow-lg cursor-pointer hover:shadow-xl transition-all backdrop-blur-sm`}
          onClick={() => data.onTaskClick && data.onTaskClick(task)}
        >
          <CardContent className="p-4">
            {/* Task Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm leading-tight mb-1">
                  {task.name}
                </h3>
                {data.listName && (
                  <span className="text-xs text-gray-400">
                    {data.listName}
                  </span>
                )}
              </div>
              {task.status === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 ml-2" />
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.labels.slice(0, 3).map((label, index) => (
                  <Badge
                    key={label.id || index}
                    variant="secondary"
                    className="text-xs px-2 py-0.5"
                    style={{ backgroundColor: label.color + '20', color: label.color }}
                  >
                    {label.name}
                  </Badge>
                ))}
                {task.labels.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{task.labels.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Progress
                  </span>
                  <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Due Date */}
              {deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className={`text-xs font-medium ${deadline.color.replace('text-', 'text-').replace('600', '400')}`}>
                    {deadline.text}
                  </span>
                </div>
              )}

              {/* Members */}
              {task.members && task.members.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <div className="flex -space-x-1">
                    {task.members.slice(0, 3).map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-white"
                        title={member.name}
                      >
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    ))}
                    {task.members.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-gray-300">
                        +{task.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Output Handle - Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-blue-500 border-2 border-gray-800"
      />
    </div>
  )
}

export default TaskNode

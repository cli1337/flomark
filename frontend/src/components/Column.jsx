import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex-shrink-0 w-96 sm:w-[28rem] dnd-item",
        isDragging && "dragging",
        isSortableDragging && "opacity-50",
        hasPendingUpdate && "optimistic-pending"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className="h-fit min-h-24 bg-white border border-gray-200 shadow-sm"
        data-list-id={list.id}
      >
        <CardContent className="p-4">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Drag Handle */}
              <div 
                className={cn(
                  "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              
              {/* Column Title */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: list.color || '#3B82F6' }}
                />
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {list.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {tasks.length}
                </Badge>
              </div>
            </div>

            {/* Column Actions */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
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
            </div>
          </div>

          {/* Tasks Container */}
          <div
            ref={setDroppableRef}
            className={cn(
              "min-h-20 space-y-2 transition-all duration-200",
              isOver && "drag-over bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg p-2 -m-2"
            )}
          >
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  hasPendingUpdate={useOptimisticUpdates?.hasPendingUpdate(task.id)}
                  onRegisterElement={onRegisterTaskElement}
                />
              ))}
            </SortableContext>

            {/* Add Task Button */}
            <Button
              variant="ghost"
              className="w-full h-10 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
              onClick={() => onAddTask(list)}
            >
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 mr-2" />
              <span className="text-gray-500 group-hover:text-gray-700">Add a card</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Column

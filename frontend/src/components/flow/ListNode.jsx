import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card, CardContent } from '../ui/Card'
import { List as ListIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const ListNode = ({ data, isConnectable }) => {
  return (
    <div className="list-flow-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-purple-500 border-2 border-gray-800"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-56 border-2 border-purple-500/50 bg-purple-900/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: data.color || '#a855f7' }}
              >
                <ListIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm uppercase tracking-wide truncate">
                  {data.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {data.taskCount} {data.taskCount === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-purple-500 border-2 border-gray-800"
      />
    </div>
  )
}

export default ListNode

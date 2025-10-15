import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'

import Layout from '../../components/Layout'
import TaskNode from '../../components/flow/TaskNode'
import ListNode from '../../components/flow/ListNode'
import LoadingState from '../../components/ui/LoadingState'
import { Button } from '../../components/ui/Button'
import TaskModal from '../../components/TaskModal'
import { projectService } from '../../services/projectService'
import { taskService } from '../../services/taskService'
import { useToast } from '../../contexts/ToastContext'
import usePageTitle from '../../hooks/usePageTitle'
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  LayoutGrid,
  ListTree,
  Workflow,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

// Custom node types
const nodeTypes = {
  taskNode: TaskNode,
  listNode: ListNode,
}

// Layout algorithms
const layoutAlgorithms = {
  hierarchical: 'Hierarchical',
  workflow: 'Workflow',
  grid: 'Grid',
}

const ProjectFlowView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const [project, setProject] = useState(null)
  const [lists, setLists] = useState([])
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [layoutType, setLayoutType] = useState('hierarchical')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  usePageTitle(project ? `${project.name} - Flow View` : 'Flow View')

  // Fetch project data
  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await projectService.getProjectDataOptimized(id)
      
      if (response.success) {
        const { project, lists, tasks } = response.data
        setProject(project)
        setLists(lists || [])
        setTasks(tasks || {})
      } else {
        showError('Project not found', 'The project you are looking for does not exist')
        navigate('/projects')
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
      showError('Failed to load project', 'Please try again later')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }, [id, showError, navigate])

  // Generate nodes and edges based on layout type
  const generateLayout = useCallback(() => {
    const newNodes = []
    const newEdges = []
    let nodeId = 0

    switch (layoutType) {
      case 'hierarchical':
        // Lists at the top, tasks below
        lists.forEach((list, listIndex) => {
          const listTasks = tasks[list.id] || []
          const x = listIndex * 350
          
          // Add list node
          newNodes.push({
            id: `list-${list.id}`,
            type: 'listNode',
            position: { x, y: 0 },
            data: {
              name: list.name,
              color: list.color,
              taskCount: listTasks.length,
            },
          })

          // Add task nodes below the list
          listTasks.forEach((task, taskIndex) => {
            const taskNodeId = `task-${task.id}`
            newNodes.push({
              id: taskNodeId,
              type: 'taskNode',
              position: { x: x - 40, y: 150 + taskIndex * 200 },
              data: {
                task,
                listName: list.name,
                onTaskClick: handleTaskClick,
              },
            })

            // Connect list to task
            newEdges.push({
              id: `edge-list-${list.id}-task-${task.id}`,
              source: `list-${list.id}`,
              target: taskNodeId,
              type: 'smoothstep',
              animated: false,
              style: { stroke: list.color || '#3b82f6', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: list.color || '#3b82f6',
              },
            })
          })
        })
        break

      case 'workflow':
        // Tasks in workflow order (left to right by list)
        let currentX = 0
        lists.forEach((list, listIndex) => {
          const listTasks = tasks[list.id] || []
          const maxY = Math.max(listTasks.length * 220, 400)
          
          listTasks.forEach((task, taskIndex) => {
            const taskNodeId = `task-${task.id}`
            newNodes.push({
              id: taskNodeId,
              type: 'taskNode',
              position: { 
                x: currentX, 
                y: taskIndex * 220 + 50 
              },
              data: {
                task,
                listName: list.name,
                onTaskClick: handleTaskClick,
              },
            })

            // Connect to next list's first task
            if (listIndex < lists.length - 1) {
              const nextList = lists[listIndex + 1]
              const nextListTasks = tasks[nextList.id] || []
              if (nextListTasks.length > 0 && taskIndex === 0) {
                newEdges.push({
                  id: `edge-${task.id}-to-next`,
                  source: taskNodeId,
                  target: `task-${nextListTasks[0].id}`,
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: '#6366f1', strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#6366f1',
                  },
                })
              }
            }
          })
          
          currentX += 400
        })
        break

      case 'grid':
        // Grid layout
        const columns = 3
        let taskArray = []
        lists.forEach(list => {
          const listTasks = tasks[list.id] || []
          listTasks.forEach(task => {
            taskArray.push({ task, listName: list.name })
          })
        })

        taskArray.forEach((item, index) => {
          const col = index % columns
          const row = Math.floor(index / columns)
          
          newNodes.push({
            id: `task-${item.task.id}`,
            type: 'taskNode',
            position: { 
              x: col * 320, 
              y: row * 280 
            },
            data: {
              task: item.task,
              listName: item.listName,
              onTaskClick: handleTaskClick,
            },
          })
        })
        break

      default:
        break
    }

    setNodes(newNodes)
    setEdges(newEdges)
  }, [lists, tasks, layoutType])

  // Handle task click
  const handleTaskClick = async (task) => {
    try {
      const response = await taskService.getTaskById(task.id)
      if (response.success) {
        setSelectedTask(response.data)
        setShowTaskModal(true)
      }
    } catch (error) {
      console.error('Error fetching task details:', error)
      showError('Failed to load task', 'Please try again later')
    }
  }

  // Handle connection between nodes (for future dependency feature)
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          },
          eds
        )
      )
      showSuccess('Dependency created', 'Task dependency has been added (demo)')
    },
    [showSuccess]
  )

  // Export flow as image (future feature)
  const handleExport = () => {
    showSuccess('Export', 'Export feature coming soon!')
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    if (id) {
      fetchProjectData()
    }
  }, [id, fetchProjectData])

  useEffect(() => {
    if (!loading && lists.length > 0) {
      generateLayout()
    }
  }, [loading, lists, tasks, layoutType, generateLayout])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingState message="Loading flow view..." />
        </div>
      </Layout>
    )
  }

  const FlowContent = () => (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-[#18191b]' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#18191b]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${id}`)}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Board
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-xl font-bold text-white">{project?.name}</h1>
            <p className="text-sm text-gray-400">Flow View</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <Button
              variant={layoutType === 'hierarchical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayoutType('hierarchical')}
              className="flex items-center gap-2"
              title="Hierarchical Layout"
            >
              <ListTree className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutType === 'workflow' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayoutType('workflow')}
              className="flex items-center gap-2"
              title="Workflow Layout"
            >
              <Workflow className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutType === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayoutType('grid')}
              className="flex items-center gap-2"
              title="Grid Layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 bg-[#18191b]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-[#18191b]"
        >
          <Background color="#333" gap={16} />
          <Controls className="bg-[#1f2937] shadow-lg rounded-lg border border-white/10 [&>button]:bg-[#374151] [&>button]:border-white/10 [&>button]:text-white [&>button:hover]:bg-[#4b5563]" />
          <MiniMap
            className="bg-[#1f2937] shadow-lg rounded-lg border border-white/10"
            nodeColor={(node) => {
              switch (node.type) {
                case 'taskNode':
                  return '#3b82f6'
                case 'listNode':
                  return '#a855f7'
                default:
                  return '#6b7280'
              }
            }}
            maskColor="rgba(0, 0, 0, 0.6)"
          />

          {/* Legend Panel */}
          <Panel position="top-left" className="bg-[#1f2937]/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-300">Task</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-300">List/Column</span>
              </div>
            </div>
          </Panel>

          {/* Stats Panel */}
          <Panel position="top-right" className="bg-[#1f2937]/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">Statistics</h3>
            <div className="space-y-1">
              <div className="text-xs text-gray-300">
                <span className="font-medium">Lists:</span> {lists.length}
              </div>
              <div className="text-xs text-gray-300">
                <span className="font-medium">Tasks:</span> {Object.values(tasks).flat().length}
              </div>
              <div className="text-xs text-gray-300">
                <span className="font-medium">Layout:</span> {layoutAlgorithms[layoutType]}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
        }}
        onUpdate={async (updatedTask) => {
          setSelectedTask(updatedTask)
          // Refresh flow view
          await fetchProjectData()
        }}
      />
    </div>
  )

  return (
    <Layout>
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </Layout>
  )
}

export default ProjectFlowView

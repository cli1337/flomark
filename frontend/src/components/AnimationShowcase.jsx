import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { 
  Sparkles, 
  Move, 
  Layers, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users
} from 'lucide-react'

const AnimationShowcase = () => {
  const [showCardAnimation, setShowCardAnimation] = useState(false)
  const [showColumnAnimation, setShowColumnAnimation] = useState(false)
  const [animatingCard, setAnimatingCard] = useState(null)

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  }

  const columnVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        staggerChildren: 0.1
      }
    }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(59, 130, 246, 0.4)",
        "0 0 0 10px rgba(59, 130, 246, 0)",
        "0 0 0 0 rgba(59, 130, 246, 0)"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity
      }
    }
  }

  const slideAnimation = {
    initial: { x: -300, opacity: 0 },
    animate: { 
      x: 300, 
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 2,
        times: [0, 0.1, 0.9, 1],
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  }

  const demoCard = {
    id: 1,
    name: "Implement drag and drop animations",
    description: "Add smooth Atlassian-style animations to task cards",
    labels: [
      { id: 1, name: "Feature", color: "#3B82F6" },
      { id: 2, name: "UI", color: "#8B5CF6" }
    ],
    progress: 75,
    dueDate: new Date(Date.now() + 86400000),
    members: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Atlassian-Style Board Animations
          </h1>
          <p className="text-gray-300 text-lg">
            Smooth, professional drag & drop animations for your task manager
          </p>
        </motion.div>

        {/* Animation Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card Hover Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Move className="w-5 h-5" />
                  Card Hover Effect
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Cards lift up smoothly on hover with shadow effects
                </p>
                
                <motion.div
                  className="task-card"
                  whileHover={{ 
                    y: -8, 
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Sample Task Card</h4>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-100 text-blue-700">Feature</Badge>
                        <Badge className="bg-purple-100 text-purple-700">High Priority</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Drag Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Drag Effect
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Cards rotate and scale when being dragged
                </p>
                
                <motion.div
                  className="dnd-item dragging"
                  animate={{
                    rotate: [0, 3, -3, 3, 0],
                    scale: [1, 1.03, 1.03, 1.03, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <Card className="bg-white shadow-2xl">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Dragging Task</h4>
                      <p className="text-sm text-gray-600">Watch the rotation effect</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Drop Zone Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Drop Zone Indicator
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Active drop zones pulse with color
                </p>
                
                <motion.div
                  className="drop-zone-active p-6 rounded-lg min-h-[100px] flex items-center justify-center"
                  variants={pulseVariants}
                  animate="pulse"
                >
                  <p className="text-blue-500 font-medium">Drop Here</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card Movement Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Card Movement
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Cards smoothly transition between columns
                </p>
                
                <div className="relative h-24 bg-black/20 rounded-lg overflow-hidden">
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2"
                    variants={slideAnimation}
                    initial="initial"
                    animate="animate"
                  >
                    <Card className="bg-blue-500 border-2 border-blue-400 w-32">
                      <CardContent className="p-2">
                        <p className="text-white text-xs font-medium">Moving...</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Live Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Interactive Demo
              </h2>
              
              <div className="flex gap-4 justify-center mb-6">
                <Button
                  onClick={() => {
                    setShowCardAnimation(!showCardAnimation)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Toggle Card Animation
                </Button>
                <Button
                  onClick={() => {
                    setAnimatingCard(Date.now())
                    setTimeout(() => setAnimatingCard(null), 2000)
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Simulate Card Move
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Source Column */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h3 className="text-white font-semibold">To Do</h3>
                  </div>
                  
                  <AnimatePresence mode="popLayout">
                    {showCardAnimation && !animatingCard && (
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Card className="bg-white">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {demoCard.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {demoCard.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {demoCard.labels.map(label => (
                                <Badge
                                  key={label.id}
                                  style={{ 
                                    backgroundColor: label.color + '20',
                                    color: label.color
                                  }}
                                >
                                  {label.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">Tomorrow</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">2</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Target Column */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <h3 className="text-white font-semibold">In Progress</h3>
                  </div>
                  
                  {animatingCard && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <Card className="bg-white border-2 border-green-400">
                        <CardContent className="p-4">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <h4 className="font-medium text-gray-900 mb-2">
                              {demoCard.name}
                            </h4>
                            <Badge className="bg-green-100 text-green-700">
                              Moved!
                            </Badge>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Animation Features
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Sparkles className="w-6 h-6" />,
                    title: "Smooth Transitions",
                    description: "All animations use spring physics for natural movement"
                  },
                  {
                    icon: <Move className="w-6 h-6" />,
                    title: "Drag Feedback",
                    description: "Visual indicators show where items will be dropped"
                  },
                  {
                    icon: <Layers className="w-6 h-6" />,
                    title: "Layered Effects",
                    description: "Shadows and depth create a 3D-like experience"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-6 bg-white/5 rounded-lg"
                  >
                    <motion.div
                      className="inline-block text-blue-400 mb-3"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AnimationShowcase


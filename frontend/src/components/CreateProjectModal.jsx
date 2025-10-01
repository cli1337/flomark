import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { 
  X, 
  Building2, 
  Upload, 
  Check,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react'
import { projectService } from '../services/projectService'
import { useToast } from '../contexts/ToastContext'

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const { showSuccess, showError } = useToast()
  const [step, setStep] = useState(1)
  const [projectData, setProjectData] = useState({
    name: '',
    image: null,
    imagePreview: null,
    skipImage: false
  })
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProjectData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      showError('Project Name Required', 'Please enter a project name')
      return
    }

    setLoading(true)
    try {
      // Create project
      const response = await projectService.createProject(projectData.name)
      
      if (response.success) {
        const projectId = response.data.id
        
        // Upload image if provided
        if (projectData.image && !projectData.skipImage) {
          try {
            await projectService.uploadProjectImage(projectId, projectData.image)
          } catch (error) {
            console.error('Error uploading image:', error)
            // Don't fail the whole process for image upload errors
          }
        }

        showSuccess('Project Created', `${projectData.name} has been created successfully`)
        onProjectCreated?.(response.data)
        handleClose()
      } else {
        showError('Failed to Create Project', response.message)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      showError('Failed to Create Project', 'Please try again later')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setProjectData({
      name: '',
      image: null,
      imagePreview: null,
      skipImage: false
    })
    onClose()
  }

  const nextStep = () => {
    if (step === 1 && !projectData.name.trim()) {
      showError('Project Name Required', 'Please enter a project name')
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#18191b] border border-white/10 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white text-xl font-semibold">Create New Project</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'
              }`}>
                1
              </div>
              <span className={`text-sm ${step >= 1 ? 'text-white' : 'text-gray-400'}`}>
                Project Name
              </span>
            </div>
            <div className="flex-1 h-px bg-white/10 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'
              }`}>
                2
              </div>
              <span className={`text-sm ${step >= 2 ? 'text-white' : 'text-gray-400'}`}>
                Project Image
              </span>
            </div>
            <div className="flex-1 h-px bg-white/10 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'
              }`}>
                <Check className="h-4 w-4" />
              </div>
              <span className={`text-sm ${step >= 3 ? 'text-white' : 'text-gray-400'}`}>
                Complete
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Project Name</h3>
                <p className="text-gray-400 text-sm">Give your project a descriptive name</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Project Image</h3>
                <p className="text-gray-400 text-sm">Add a cover image for your project (optional)</p>
              </div>

              <div className="space-y-4">
                {projectData.imagePreview ? (
                  <div className="relative">
                    <img
                      src={projectData.imagePreview}
                      alt="Project preview"
                      className="w-full h-32 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      onClick={() => setProjectData(prev => ({ ...prev, image: null, imagePreview: null }))}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">Upload a project image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="project-image"
                    />
                    <label
                      htmlFor="project-image"
                      className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg cursor-pointer transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setProjectData(prev => ({ ...prev, skipImage: !prev.skipImage }))}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      projectData.skipImage 
                        ? 'bg-white border-white' 
                        : 'border-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {projectData.skipImage && <Check className="h-3 w-3 text-black" />}
                  </button>
                  <span className="text-gray-400 text-sm">Skip image for now</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-white text-lg font-semibold">Ready to Create!</h3>
              <div className="bg-white/5 rounded-lg p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Project:</span>
                  <span className="text-white text-sm font-medium">{projectData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Image:</span>
                  <span className="text-white text-sm font-medium">
                    {projectData.skipImage ? 'Skipped' : (projectData.image ? 'Included' : 'Not provided')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <Button
            onClick={step === 1 ? handleClose : prevStep}
            className="bg-transparent hover:bg-white/10 text-gray-400 border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-3">
            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="bg-white hover:bg-gray-100 text-black"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateProject}
                disabled={loading}
                className="bg-white hover:bg-gray-100 text-black"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal

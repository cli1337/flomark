import React, { useState } from 'react'
import { 
  Building2, 
  Upload, 
  Check,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  X
} from 'lucide-react'
import { projectService } from '../services/projectService'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from './ui/LoadingSpinner'

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const { showSuccess, showError } = useToast()
  const [step, setStep] = useState(1)
  const [projectData, setProjectData] = useState({
    name: '',
    image: null,
    imagePreview: null
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
      const response = await projectService.createProject(projectData.name)
      
      if (response.success) {
        const projectId = response.data.id
        if (projectData.image) {
          try {
            const imageResponse = await projectService.uploadProjectImage(projectId, projectData.image)
            if (imageResponse.success) {
              response.data.imageHash = imageResponse.data.imageHash
            }
          } catch (error) {
            console.error('Error uploading image:', error)
            showError('Image Upload Failed', 'Project created but image upload failed')
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
      imagePreview: null
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6 w-full max-w-md backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Create New Project</h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 1 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'
              }`}>
                1
              </div>
              <span className={`text-xs ${step >= 1 ? 'text-white' : 'text-gray-400'}`}>
                Name
              </span>
            </div>
            <div className="flex-1 h-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 2 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'
              }`}>
                2
              </div>
              <span className={`text-xs ${step >= 2 ? 'text-white' : 'text-gray-400'}`}>
                Image
              </span>
            </div>
            <div className="flex-1 h-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 3 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'
              }`}>
                <Check className="h-3 w-3" />
              </div>
              <span className={`text-xs ${step >= 3 ? 'text-white' : 'text-gray-400'}`}>
                Done
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Image (Optional)
              </label>
              
              {projectData.imagePreview ? (
                <div className="relative mb-3">
                  <img
                    src={projectData.imagePreview}
                    alt="Project preview"
                    className="w-full h-24 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    onClick={() => setProjectData(prev => ({ ...prev, image: null, imagePreview: null }))}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-white/20 rounded-lg p-4 text-center mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="project-image"
                  />
                  <label
                    htmlFor="project-image"
                    className="cursor-pointer block"
                  >
                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">Click to upload image</p>
                  </label>
                </div>
              )}

            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Ready to Create!</h3>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Project:</span>
                  <span className="text-white text-sm font-medium">{projectData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Image:</span>
                  <span className="text-white text-sm font-medium">
                    {projectData.image ? 'Included' : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={step === 1 ? handleClose : prevStep}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateProject}
              disabled={loading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="h-4 w-4" className="text-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Project
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal

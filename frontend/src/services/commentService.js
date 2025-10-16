import api from './api'

export const commentService = {
  getCommentsByTask: async (taskId) => {
    const response = await api.get(`/comments/task/${taskId}`)
    return response.data
  },

  createComment: async (taskId, content) => {
    const response = await api.post(`/comments/task/${taskId}`, { content })
    return response.data
  },

  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content })
    return response.data
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data
  }
}


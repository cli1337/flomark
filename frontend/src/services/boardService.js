import api from './api';

/**
 * Board Service
 * Handles all board-related API calls
 */

export const boardService = {
  /**
   * Get all boards for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} Board data
   */
  getBoardsByProject: async (projectId) => {
    try {
      const response = await api.get(`/boards/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  },

  /**
   * Get board by ID with lists and tasks
   * @param {string} boardId - Board ID
   * @returns {Promise} Board data with lists and tasks
   */
  getBoardById: async (boardId) => {
    try {
      const response = await api.get(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  },

  /**
   * Create a new board
   * @param {string} projectId - Project ID
   * @param {string} name - Board name
   * @returns {Promise} Created board data
   */
  createBoard: async (projectId, name) => {
    try {
      const response = await api.post(`/boards/project/${projectId}`, { name });
      return response.data;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  },

  /**
   * Update a board
   * @param {string} boardId - Board ID
   * @param {object} updates - Board updates (name, order)
   * @returns {Promise} Updated board data
   */
  updateBoard: async (boardId, updates) => {
    try {
      const response = await api.put(`/boards/${boardId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  },

  /**
   * Delete a board
   * @param {string} boardId - Board ID
   * @returns {Promise} Success message
   */
  deleteBoard: async (boardId) => {
    try {
      const response = await api.delete(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;
    }
  },

  /**
   * Reorder boards in a project
   * @param {string} projectId - Project ID
   * @param {string[]} boardIds - Array of board IDs in new order
   * @returns {Promise} Updated boards data
   */
  reorderBoards: async (projectId, boardIds) => {
    try {
      const response = await api.put(`/boards/project/${projectId}/reorder`, { boardIds });
      return response.data;
    } catch (error) {
      console.error('Error reordering boards:', error);
      throw error;
    }
  }
};


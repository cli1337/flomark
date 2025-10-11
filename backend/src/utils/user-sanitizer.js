/**
 * User Sanitizer Utility
 * Removes sensitive user information before sending to frontend
 */

/**
 * Safe user fields selector for Prisma queries
 * Use this in Prisma select/include statements
 */
export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  profileImage: true,
  role: true,
  createdAt: true,
};

/**
 * Sanitize a single user object by removing sensitive fields
 * @param {object} user - User object to sanitize
 * @returns {object} Sanitized user object
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, registerIP, lastIP, twoFactorSecret, twoFactorEnabled, ...safeUser } = user;
  return safeUser;
};

/**
 * Sanitize an array of user objects
 * @param {array} users - Array of user objects to sanitize
 * @returns {array} Array of sanitized user objects
 */
export const sanitizeUsers = (users) => {
  if (!users || !Array.isArray(users)) return [];
  return users.map(sanitizeUser);
};

/**
 * Sanitize project members (including nested user objects)
 * @param {array} members - Array of project member objects with user relations
 * @returns {array} Array of sanitized member objects
 */
export const sanitizeMembers = (members) => {
  if (!members || !Array.isArray(members)) return [];
  
  return members.map(member => ({
    ...member,
    user: member.user ? sanitizeUser(member.user) : null,
  }));
};

/**
 * Sanitize a complete project object with nested members
 * @param {object} project - Project object to sanitize
 * @returns {object} Sanitized project object
 */
export const sanitizeProject = (project) => {
  if (!project) return null;
  
  return {
    ...project,
    members: sanitizeMembers(project.members || []),
  };
};

/**
 * Sanitize an array of projects
 * @param {array} projects - Array of project objects to sanitize
 * @returns {array} Array of sanitized project objects
 */
export const sanitizeProjects = (projects) => {
  if (!projects || !Array.isArray(projects)) return [];
  return projects.map(sanitizeProject);
};

/**
 * Sanitize task members (including nested user objects)
 * @param {array} members - Array of task member objects with user relations
 * @returns {array} Array of sanitized member objects
 */
export const sanitizeTaskMembers = (members) => {
  if (!members || !Array.isArray(members)) return [];
  
  return members.map(member => ({
    ...member,
    user: member.user ? sanitizeUser(member.user) : null,
  }));
};

/**
 * Sanitize a task object with nested members
 * @param {object} task - Task object to sanitize
 * @returns {object} Sanitized task object
 */
export const sanitizeTask = (task) => {
  if (!task) return null;
  
  return {
    ...task,
    members: sanitizeTaskMembers(task.members || []),
  };
};

/**
 * Sanitize an array of tasks
 * @param {array} tasks - Array of task objects to sanitize
 * @returns {array} Array of sanitized task objects
 */
export const sanitizeTasks = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return [];
  return tasks.map(sanitizeTask);
};


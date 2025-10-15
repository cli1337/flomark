import { Server } from "socket.io";
import { authenticateSocket } from "../middlewares/socket.auth.middleware.js";

export class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });


    this.projectUsers = new Map();
    this.userProjects = new Map();

    this.setupMiddleware();
    this.setupEventHandlers();
    

    SocketService.instance = this;
  }

  setupMiddleware() {

    this.io.use(authenticateSocket);
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      socket.join(`user:${socket.user.id}`);

      socket.on("join-project", (projectId) => {
        if (!projectId) {
          socket.emit("error", { message: "Project ID is required" });
          return;
        }

        if (!socket.rooms.has(`project:${projectId}`)) {
          socket.join(`project:${projectId}`);
          
          this.addUserToProject(socket.user.id, socket.user.name, projectId, socket);
          
          this.broadcastActiveUsers(projectId);
        }
      });

      socket.on("leave-project", (projectId) => {
        if (!projectId) {
          socket.emit("error", { message: "Project ID is required" });
          return;
        }

        if (socket.rooms.has(`project:${projectId}`)) {
          socket.leave(`project:${projectId}`);
          
          this.removeUserFromProject(socket.user.id, projectId);
          
          this.broadcastActiveUsers(projectId);
        }
      });


      socket.on("project-update", (data) => {
        const { projectId, type, payload } = data;
        
        if (!projectId) {
          socket.emit("error", { message: "Project ID is required" });
          return;
        }

        this.io.to(`project:${projectId}`).emit("project-updated", {
          projectId,
          type,
          payload,
          userId: socket.user.id,
          userName: socket.user.name,
          timestamp: new Date().toISOString()
        });
      });


      socket.on("task-update", (data) => {
        const { projectId, taskId, type, payload } = data;
        
        if (!projectId || !taskId) {
          socket.emit("error", { message: "Project ID and Task ID are required" });
          return;
        }

        this.io.to(`project:${projectId}`).emit("task-updated", {
          projectId,
          taskId,
          type,
          payload,
          userId: socket.user.id,
          userName: socket.user.name,
          timestamp: new Date().toISOString()
        });
      });


      socket.on("user-presence", (data) => {
        const { projectId, isActive } = data;
        
        if (projectId && socket.rooms.has(`project:${projectId}`)) {

          socket.to(`project:${projectId}`).emit("user-presence-changed", {
            userId: socket.user.id,
            userName: socket.user.name,
            isActive,
            timestamp: new Date().toISOString()
          });
          

          socket.emit("user-presence-changed", {
            userId: socket.user.id,
            userName: socket.user.name,
            isActive,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle notification acknowledgment
      socket.on("notification-received", (data) => {
        // Notification acknowledged - no action needed
      });


      socket.on("disconnect", (reason) => {
        if (this.userProjects.has(socket.user.id)) {
          const userProjects = this.userProjects.get(socket.user.id);
          userProjects.forEach(projectId => {
            this.removeUserFromProject(socket.user.id, projectId);
            this.broadcastActiveUsers(projectId);
          });
        }
      });

      socket.emit("connected", {
        message: "Successfully connected to server",
        user: socket.user
      });

      const heartbeatInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit("ping");
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      socket.on("pong", () => {

      });
    });
  }


  broadcastToProject(projectId, event, data) {
    this.io.to(`project:${projectId}`).emit(event, data);
  }


  broadcastToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }


  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }


  getConnectedUsersCount() {
    return this.io.engine.clientsCount;
  }


  getProjectUsers(projectId) {
    const room = this.io.sockets.adapter.rooms.get(`project:${projectId}`);
    return room ? room.size : 0;
  }


  addUserToProject(userId, userName, projectId, socket) {

    if (!this.projectUsers.has(projectId)) {
      this.projectUsers.set(projectId, new Map());
    }
    

    if (!this.userProjects.has(userId)) {
      this.userProjects.set(userId, new Set());
    }


    this.projectUsers.get(projectId).set(userId, {
      id: userId,
      name: userName,
      profileImage: socket.user.profileImage || null,
      socketId: socket.id,
      joinedAt: new Date().toISOString()
    });


    this.userProjects.get(userId).add(projectId);
  }


  removeUserFromProject(userId, projectId) {
    if (this.projectUsers.has(projectId)) {
      const user = this.projectUsers.get(projectId).get(userId);
      if (user) {
        this.projectUsers.get(projectId).delete(userId);
        

        if (this.projectUsers.get(projectId).size === 0) {
          this.projectUsers.delete(projectId);
        }
      }
    }


    if (this.userProjects.has(userId)) {
      this.userProjects.get(userId).delete(projectId);
      

      if (this.userProjects.get(userId).size === 0) {
        this.userProjects.delete(userId);
      }
    }
  }


  getActiveUsersForProject(projectId) {
    if (!this.projectUsers.has(projectId)) {
      return [];
    }
    
    return Array.from(this.projectUsers.get(projectId).values());
  }


  broadcastActiveUsers(projectId) {
    const activeUsers = this.getActiveUsersForProject(projectId);
    this.io.to(`project:${projectId}`).emit('active-users-updated', {
      projectId,
      activeUsers,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send notification to a specific user
   * @param {string} userId - User ID to send notification to
   * @param {Object} notification - Notification data
   */
  sendNotification(userId, notification) {
    this.broadcastToUser(userId, "notification", notification);
  }

  /**
   * Send notification to multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @param {Object} notification - Notification data
   */
  sendNotificationToMany(userIds, notification) {
    userIds.forEach((userId) => {
      this.sendNotification(userId, notification);
    });
  }
}

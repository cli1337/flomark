import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    if (SocketService.instance) {
      return SocketService.instance;
    }
    
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connecting = false;
    this.reconnectTimeout = null;
    this.connectionTimeout = null;
    
    SocketService.instance = this;
  }

  connect() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      return false;
    }

    if (this.socket && this.socket.connected) {
      console.log('Socket already connected');
      return true;
    }


    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connecting = false; // Reset connecting state
    }

    if (this.connecting) {
      console.log('Connection already in progress - force resetting state');
      this.forceResetConnectionState();
    }

    this.connecting = true;
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    

    this.connectionTimeout = setTimeout(() => {
      if (this.connecting && !this.isConnected) {
        console.log('Connection timeout, resetting connecting state');
        this.connecting = false;
      }
    }, 10000); // 10 second timeout
    
    try {

    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      this.setupEventListeners();
      return true;
    } catch (error) {
      console.error('Socket connection error:', error);
      this.connecting = false;
      return false;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      this.isConnected = true;
      this.connecting = false;
      this.reconnectAttempts = 0;
      this.clearReconnectTimeout();
      this.clearConnectionTimeout();
      

      this.emitCustomEvent('connect', { connected: true });
      

      this.emitCustomEvent('socket-ready', { connected: true });
    });

    this.socket.on('connected', (data) => {

    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      this.isConnected = false;
      this.connecting = false;
      this.clearConnectionTimeout();

      this.emitCustomEvent('disconnect', { reason });
      

      if (reason === 'io server disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.connecting = false;
      

      this.emitCustomEvent('connect_error', { error: error.message });
      
      if (error.message === 'Authentication token is required' || 
          error.message === 'Invalid token' || 
          error.message === 'Token has expired' ||
          error.message === 'User not found') {
        console.error('Authentication failed, clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return;
      }


      if (error.type === 'TransportError' || error.type === 'TransportCloseError') {
        this.handleReconnect();
      }
    });



    this.socket.on('project-updated', (data) => {

      this.emitCustomEvent('project-updated', data);
    });


    this.socket.on('task-updated', (data) => {
      console.log('📋 Task updated:', data);
      this.emitCustomEvent('task-updated', data);
    });


    this.socket.on('user-joined', (data) => {
      console.log('👤 User joined project:', data);
      this.emitCustomEvent('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      console.log('👤 User left project:', data);
      this.emitCustomEvent('user-left', data);
    });

    this.socket.on('user-presence-changed', (data) => {
      console.log('👤 User presence changed:', data);
      this.emitCustomEvent('user-presence-changed', data);
    });


    this.socket.on('project-created', (data) => {
      console.log('📁 Project created:', data);
      this.emitCustomEvent('project-created', data);
    });

    this.socket.on('project-image-updated', (data) => {
      console.log('🖼️ Project image updated:', data);
      this.emitCustomEvent('project-image-updated', data);
    });

    this.socket.on('project-deleted', (data) => {
      console.log('🗑️ Project deleted:', data);
      this.emitCustomEvent('project-deleted', data);
    });

    this.socket.on('active-users-updated', (data) => {
      console.log('👥 Active users updated:', data);
      this.emitCustomEvent('active-users-updated', data);
    });


    this.socket.on('list-created', (data) => {
      console.log('📋 List created:', data);
      this.emitCustomEvent('list-created', data);
    });

    this.socket.on('list-updated', (data) => {
      console.log('📋 List updated:', data);
      this.emitCustomEvent('list-updated', data);
    });

    this.socket.on('lists-reordered', (data) => {
      console.log('📋 Lists reordered:', data);
      this.emitCustomEvent('lists-reordered', data);
    });


    this.socket.on('member-joined', (data) => {
      console.log('👤 Member joined:', data);
      this.emitCustomEvent('member-joined', data);
    });

    this.socket.on('member-removed', (data) => {
      console.log('👤 Member removed:', data);
      this.emitCustomEvent('member-removed', data);
    });

    this.socket.on('member-role-updated', (data) => {
      console.log('👤 Member role updated:', data);
      this.emitCustomEvent('member-role-updated', data);
    });


    this.socket.on('label-created', (data) => {
      console.log('🏷️ Label created:', data);
      this.emitCustomEvent('label-created', data);
    });

    this.socket.on('label-updated', (data) => {
      console.log('🏷️ Label updated:', data);
      this.emitCustomEvent('label-updated', data);
    });

    this.socket.on('label-deleted', (data) => {
      console.log('🏷️ Label deleted:', data);
      this.emitCustomEvent('label-deleted', data);
    });


    this.socket.on('task-created', (data) => {
      console.log('📋 Task created:', data);
      this.emitCustomEvent('task-created', data);
    });

    this.socket.on('task-moved', (data) => {
      console.log('📋 Task moved:', data);
      this.emitCustomEvent('task-moved', data);
    });

    this.socket.on('task-deleted', (data) => {
      console.log('📋 Task deleted:', data);
      this.emitCustomEvent('task-deleted', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emitCustomEvent('socket-error', error);
    });


    this.socket.on('ping', () => {
      this.socket.emit('pong');
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (!this.isConnected && !this.connecting) {
        this.connect();
      }
    }, delay);
  }

  clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  forceResetConnectionState() {
    console.log('🔄 Force resetting connection state');
    this.clearConnectionTimeout();
    this.clearReconnectTimeout();
    this.connecting = false;
    this.isConnected = false;
  }

  disconnect() {
    this.clearReconnectTimeout();
    this.clearConnectionTimeout();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connecting = false;
      console.log('🔌 Socket disconnected');
      

      this.emitCustomEvent('disconnect', { reason: 'manual_disconnect' });
    }
  }


  joinProject(projectId) {
    console.log('🔍 socketService.joinProject called with projectId:', projectId);
    console.log('🔍 Socket state:', {
      hasSocket: !!this.socket,
      isConnected: this.isConnected,
      socketConnected: this.socket ? this.socket.connected : false
    });
    
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    console.log('🔍 Emitting join-project event for projectId:', projectId);
    this.socket.emit('join-project', projectId);
    console.log(`📁 Joined project room: ${projectId}`);
    return true;
  }

  leaveProject(projectId) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('leave-project', projectId);
    console.log(`📁 Left project room: ${projectId}`);
    return true;
  }


  broadcastProjectUpdate(projectId, type, payload) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('project-update', {
      projectId,
      type,
      payload
    });
    return true;
  }

  broadcastTaskUpdate(projectId, taskId, type, payload) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('task-update', {
      projectId,
      taskId,
      type,
      payload
    });
    return true;
  }

  updateUserPresence(projectId, isActive = true) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('user-presence', {
      projectId,
      isActive
    });
    return true;
  }


  emitCustomEvent(eventName, data) {
    const event = new CustomEvent(`socket:${eventName}`, { detail: data });
    window.dispatchEvent(event);
  }


  on(eventName, callback) {
    const eventListener = (event) => {
      callback(event.detail);
    };
    
    window.addEventListener(`socket:${eventName}`, eventListener);
    

    return () => {
      window.removeEventListener(`socket:${eventName}`, eventListener);
    };
  }


  isSocketConnected() {
    return this.socket && this.socket.connected;
  }

  getSocket() {
    return this.socket;
  }


  shouldBeConnected() {
    const token = localStorage.getItem('token');
    return !!token;
  }


  ensureConnection() {
    if (this.shouldBeConnected() && !this.isConnected && !this.connecting) {
      console.log('🔌 Ensuring WebSocket connection...');
      return this.connect();
    }
    return this.isConnected;
  }


  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      connecting: this.connecting,
      hasSocket: !!this.socket,
      socketConnected: this.socket ? this.socket.connected : false,
      shouldBeConnected: this.shouldBeConnected(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}


const socketService = new SocketService();
export default socketService;

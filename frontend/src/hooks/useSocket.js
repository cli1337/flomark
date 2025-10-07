import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';

export const useSocket = () => {
  const { user, loading } = useAuth();
  const isConnecting = useRef(false);


  useEffect(() => {


  }, [user, loading]);



  useEffect(() => {
    if (!user || loading) return;

    const interval = setInterval(() => {
      if (socketService.shouldBeConnected() && !socketService.isSocketConnected()) {
        console.log('🔌 Connection lost, attempting to reconnect...');
        socketService.ensureConnection();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loading]);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.isSocketConnected(),
    joinProject: socketService.joinProject.bind(socketService),
    leaveProject: socketService.leaveProject.bind(socketService),
    broadcastProjectUpdate: socketService.broadcastProjectUpdate.bind(socketService),
    broadcastTaskUpdate: socketService.broadcastTaskUpdate.bind(socketService),
    updateUserPresence: socketService.updateUserPresence.bind(socketService),
    on: socketService.on.bind(socketService)
  };
};


export const useSocketEvent = (eventName, callback, deps = []) => {
  const { on } = useSocket();
  const callbackRef = useRef(callback);
  

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!eventName || !callback) return;

    const wrappedCallback = (...args) => callbackRef.current(...args);
    const cleanup = on(eventName, wrappedCallback);
    return cleanup;
  }, [eventName, on, ...deps]); // Remove callback from deps
};


export const useProjectSocket = (projectId) => {
  const { joinProject, leaveProject, broadcastProjectUpdate, broadcastTaskUpdate, updateUserPresence, isConnected } = useSocket();
  const currentProjectRef = useRef(null);
  const isJoiningRef = useRef(false);
  const retryTimeoutRef = useRef(null);


  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  useEffect(() => {
    if (projectId && !isJoiningRef.current && isConnected) {
      isJoiningRef.current = true;

      if (currentProjectRef.current && currentProjectRef.current !== projectId) {
        leaveProject(currentProjectRef.current);
        updateUserPresence(currentProjectRef.current, false);
      }

      const joinResult = joinProject(projectId);
      
      if (!joinResult) {
        retryTimeoutRef.current = setTimeout(() => {
          if (projectIdRef.current === projectId) {
            joinProject(projectId);
            updateUserPresence(projectId, true);
          }
        }, 1000);
      } else {
        updateUserPresence(projectId, true);
      }
      
      currentProjectRef.current = projectId;
      isJoiningRef.current = false;

      return () => {
        if (currentProjectRef.current === projectId) {
          leaveProject(projectId);
          updateUserPresence(projectId, false);
          currentProjectRef.current = null;
        }
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      };
    }
  }, [projectId, isConnected]); // Depend on both projectId and isConnected

  return {
    broadcastProjectUpdate: (type, payload) => broadcastProjectUpdate(projectId, type, payload),
    broadcastTaskUpdate: (taskId, type, payload) => broadcastTaskUpdate(projectId, taskId, type, payload),
    updateUserPresence: (isActive) => updateUserPresence(projectId, isActive)
  };
};

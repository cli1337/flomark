import React, { useState, useEffect } from 'react';
import { useSocket, useSocketEvent } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

const SocketIODemo = () => {
  const { user } = useAuth();
  const { isConnected, socket, broadcastProjectUpdate, broadcastTaskUpdate } = useSocket();
  const [messages, setMessages] = useState([]);
  const [projectId, setProjectId] = useState('demo-project-123');
  const [testMessage, setTestMessage] = useState('');


  useSocketEvent('project-updated', (data) => {
    setMessages(prev => [...prev, {
      type: 'project-updated',
      message: `Project ${data.projectId} updated by ${data.userName}: ${data.type}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  });

  useSocketEvent('task-updated', (data) => {
    setMessages(prev => [...prev, {
      type: 'task-updated',
      message: `Task ${data.taskId} updated by ${data.userName}: ${data.type}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  });

  useSocketEvent('user-joined', (data) => {
    setMessages(prev => [...prev, {
      type: 'user-joined',
      message: `${data.userName} joined project ${data.projectId}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  });

  useSocketEvent('user-left', (data) => {
    setMessages(prev => [...prev, {
      type: 'user-left',
      message: `${data.userName} left project ${data.projectId}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  });

  const sendProjectUpdate = () => {
    if (isConnected) {
      broadcastProjectUpdate('test-update', { message: testMessage || 'Test project update' });
      setMessages(prev => [...prev, {
        type: 'sent',
        message: `Sent project update: ${testMessage || 'Test project update'}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const sendTaskUpdate = () => {
    if (isConnected) {
      broadcastTaskUpdate('demo-task-123', 'test-update', { message: testMessage || 'Test task update' });
      setMessages(prev => [...prev, {
        type: 'sent',
        message: `Sent task update: ${testMessage || 'Test task update'}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Socket.IO Demo</h2>
        
        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="font-medium">
              Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            User: {user?.name || 'Not logged in'} | Project ID: {projectId}
          </p>
        </div>

        {/* Test Controls */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Message:</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={sendProjectUpdate}
              disabled={!isConnected}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Send Project Update
            </Button>
            
            <Button
              onClick={sendTaskUpdate}
              disabled={!isConnected}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Send Task Update
            </Button>
            
            <Button
              onClick={clearMessages}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Clear Messages
            </Button>
          </div>
        </div>

        {/* Messages Log */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Real-time Messages:</h3>
          <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet. Try sending a test message!</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg mb-2 text-sm ${
                    msg.type === 'sent' ? 'bg-blue-100 text-blue-800' :
                    msg.type === 'project-updated' ? 'bg-green-100 text-green-800' :
                    msg.type === 'task-updated' ? 'bg-purple-100 text-purple-800' :
                    msg.type === 'user-joined' ? 'bg-yellow-100 text-yellow-800' :
                    msg.type === 'user-left' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span>{msg.message}</span>
                    <span className="text-xs opacity-75 ml-2">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">How to test:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Make sure you're logged in and connected (green dot above)</li>
            <li>Open another browser tab/window with the same project</li>
            <li>Send test messages from one tab and see them appear in the other</li>
            <li>Try different project IDs to test room isolation</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocketIODemo;

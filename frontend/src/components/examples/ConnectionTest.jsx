import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import socketService from '../../services/socketService';

const ConnectionTest = () => {
  const { user } = useAuth();
  const { isConnected, activeUsers } = useWebSocket();
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const updateConnectionInfo = () => {
      setConnectionInfo(socketService.getConnectionInfo());
    };

    updateConnectionInfo();
    const interval = setInterval(updateConnectionInfo, 2000);

    return () => clearInterval(interval);
  }, []);

  const runTests = () => {
    const tests = [];
    

    tests.push({
      name: 'Connection Persistence',
      status: isConnected ? 'PASS' : 'FAIL',
      message: isConnected ? 'WebSocket is connected' : 'WebSocket is not connected'
    });


    tests.push({
      name: 'User Authentication',
      status: user ? 'PASS' : 'FAIL',
      message: user ? `User ${user.name} is authenticated` : 'User is not authenticated'
    });


    tests.push({
      name: 'Socket Service State',
      status: connectionInfo?.shouldBeConnected === user ? 'PASS' : 'FAIL',
      message: `Should be connected: ${connectionInfo?.shouldBeConnected}, Has user: ${!!user}`
    });


    tests.push({
      name: 'Active Users Tracking',
      status: Array.isArray(activeUsers) ? 'PASS' : 'FAIL',
      message: `Tracking ${activeUsers?.length || 0} active users`
    });

    setTestResults(tests);
  };

  const testProjectJoin = (projectId) => {
    if (socketService.joinProject(projectId)) {
      console.log(`✅ Successfully joined project ${projectId}`);
    } else {
      console.error(`❌ Failed to join project ${projectId}`);
    }
  };

  const testProjectLeave = (projectId) => {
    if (socketService.leaveProject(projectId)) {
      console.log(`✅ Successfully left project ${projectId}`);
    } else {
      console.error(`❌ Failed to leave project ${projectId}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">WebSocket Connection Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>WebSocket Connected:</span>
              <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>User Authenticated:</span>
              <span className={`font-semibold ${user ? 'text-green-600' : 'text-red-600'}`}>
                {user ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span className="font-semibold">{activeUsers?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Connection Info</h3>
          {connectionInfo && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Is Connected:</span>
                <span className={connectionInfo.isConnected ? 'text-green-600' : 'text-red-600'}>
                  {connectionInfo.isConnected ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Connecting:</span>
                <span className={connectionInfo.connecting ? 'text-yellow-600' : 'text-gray-600'}>
                  {connectionInfo.connecting ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has Socket:</span>
                <span className={connectionInfo.hasSocket ? 'text-green-600' : 'text-red-600'}>
                  {connectionInfo.hasSocket ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Socket Connected:</span>
                <span className={connectionInfo.socketConnected ? 'text-green-600' : 'text-red-600'}>
                  {connectionInfo.socketConnected ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Should Be Connected:</span>
                <span className={connectionInfo.shouldBeConnected ? 'text-green-600' : 'text-red-600'}>
                  {connectionInfo.shouldBeConnected ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reconnect Attempts:</span>
                <span>{connectionInfo.reconnectAttempts}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Test Controls</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={runTests}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Run Tests
          </button>
          <button
            onClick={() => testProjectJoin('test-project-1')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Join Test Project
          </button>
          <button
            onClick={() => testProjectLeave('test-project-1')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Leave Test Project
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((test, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded">
                <span className="font-medium">{test.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                    test.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {test.status}
                  </span>
                  <span className="text-sm text-gray-600">{test.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/app';
import { updateJwtToken, updateBaseUrls } from '../lib/http';

import { Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline';
}

export default function SettingsPanel() {
  const { 
    baseUrls, 
    // jwt, // COMMENTED OUT FOR DEVELOPMENT
    ttsAutoplay, 
    setBaseUrls, 
    // setJwt, // COMMENTED OUT FOR DEVELOPMENT
    setTtsAutoplay 
  } = useAppStore();

  const [localSettings, setLocalSettings] = useState({
    agentUrl: baseUrls.agent,
    toolsUrl: baseUrls.tools,
    memoryUrl: baseUrls.memory,
    // jwt: jwt, // COMMENTED OUT FOR DEVELOPMENT
    ttsAutoplay: ttsAutoplay,
  });

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings({
      agentUrl: baseUrls.agent,
      toolsUrl: baseUrls.tools,
      memoryUrl: baseUrls.memory,
      // jwt: jwt, // COMMENTED OUT FOR DEVELOPMENT
      ttsAutoplay: ttsAutoplay,
    });
  }, [baseUrls, /* jwt, */ ttsAutoplay]); // jwt commented out for development

  const handleSave = () => {
    setBaseUrls({
      agent: localSettings.agentUrl,
      tools: localSettings.toolsUrl,
      memory: localSettings.memoryUrl,
    });
    // setJwt(localSettings.jwt); // COMMENTED OUT FOR DEVELOPMENT
    setTtsAutoplay(localSettings.ttsAutoplay);
    
    // Update HTTP clients
    updateBaseUrls(localSettings.agentUrl, localSettings.toolsUrl, localSettings.memoryUrl);
    // updateJwtToken(localSettings.jwt); // COMMENTED OUT FOR DEVELOPMENT
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnectivity = useCallback(async () => {
    setTesting(true);
    setServiceStatus([
      { name: 'Agent Service', url: localSettings.agentUrl, status: 'checking' },
      { name: 'Tools Service', url: localSettings.toolsUrl, status: 'checking' },
      { name: 'Memory Service', url: localSettings.memoryUrl, status: 'checking' },
    ]);

    const results = await Promise.allSettled([
      // Test Agent Service with /actuator/health
      fetch(`${localSettings.agentUrl}/actuator/health`).then(response => ({
        name: 'Agent Service',
        url: localSettings.agentUrl,
        status: response.ok ? 'online' as const : 'offline' as const
      })).catch(() => ({
        name: 'Agent Service',
        url: localSettings.agentUrl,
        status: 'offline' as const
      })),
      
      // Test Tools Service with /api/tools/health
      fetch(`${localSettings.toolsUrl}/api/tools/health`).then(response => ({
        name: 'Tools Service',
        url: localSettings.toolsUrl,
        status: response.ok ? 'online' as const : 'offline' as const
      })).catch(() => ({
        name: 'Tools Service',
        url: localSettings.toolsUrl,
        status: 'offline' as const
      })),
      
      // Test Memory Service with /api/memory/health
      fetch(`${localSettings.memoryUrl}/api/memory/health`).then(response => ({
        name: 'Memory Service',
        url: localSettings.memoryUrl,
        status: response.ok ? 'online' as const : 'offline' as const
      })).catch(() => ({
        name: 'Memory Service',
        url: localSettings.memoryUrl,
        status: 'offline' as const
      }))
    ]);

    const statusResults = results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return { 
        name: 'Unknown Service', 
        url: 'unknown', 
        status: 'offline' as const 
      };
    });

    setServiceStatus(statusResults);
    setTesting(false);
  }, [localSettings.agentUrl, localSettings.toolsUrl, localSettings.memoryUrl]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />;
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Settings</h2>

      {saved && (
        <div className="mb-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2" />
          <span className="text-green-700 text-sm md:text-base">Settings saved successfully!</span>
        </div>
      )}

      <div className="space-y-6 md:space-y-8">
        {/* Service URLs */}
        <div>
          <h3 className="text-base md:text-lg font-medium mb-3">Service URLs</h3>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Agent Service URL
              </label>
              <input
                type="url"
                value={localSettings.agentUrl}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, agentUrl: e.target.value }))}
                className="input text-sm md:text-base"
                placeholder="http://localhost:8080"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Tools Service URL
              </label>
              <input
                type="url"
                value={localSettings.toolsUrl}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, toolsUrl: e.target.value }))}
                className="input text-sm md:text-base"
                placeholder="http://localhost:8083"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Memory Service URL
              </label>
              <input
                type="url"
                value={localSettings.memoryUrl}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, memoryUrl: e.target.value }))}
                className="input text-sm md:text-base"
                placeholder="http://localhost:8082"
              />
            </div>
          </div>
        </div>

        {/* Authentication (COMMENTED OUT FOR DEVELOPMENT) */}
        {/* <div>
          <h3 className="text-md font-medium mb-3">Authentication</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JWT Token
            </label>
            <input
              type="password"
              value={localSettings.jwt}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, jwt: e.target.value }))}
              className="input"
              placeholder="Enter JWT token"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty if no authentication is required
            </p>
          </div>
        </div> */}

        {/* Preferences */}
        <div>
          <h3 className="text-base md:text-lg font-medium mb-3">Preferences</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ttsAutoplay"
              checked={localSettings.ttsAutoplay}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, ttsAutoplay: e.target.checked }))}
              className="h-4 w-4 md:h-5 md:w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="ttsAutoplay" className="ml-2 block text-sm md:text-base text-gray-900">
              Auto-play TTS responses
            </label>
          </div>
        </div>

        {/* Service Status */}
        <div>
          <h3 className="text-base md:text-lg font-medium mb-3">Service Status</h3>
          <div className="space-y-2 md:space-y-3">
            {serviceStatus.map((service, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm md:text-base truncate">{service.name}</div>
                  <div className="text-xs md:text-sm text-gray-500 truncate">{service.url}</div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {getStatusIcon(service.status)}
                  <span className={`text-xs md:text-sm ${
                    service.status === 'online' ? 'text-green-600' :
                    service.status === 'offline' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getStatusText(service.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base"
          >
            <Save className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            Save Settings
          </button>
          <button
            onClick={testConnectivity}
            disabled={testing}
            className="btn-secondary flex items-center justify-center px-4 py-2 md:py-3 text-sm md:text-base"
          >
            <TestTube className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            {testing ? 'Testing...' : 'Test Connectivity'}
          </button>
        </div>
      </div>
    </div>
  );
}

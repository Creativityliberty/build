/**
 * DebugPanel Component
 * 
 * Simple debug panel to check Appwrite connection and configuration
 */

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';

export function DebugPanel() {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check environment variables
        const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
        const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

        // Try to connect to Appwrite
        let appwriteHealth = '❌ FAILED';
        try {
          const response = await fetch(`${endpoint}/health`, {
            method: 'GET',
          });
          appwriteHealth = response.ok ? '✅ CONNECTED' : '❌ FAILED';
        } catch (err) {
          appwriteHealth = '❌ ERROR: ' + (err instanceof Error ? err.message : 'Unknown error');
        }

        setStatus({
          endpoint: endpoint || '❌ NOT SET',
          projectId: projectId || '❌ NOT SET',
          geminiKey: geminiKey ? '✅ SET' : '❌ NOT SET',
          appwriteHealth,
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        setStatus({
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return (
    <Card className="p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🔧 Debug Panel</h2>
      
      {loading && <p className="text-neutral-500">Checking configuration...</p>}
      
      {!loading && (
        <div className="space-y-3 font-mono text-sm">
          {Object.entries(status).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-2 bg-neutral-100 rounded">
              <span className="font-semibold">{key}:</span>
              <span className={String(value).includes('✅') ? 'text-green-600' : String(value).includes('❌') ? 'text-red-600' : 'text-neutral-600'}>
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Troubleshooting:</strong>
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>• Check .env.local has VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID</li>
          <li>• Verify Appwrite project exists and is active</li>
          <li>• Check browser console for detailed errors</li>
          <li>• Ensure all 6 tables exist in Appwrite database</li>
        </ul>
      </div>
    </Card>
  );
}

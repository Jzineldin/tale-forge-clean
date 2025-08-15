import { supabase } from '@/integrations/supabase/client';

export interface DebugInfo {
  timestamp: string;
  environment: {
    nodeEnv: string;
    supabaseUrl: string;
    hasAnonKey: boolean;
    hasServiceKey: boolean;
  };
  edgeFunction: {
    status: 'idle' | 'testing' | 'success' | 'error';
    response?: any;
    error?: any;
  };
  realtime: {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    channels: string[];
    errors: any[];
  };
  network: {
    connectivity: boolean;
    latency?: number;
  };
}

export class DebugUtils {
  private static debugInfo: DebugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: import.meta.env.MODE,
      supabaseUrl: 'https://fyihypkigbcmsxyvseca.supabase.co',
      hasAnonKey: true,
      hasServiceKey: !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    },
    edgeFunction: {
      status: 'idle'
    },
    realtime: {
      status: 'disconnected',
      channels: [],
      errors: []
    },
    network: {
      connectivity: navigator.onLine
    }
  };

  static async testEdgeFunction(functionName: string = 'test-elevenlabs-voices'): Promise<any> {
    console.log(`🔍 Testing Edge Function: ${functionName}`);
    
    this.debugInfo.edgeFunction.status = 'testing';
    this.debugInfo.timestamp = new Date().toISOString();

    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        method: 'GET'
      });

      const latency = Date.now() - startTime;
      this.debugInfo.network.latency = latency;

      if (error) {
        console.error(`❌ Edge Function ${functionName} failed:`, error);
        this.debugInfo.edgeFunction.status = 'error';
        this.debugInfo.edgeFunction.error = error;
        return { success: false, error, latency };
      }

      console.log(`✅ Edge Function ${functionName} success:`, data);
      this.debugInfo.edgeFunction.status = 'success';
      this.debugInfo.edgeFunction.response = data;
      
      return { success: true, data, latency };
    } catch (err: any) {
      console.error(`❌ Edge Function ${functionName} exception:`, err);
      this.debugInfo.edgeFunction.status = 'error';
      this.debugInfo.edgeFunction.error = err;
      return { success: false, error: err, latency: null };
    }
  }

  static async testRealtimeConnection(): Promise<any> {
    console.log('🔍 Testing Realtime Connection');
    
    this.debugInfo.realtime.status = 'connecting';
    this.debugInfo.timestamp = new Date().toISOString();

    return new Promise((resolve) => {
      const testChannel = supabase
        .channel('debug-test-channel')
        .on('presence', { event: 'sync' }, () => {
          console.log('✅ Realtime presence sync successful');
        })
        .on('presence', { event: 'join' }, () => {
          console.log('✅ Realtime presence join successful');
        })
        .subscribe((status, err) => {
          console.log('📡 Realtime test subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            this.debugInfo.realtime.status = 'connected';
            this.debugInfo.realtime.channels.push('debug-test-channel');
            console.log('✅ Realtime connection test successful');
            
            // Clean up test channel
            setTimeout(() => {
              supabase.removeChannel(testChannel);
            }, 1000);
            
            resolve({ success: true, status });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.debugInfo.realtime.status = 'error';
            this.debugInfo.realtime.errors.push({ status, error: err, timestamp: new Date().toISOString() });
            console.error('❌ Realtime connection test failed:', err);
            resolve({ success: false, status, error: err });
          }
        });
    });
  }

  static async testNetworkConnectivity(): Promise<any> {
    console.log('🔍 Testing Network Connectivity');
    
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        cache: 'no-cache'
      });
      
      const latency = Date.now() - startTime;
      this.debugInfo.network.latency = latency;
      this.debugInfo.network.connectivity = response.ok;
      
      console.log('✅ Network connectivity test successful:', { status: response.status, latency });
      return { success: true, status: response.status, latency };
    } catch (err) {
      this.debugInfo.network.connectivity = false;
      console.error('❌ Network connectivity test failed:', err);
      return { success: false, error: err };
    }
  }

  static async runFullDiagnostics(): Promise<DebugInfo> {
    console.log('🔍 Running Full Diagnostics');
    
    // Test network first
    await this.testNetworkConnectivity();
    
    // Test Edge Function
    await this.testEdgeFunction();
    
    // Test Realtime
    await this.testRealtimeConnection();
    
    // Update timestamp
    this.debugInfo.timestamp = new Date().toISOString();
    
    console.log('📊 Full diagnostics completed:', this.debugInfo);
    return this.debugInfo;
  }

  static getDebugInfo(): DebugInfo {
    return { ...this.debugInfo };
  }

  static generateDebugReport(): string {
    const info = this.getDebugInfo();
    
    const report = `
=== TALE FORGE DEBUG REPORT ===
Timestamp: ${info.timestamp}

ENVIRONMENT:
- Node Environment: ${info.environment.nodeEnv}
- Supabase URL: ${info.environment.supabaseUrl}
- Has Anon Key: ${info.environment.hasAnonKey}
- Has Service Key: ${info.environment.hasServiceKey}

EDGE FUNCTION:
- Status: ${info.edgeFunction.status}
${info.edgeFunction.error ? `- Error: ${JSON.stringify(info.edgeFunction.error, null, 2)}` : ''}
${info.edgeFunction.response ? `- Response: ${JSON.stringify(info.edgeFunction.response, null, 2)}` : ''}

REALTIME:
- Status: ${info.realtime.status}
- Active Channels: ${info.realtime.channels.join(', ') || 'none'}
${info.realtime.errors.length > 0 ? `- Errors: ${JSON.stringify(info.realtime.errors, null, 2)}` : ''}

NETWORK:
- Connectivity: ${info.network.connectivity}
- Latency: ${info.network.latency || 'unknown'}ms

=== END REPORT ===
    `;
    
    return report;
  }

  static logDebugReport(): void {
    console.log(this.generateDebugReport());
  }

  static downloadDebugReport(): void {
    const report = this.generateDebugReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tale-forge-debug-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export convenience functions
export const testEdgeFunction = (functionName?: string) => DebugUtils.testEdgeFunction(functionName);
export const testRealtimeConnection = () => DebugUtils.testRealtimeConnection();
export const testNetworkConnectivity = () => DebugUtils.testNetworkConnectivity();
export const runFullDiagnostics = () => DebugUtils.runFullDiagnostics();
export const getDebugInfo = () => DebugUtils.getDebugInfo();
export const logDebugReport = () => DebugUtils.logDebugReport();
export const downloadDebugReport = () => DebugUtils.downloadDebugReport(); 
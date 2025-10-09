// Simple logging and monitoring utilities

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data?: Record<string, any>;
}

class Logger {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 1000;

  log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console[level](logMessage, data || '');
    
    // Store for analytics
    this.events.push({
      event: `log_${level}`,
      timestamp: Date.now(),
      data: { message, ...data },
    });
    
    // Prevent memory leaks
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  info(message: string, data?: Record<string, any>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, any>) {
    this.log('error', message, data);
  }

  // Track API performance
  trackApiCall(endpoint: string, duration: number, success: boolean, error?: string) {
    this.events.push({
      event: 'api_call',
      timestamp: Date.now(),
      data: { endpoint, duration, success, error },
    });
  }

  // Get recent events for debugging
  getRecentEvents(count = 50): AnalyticsEvent[] {
    return this.events.slice(-count);
  }

  // Get stats
  getStats() {
    const now = Date.now();
    const last24h = this.events.filter(e => now - e.timestamp < 86400000);
    
    return {
      total: this.events.length,
      last24h: last24h.length,
      errors: this.events.filter(e => e.event === 'log_error').length,
      apiCalls: this.events.filter(e => e.event === 'api_call').length,
    };
  }
}

export const logger = new Logger();

// Performance monitoring helper
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.info(`Performance: ${name}`, { duration });
    return result;
  } catch (error: any) {
    const duration = Date.now() - start;
    logger.error(`Performance: ${name} failed`, { duration, error: error.message });
    throw error;
  }
}

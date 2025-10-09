import { NextResponse } from 'next/server';
import { isConfigured, getSafeConfig } from '@/lib/config';
import { logger } from '@/lib/logger';

export async function GET() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
    },
    config: getSafeConfig(),
    stats: logger.getStats(),
  };

  // Check if critical services are configured
  if (!isConfigured()) {
    return NextResponse.json(
      { ...health, status: 'degraded', error: 'API key not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json(health);
}

/**
 * Performance Monitor Component
 * Real-time performance metrics display
 */

import React, { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    loadTime: 0,
    apiCalls: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({ ...prev, fps: frames }));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Monitor memory (if available)
    if (performance.memory) {
      const updateMemory = () => {
        const used = performance.memory.usedJSHeapSize / 1048576; // MB
        setMetrics(prev => ({ ...prev, memory: used.toFixed(2) }));
      };
      
      updateMemory();
      const memoryInterval = setInterval(updateMemory, 2000);
      
      return () => clearInterval(memoryInterval);
    }

    // Get page load time
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      setMetrics(prev => ({ ...prev, loadTime: loadTime.toFixed(0) }));
    }
  }, []);

  const getStatusColor = (metric, value) => {
    switch (metric) {
      case 'fps':
        return value >= 55 ? 'green' : value >= 30 ? 'yellow' : 'red';
      case 'memory':
        return value < 50 ? 'green' : value < 100 ? 'yellow' : 'red';
      case 'loadTime':
        return value < 2000 ? 'green' : value < 4000 ? 'yellow' : 'red';
      default:
        return 'green';
    }
  };

  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={18} className="text-blue-600" />
        <h3 className="font-bold text-slate-900">Performance</h3>
      </div>

      <div className="space-y-2">
        {/* FPS */}
        <div className={`flex justify-between items-center p-2 rounded-lg border ${colorClasses[getStatusColor('fps', metrics.fps)]}`}>
          <span className="text-sm font-medium">FPS</span>
          <span className="text-lg font-bold">{metrics.fps}</span>
        </div>

        {/* Memory */}
        {metrics.memory > 0 && (
          <div className={`flex justify-between items-center p-2 rounded-lg border ${colorClasses[getStatusColor('memory', metrics.memory)]}`}>
            <span className="text-sm font-medium">Memory</span>
            <span className="text-lg font-bold">{metrics.memory} MB</span>
          </div>
        )}

        {/* Load Time */}
        {metrics.loadTime > 0 && (
          <div className={`flex justify-between items-center p-2 rounded-lg border ${colorClasses[getStatusColor('loadTime', metrics.loadTime)]}`}>
            <span className="text-sm font-medium">Load Time</span>
            <span className="text-lg font-bold">{metrics.loadTime} ms</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Real-time performance metrics
        </p>
      </div>
    </div>
  );
}

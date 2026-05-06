/**
 * Analytics System
 * Track user actions and generate insights
 */

/**
 * Analytics event types
 */
export const EventTypes = {
  PAGE_VIEW: 'page_view',
  USER_ACTION: 'user_action',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  BUSINESS: 'business',
};

/**
 * Analytics store (in-memory, can be replaced with IndexedDB)
 */
class AnalyticsStore {
  constructor() {
    this.events = [];
    this.maxEvents = 1000;
  }

  addEvent(event) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
    });

    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Persist to localStorage
    this.persist();
  }

  getEvents(filter = {}) {
    let filtered = [...this.events];

    if (filter.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter.startDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) <= new Date(filter.endDate));
    }

    return filtered;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  getUserId() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }

  persist() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100)));
    } catch (error) {
      console.error('[Analytics] Failed to persist:', error);
    }
  }

  load() {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Analytics] Failed to load:', error);
    }
  }

  clear() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }
}

const store = new AnalyticsStore();
store.load();

/**
 * Track page view
 */
export function trackPageView(page, metadata = {}) {
  store.addEvent({
    type: EventTypes.PAGE_VIEW,
    page,
    metadata,
  });

  console.log('[Analytics] Page view:', page);
}

/**
 * Track user action
 */
export function trackAction(action, category, metadata = {}) {
  store.addEvent({
    type: EventTypes.USER_ACTION,
    action,
    category,
    metadata,
  });

  console.log('[Analytics] Action:', action, category);
}

/**
 * Track error
 */
export function trackError(error, context = {}) {
  store.addEvent({
    type: EventTypes.ERROR,
    error: {
      message: error.message,
      stack: error.stack,
      type: error.type || error.name,
    },
    context,
  });

  console.log('[Analytics] Error:', error.message);
}

/**
 * Track performance metric
 */
export function trackPerformance(metric, value, metadata = {}) {
  store.addEvent({
    type: EventTypes.PERFORMANCE,
    metric,
    value,
    metadata,
  });

  console.log('[Analytics] Performance:', metric, value);
}

/**
 * Track business event
 */
export function trackBusiness(event, data = {}) {
  store.addEvent({
    type: EventTypes.BUSINESS,
    event,
    data,
  });

  console.log('[Analytics] Business:', event);
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(startDate, endDate) {
  const events = store.getEvents({ startDate, endDate });

  const summary = {
    totalEvents: events.length,
    pageViews: events.filter(e => e.type === EventTypes.PAGE_VIEW).length,
    userActions: events.filter(e => e.type === EventTypes.USER_ACTION).length,
    errors: events.filter(e => e.type === EventTypes.ERROR).length,
    businessEvents: events.filter(e => e.type === EventTypes.BUSINESS).length,
    uniqueSessions: new Set(events.map(e => e.sessionId)).size,
    uniqueUsers: new Set(events.map(e => e.userId)).size,
  };

  // Top pages
  const pageViews = events.filter(e => e.type === EventTypes.PAGE_VIEW);
  const pageCounts = {};
  pageViews.forEach(e => {
    pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
  });
  summary.topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));

  // Top actions
  const actions = events.filter(e => e.type === EventTypes.USER_ACTION);
  const actionCounts = {};
  actions.forEach(e => {
    const key = `${e.category}:${e.action}`;
    actionCounts[key] = (actionCounts[key] || 0) + 1;
  });
  summary.topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));

  // Error types
  const errorTypes = {};
  events.filter(e => e.type === EventTypes.ERROR).forEach(e => {
    const type = e.error.type || 'Unknown';
    errorTypes[type] = (errorTypes[type] || 0) + 1;
  });
  summary.errorTypes = Object.entries(errorTypes)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  return summary;
}

/**
 * Get user journey
 */
export function getUserJourney(sessionId) {
  const events = store.getEvents().filter(e => e.sessionId === sessionId);
  return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Export analytics data
 */
export function exportAnalytics(format = 'json') {
  const events = store.getEvents();

  if (format === 'json') {
    return JSON.stringify(events, null, 2);
  }

  if (format === 'csv') {
    const headers = ['timestamp', 'type', 'sessionId', 'userId', 'data'];
    const rows = events.map(e => [
      e.timestamp,
      e.type,
      e.sessionId,
      e.userId,
      JSON.stringify(e),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  return events;
}

/**
 * Clear analytics data
 */
export function clearAnalytics() {
  store.clear();
  console.log('[Analytics] Data cleared');
}

/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor page load
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      trackPerformance('page_load', perfData.loadEventEnd - perfData.fetchStart, {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      });
    }
  });

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            trackPerformance('long_task', entry.duration, {
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('[Analytics] Long task monitoring not supported');
    }
  }

  // Monitor resource timing
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) {
            trackPerformance('slow_resource', entry.duration, {
              name: entry.name,
              type: entry.initiatorType,
            });
          }
        }
      });
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('[Analytics] Resource timing monitoring not supported');
    }
  }
}

/**
 * Initialize analytics
 */
export function initAnalytics() {
  console.log('[Analytics] Initialized');
  setupPerformanceMonitoring();

  // Track initial page view
  trackPageView(window.location.pathname);

  // Track navigation
  if (typeof window !== 'undefined') {
    let lastPath = window.location.pathname;
    setInterval(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        trackPageView(currentPath);
        lastPath = currentPath;
      }
    }, 1000);
  }
}

export default {
  trackPageView,
  trackAction,
  trackError,
  trackPerformance,
  trackBusiness,
  getAnalyticsSummary,
  getUserJourney,
  exportAnalytics,
  clearAnalytics,
  initAnalytics,
};

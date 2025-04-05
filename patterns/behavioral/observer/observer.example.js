import { Subject, ConcreteObserver } from './observer.implementation.js';

/**
 * ServerMonitor class that extends Subject
 * Monitors server metrics and notifies observers when thresholds are exceeded
 */
class ServerMonitor extends Subject {
  constructor(serverName) {
    super();
    this.serverName = serverName;
    this.metrics = {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      responseTime: 0,
      errorRate: 0,
      requestCount: 0,
    };
    this.thresholds = {
      cpu: 80, // percent
      memory: 85, // percent
      disk: 90, // percent
      network: 800, // Mbps
      responseTime: 500, // ms
      errorRate: 5, // percent
    };
    this.alerts = [];
  }

  /**
   * Updates server metrics and checks for threshold violations
   * @param {Object} newMetrics - New metric values
   */
  updateMetrics(newMetrics) {
    // Update metrics with new values
    Object.assign(this.metrics, newMetrics);

    // Check for threshold violations
    const alerts = this.checkThresholds();

    // If we have alerts, update state and notify observers
    if (alerts.length > 0) {
      this.alerts = alerts;
      this.setState({
        serverName: this.serverName,
        timestamp: new Date(),
        metrics: { ...this.metrics },
        alerts: this.alerts,
      });
    }
  }

  /**
   * Checks if any metrics exceed their thresholds
   * @returns {Array} Array of alert objects
   */
  checkThresholds() {
    const alerts = [];

    // Check each metric against its threshold
    for (const [metric, value] of Object.entries(this.metrics)) {
      if (this.thresholds[metric] && value > this.thresholds[metric]) {
        alerts.push({
          metric,
          value,
          threshold: this.thresholds[metric],
          message: `${metric.toUpperCase()} threshold exceeded on ${this.serverName}`,
        });
      }
    }

    return alerts;
  }

  /**
   * Updates the threshold for a specific metric
   * @param {string} metric - The metric name
   * @param {number} value - The new threshold value
   */
  setThreshold(metric, value) {
    if (this.thresholds.hasOwnProperty(metric)) {
      this.thresholds[metric] = value;
      console.log(`Updated ${metric} threshold to ${value} for ${this.serverName}`);
    }
  }

  /**
   * Simulates random metric updates for demonstration
   */
  simulateMetricUpdates() {
    const interval = setInterval(() => {
      // Generate random metrics
      this.updateMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(50 + Math.random() * 50),
        network: Math.floor(Math.random() * 1000),
        responseTime: Math.floor(Math.random() * 1000),
        errorRate: Math.floor(Math.random() * 10),
        requestCount: Math.floor(Math.random() * 1000),
      });
    }, 2000);

    // Return a function to stop the simulation
    return () => clearInterval(interval);
  }
}

/**
 * Different observer types for the server monitoring system
 */

// DevOps team notification observer
class DevOpsNotifier extends ConcreteObserver {
  constructor(name, notificationMethod) {
    super(name, (data) => {
      this.sendAlert(data);
    });
    this.notificationMethod = notificationMethod || 'slack';
  }

  sendAlert(data) {
    const { serverName, alerts } = data;

    alerts.forEach((alert) => {
      console.log(`[${this.notificationMethod.toUpperCase()}] DevOps Alert: ${alert.message}`);
      console.log(`  Value: ${alert.value}, Threshold: ${alert.threshold}`);
      console.log(`  Timestamp: ${data.timestamp}`);
    });
  }
}

// Metrics logger observer
class MetricsLogger extends ConcreteObserver {
  constructor(name, logFormat = 'json') {
    super(name, (data) => {
      this.logMetrics(data);
    });
    this.logFormat = logFormat;
    this.logs = [];
  }

  logMetrics(data) {
    const logEntry = {
      timestamp: data.timestamp,
      server: data.serverName,
      metrics: data.metrics,
      alerts: data.alerts.map((a) => a.message),
    };

    this.logs.push(logEntry);

    if (this.logFormat === 'json') {
      console.log(`[LOG] ${JSON.stringify(logEntry)}`);
    } else {
      console.log(`[LOG] Server: ${data.serverName}, Alerts: ${data.alerts.length}`);
    }
  }

  getLogs() {
    return this.logs;
  }
}

// Auto-scaling observer that can take automated actions
class AutoScaler extends ConcreteObserver {
  constructor(name) {
    super(name, (data) => {
      this.evaluateScaling(data);
    });
    this.scalingActions = [];
  }

  evaluateScaling(data) {
    const { metrics, serverName } = data;

    if (metrics.cpu > 90 || metrics.memory > 95) {
      const action = {
        timestamp: new Date(),
        server: serverName,
        action: 'scale_up',
        reason: `High resource usage: CPU ${metrics.cpu}%, Memory ${metrics.memory}%`,
      };

      this.scalingActions.push(action);
      console.log(`[AUTO-SCALE] Initiating scale up for ${serverName}: ${action.reason}`);
    }
  }

  getScalingHistory() {
    return this.scalingActions;
  }
}

/**
 * Example usage
 */
function runMonitoringExample() {
  // Create a server monitor
  const webServer = new ServerMonitor('web-server-prod-01');

  // Create observers
  const devOpsTeam = new DevOpsNotifier('DevOps Team');
  const logger = new MetricsLogger('Metrics Logger');
  const scaler = new AutoScaler('Auto Scaler');

  // Subscribe observers to the monitor
  webServer.subscribe(devOpsTeam).subscribe(logger).subscribe(scaler);

  // Set custom thresholds
  webServer.setThreshold('cpu', 75);
  webServer.setThreshold('responseTime', 300);

  // Start the simulation
  console.log('Starting server monitoring...');
  const stopSimulation = webServer.simulateMetricUpdates();

  // In a real application, we would keep the monitoring running
  // For this example, we'll stop after 10 seconds
  setTimeout(() => {
    stopSimulation();
    console.log('Monitoring stopped.');
    console.log(`Recorded ${logger.getLogs().length} alert events`);
    console.log(`Triggered ${scaler.getScalingHistory().length} scaling actions`);
  }, 10000);
}

runMonitoringExample();

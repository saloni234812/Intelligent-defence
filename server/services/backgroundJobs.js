const cron = require('node-cron');
const Alert = require('../models/Alert');
const Radar = require('../models/Radar');
const { NotificationUtils } = require('../utils/notifications');
const { DateTimeUtils } = require('../utils/dateTime');

class BackgroundJobService {
  constructor() {
    this.notificationUtils = new NotificationUtils();
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start all background jobs
   */
  start() {
    if (this.isRunning) {
      console.log('Background jobs already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting background jobs...');

    // Schedule jobs
    this.scheduleAlertCleanup();
    this.scheduleRadarDataCleanup();
    this.scheduleSystemHealthCheck();
    this.scheduleThreatAnalysis();
    this.scheduleNotificationCleanup();

    console.log('Background jobs started successfully');
  }

  /**
   * Stop all background jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log('Background jobs not running');
      return;
    }

    this.isRunning = false;
    
    // Stop all scheduled jobs
    for (const [name, job] of this.jobs) {
      job.destroy();
      console.log(`Stopped job: ${name}`);
    }

    this.jobs.clear();
    console.log('All background jobs stopped');
  }

  /**
   * Schedule alert cleanup job (runs daily at 2 AM)
   */
  scheduleAlertCleanup() {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('Running alert cleanup job...');
        
        // Delete alerts older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Alert.deleteMany({
          created_at: { $lt: thirtyDaysAgo },
          status: { $in: ['RESOLVED', 'FALSE_POSITIVE'] }
        });

        console.log(`Alert cleanup completed: ${result.deletedCount} alerts deleted`);
      } catch (error) {
        console.error('Alert cleanup job failed:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('alertCleanup', job);
    job.start();
  }

  /**
   * Schedule radar data cleanup job (runs every 6 hours)
   */
  scheduleRadarDataCleanup() {
    const job = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('Running radar data cleanup job...');
        
        // Delete radar data older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = await Radar.deleteMany({
          timestamp: { $lt: sevenDaysAgo }
        });

        console.log(`Radar cleanup completed: ${result.deletedCount} records deleted`);
      } catch (error) {
        console.error('Radar cleanup job failed:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('radarCleanup', job);
    job.start();
  }

  /**
   * Schedule system health check (runs every 5 minutes)
   */
  scheduleSystemHealthCheck() {
    const job = cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Running system health check...');
        
        // Check for stuck alerts (active for more than 1 hour)
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const stuckAlerts = await Alert.find({
          status: 'ACTIVE',
          created_at: { $lt: oneHourAgo }
        });

        if (stuckAlerts.length > 0) {
          console.warn(`Found ${stuckAlerts.length} stuck alerts`);
          
          // Send notification about stuck alerts
          await this.notificationUtils.sendSystemStatusNotification(
            'WARNING',
            `Found ${stuckAlerts.length} alerts that have been active for more than 1 hour`
          );
        }

        // Check system resources
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
          console.warn('High memory usage detected');
        }

        console.log('System health check completed');
      } catch (error) {
        console.error('System health check failed:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('systemHealthCheck', job);
    job.start();
  }

  /**
   * Schedule threat analysis job (runs every 15 minutes)
   */
  scheduleThreatAnalysis() {
    const job = cron.schedule('*/15 * * * *', async () => {
      try {
        console.log('Running threat analysis job...');
        
        // Analyze recent alerts for patterns
        const fifteenMinutesAgo = new Date();
        fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

        const recentAlerts = await Alert.find({
          created_at: { $gte: fifteenMinutesAgo }
        });

        // Group alerts by threat type
        const threatTypeCounts = {};
        recentAlerts.forEach(alert => {
          threatTypeCounts[alert.threat_type] = (threatTypeCounts[alert.threat_type] || 0) + 1;
        });

        // Check for unusual patterns
        for (const [threatType, count] of Object.entries(threatTypeCounts)) {
          if (count >= 5) {
            console.warn(`High frequency of ${threatType} alerts: ${count} in 15 minutes`);
            
            // Send notification about high frequency
            await this.notificationUtils.sendSystemStatusNotification(
              'WARNING',
              `High frequency of ${threatType} alerts detected: ${count} in the last 15 minutes`
            );
          }
        }

        console.log('Threat analysis completed');
      } catch (error) {
        console.error('Threat analysis job failed:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('threatAnalysis', job);
    job.start();
  }

  /**
   * Schedule notification cleanup job (runs daily at 3 AM)
   */
  scheduleNotificationCleanup() {
    const job = cron.schedule('0 3 * * *', async () => {
      try {
        console.log('Running notification cleanup job...');
        
        // Clean up old notification logs
        // This would typically clean up a notifications collection
        // For now, we'll just log the action
        
        console.log('Notification cleanup completed');
      } catch (error) {
        console.error('Notification cleanup job failed:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('notificationCleanup', job);
    job.start();
  }

  /**
   * Get job status
   * @returns {Object} Job status information
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: {}
    };

    for (const [name, job] of this.jobs) {
      status.jobs[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }

    return status;
  }

  /**
   * Manually trigger a job
   * @param {string} jobName - Name of the job to trigger
   */
  async triggerJob(jobName) {
    switch (jobName) {
      case 'alertCleanup':
        await this.scheduleAlertCleanup();
        break;
      case 'radarCleanup':
        await this.scheduleRadarDataCleanup();
        break;
      case 'systemHealthCheck':
        await this.scheduleSystemHealthCheck();
        break;
      case 'threatAnalysis':
        await this.scheduleThreatAnalysis();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}

module.exports = BackgroundJobService;



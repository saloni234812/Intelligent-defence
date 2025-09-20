// Simple pluggable AI monitor. In production, replace with model inference.
// Consumes events from the controller's EventEmitter via registration.

class RadarAiMonitor {
  constructor() {
    this.listeners = [];
  }

  register(onEvent) {
    this.listeners.push(onEvent);
  }

  analyze(event) {
    // event: { type: 'detection', detection, anomaly }
    if (event.type !== 'detection') return null;
    const { detection, anomaly } = event;
    const tags = [];
    if (detection.velocityMps > 200) tags.push('high-speed');
    if (detection.rcs > 25) tags.push('large-rcs');
    if (detection.rangeMeters < 500) tags.push('close-range');
    const level = anomaly > 0.7 ? 'CRITICAL' : anomaly > 0.4 ? 'HIGH' : anomaly > 0.2 ? 'MEDIUM' : 'LOW';
    const insight = {
      type: 'ai_insight',
      level,
      message: `Anomaly ${Math.round(anomaly * 100)}%: ${tags.join(', ') || 'nominal'}`,
      detectionId: detection._id,
      radarId: detection.radarId,
      timestamp: Date.now()
    };
    return insight;
  }

  attachTo(bus) {
    bus.on('radar', (event) => {
      const insight = this.analyze(event);
      if (insight) {
        // fan-out to subscribers
        this.listeners.forEach(fn => fn(insight));
      }
    });
  }
}

module.exports = new RadarAiMonitor();





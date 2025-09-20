// Mock database for development - replace with real Supabase in production
let mockData = {
  alerts: [
    {
      id: '1',
      alert_type: 'CRITICAL',
      title: 'Unauthorized Aircraft Detected',
      description: 'Low-flying aircraft detected in restricted airspace',
      location: 'Sector Alpha-7',
      confidence: 95,
      status: 'ACTIVE',
      threat_type: 'AIRCRAFT_THREAT',
      threat_category: 'AERIAL',
      source: 'RADAR',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    {
      id: '2',
      alert_type: 'HIGH',
      title: 'Perimeter Breach Detected',
      description: 'Motion sensors triggered at perimeter fence',
      location: 'North Gate',
      confidence: 88,
      status: 'ACTIVE',
      threat_type: 'PHYSICAL_INTRUSION',
      threat_category: 'PHYSICAL',
      source: 'SENSOR',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    {
      id: '3',
      alert_type: 'MEDIUM',
      title: 'Suspicious Network Activity',
      description: 'Multiple failed login attempts detected',
      location: 'Network Segment B',
      confidence: 72,
      status: 'INVESTIGATING',
      threat_type: 'CYBER_INTRUSION',
      threat_category: 'CYBER',
      source: 'SYSTEM',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: '4',
      alert_type: 'HIGH',
      title: 'UAV Threat Detected',
      description: 'Unmanned aerial vehicle spotted in restricted zone',
      location: 'Sector Bravo-3',
      confidence: 91,
      status: 'ACTIVE',
      threat_type: 'UAV_THREAT',
      threat_category: 'AERIAL',
      source: 'RADAR',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    },
    {
      id: '5',
      alert_type: 'LOW',
      title: 'Equipment Maintenance Required',
      description: 'Camera system requires calibration',
      location: 'Tower 12',
      confidence: 100,
      status: 'ACKNOWLEDGED',
      threat_type: 'MAINTENANCE_REQUIRED',
      threat_category: 'EQUIPMENT',
      source: 'SYSTEM',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    }
  ],
  radar_detections: [],
  playbooks: [],
  users_app: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@aegis.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'Admin',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Operator User',
      email: 'operator@aegis.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'Operator',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Test User',
      email: 'test@test.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'User',
      created_at: new Date().toISOString()
    },
    // Demo credentials
    {
      id: '4',
      name: 'Demo User',
      email: 'demo@aegis.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'User',
      created_at: new Date().toISOString()
    }
  ]
};

async function connectDB() {
  console.log('✅ Mock database initialized for development');
  return mockData;
}

function getSupabase() {
  return {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          data: mockData[table]?.filter(item => item[column] === value) || [],
          error: null,
          maybeSingle: () => {
            const items = mockData[table]?.filter(item => item[column] === value) || [];
            return {
              data: items.length > 0 ? items[0] : null,
              error: null
            };
          }
        }),
        order: (column, options = {}) => ({
          limit: (count) => ({
            data: mockData[table]?.slice(0, count) || [],
            error: null
          }),
          data: mockData[table]?.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];
            if (options.ascending === false) {
              return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
          }) || [],
          error: null
        }),
        data: mockData[table] || [],
        error: null
      }),
      insert: (data) => ({
        select: (columns = '*') => ({
          single: () => {
            const newItem = { id: Date.now(), ...data[0], created_at: new Date().toISOString() };
            if (!mockData[table]) mockData[table] = [];
            mockData[table].unshift(newItem);
            return { data: newItem, error: null };
          }
        })
      }),
      update: (updates) => ({
        eq: (column, value) => ({
          select: (columns = '*') => ({
            single: () => {
              const item = mockData[table]?.find(item => item[column] === value);
              if (item) {
                Object.assign(item, updates, { updated_at: new Date().toISOString() });
                return { data: item, error: null };
              }
              return { data: null, error: { message: 'Not found' } };
            }
          })
        })
      }),
      delete: () => ({
        neq: (column, value) => ({
          data: null,
          error: null
        })
      })
    })
  };
}

module.exports = connectDB;
module.exports.getSupabase = getSupabase;

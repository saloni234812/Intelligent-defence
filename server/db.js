// Mock database for development - replace with real Supabase in production
let mockData = {
  alerts: [],
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

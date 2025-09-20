// Simple connection test script using built-in global fetch (Node 18+)

async function testConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test basic server health
    const response = await fetch('http://localhost:5000/');
    const data = await response.json();
    console.log('✅ Backend server is running:', data.message);
    
    // Authenticate as an admin to access protected endpoints
    let token = '';
    try {
      const loginRes = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@aegis.com', password: 'password' })
      });
      const loginBody = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) {
        console.log(`❌ Login failed: ${loginRes.status} ${loginRes.statusText} -> ${JSON.stringify(loginBody)}`);
      } else {
        token = loginBody.token || '';
        console.log('✅ Authenticated as admin@aegis.com');
      }
    } catch (e) {
      console.log(`❌ Login error: ${e.message}`);
    }

    // Test API endpoints
    const endpoints = [
      '/api/system/status',
      '/api/system/health',
      '/api/alerts',
      '/api/radar',
      '/api/playbooks',
      '/api/maps/alpha',
      '/api/threats'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`http://localhost:5000${endpoint}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          let body = '';
          try { body = await res.text(); } catch {}
          console.log(`❌ ${endpoint}: ${res.status} ${res.statusText}${body ? ` -> ${body}` : ''}`);
        } else {
          console.log(`✅ ${endpoint}: ${res.status} ${res.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Backend connection test completed!');
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n💡 Make sure to start the backend server first:');
    console.log('   cd server && npm install && npm run dev');
  }
}

testConnection();
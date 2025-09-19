// Simple connection test script
const fetch = require('node-fetch');

async function testConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test basic server health
    const response = await fetch('http://localhost:5000/');
    const data = await response.json();
    console.log('✅ Backend server is running:', data.message);
    
    // Test API endpoints
    const endpoints = [
      '/api/system/status',
      '/api/alerts',
      '/api/radar',
      '/api/playbooks'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`http://localhost:5000${endpoint}`);
        console.log(`✅ ${endpoint}: ${res.status} ${res.statusText}`);
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
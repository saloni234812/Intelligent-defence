// Test authentication endpoints
const fetch = require('node-fetch');

async function testAuthentication() {
  console.log('🔐 Testing Authentication System...\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test 1: Server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${baseUrl}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Server is running:', healthData.message);
    
    // Test 2: Login with test user
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData.message);
      console.log('   Token received:', loginData.token ? 'Yes' : 'No');
      
      // Test 3: Get user info with token
      console.log('\n3. Testing user info endpoint...');
      const meResponse = await fetch(`${baseUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (meResponse.ok) {
        const userData = await meResponse.json();
        console.log('✅ User info retrieved:', userData.user);
      } else {
        const errorData = await meResponse.json();
        console.log('❌ User info failed:', errorData.error);
      }
      
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData.message);
    }
    
    // Test 4: Test CORS with different origin
    console.log('\n4. Testing CORS configuration...');
    const corsResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5174',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS preflight successful');
      console.log('   Access-Control-Allow-Origin:', corsResponse.headers.get('access-control-allow-origin'));
      console.log('   Access-Control-Allow-Credentials:', corsResponse.headers.get('access-control-allow-credentials'));
    } else {
      console.log('❌ CORS preflight failed');
    }
    
    console.log('\n🎉 Authentication system test completed!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: test@test.com');
    console.log('   Password: password');
    console.log('   Role: User');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure both backend and frontend servers are running:');
    console.log('   Backend: cd server && npm start');
    console.log('   Frontend: cd client && npm run dev');
  }
}

testAuthentication();

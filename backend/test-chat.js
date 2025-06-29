const axios = require('axios');

// Test chat functionality
async function testChat() {
  try {
    console.log('Testing chat functionality...');
    
    // Test 1: Check if chat routes are accessible
    const response = await axios.get('http://localhost:3000/api/chat/messages/event/test123');
    console.log('✅ Chat routes are accessible');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Chat routes require authentication (expected)');
    } else {
      console.log('❌ Chat routes test failed:', error.message);
    }
  }
  
  try {
    // Test 2: Check if socket server is running
    const socketResponse = await axios.get('http://localhost:3000');
    console.log('✅ Backend server is running');
  } catch (error) {
    console.log('❌ Backend server test failed:', error.message);
  }
  
  try {
    // Test 3: Check if frontend is accessible
    const frontendResponse = await axios.get('http://localhost:5174');
    console.log('✅ Frontend server is running');
  } catch (error) {
    console.log('❌ Frontend server test failed:', error.message);
  }
}

testChat(); 
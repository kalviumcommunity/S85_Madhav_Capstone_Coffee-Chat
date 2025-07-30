const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the group privacy functionality
async function testGroupPrivacy() {
  try {
    console.log('🧪 Testing Group Privacy Functionality...\n');

    // 1. Test creating a private group
    console.log('1. Creating a private group...');
    const createResponse = await axios.post(`${BASE_URL}/groups`, {
      name: 'Test Private Group',
      description: 'A test private group for testing privacy functionality',
      category: 'Technology',
      city: 'Test City',
      privacy: 'private',
      image: 'https://via.placeholder.com/400x200'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    console.log('✅ Private group created:', createResponse.data._id);
    const groupId = createResponse.data._id;

    // 2. Test joining a private group (should create pending request)
    console.log('\n2. Testing join request for private group...');
    try {
      const joinResponse = await axios.post(`${BASE_URL}/groups/${groupId}/join`, {}, {
        headers: {
          'Authorization': 'Bearer ANOTHER_USER_TOKEN_HERE' // Replace with different user token
        }
      });
      console.log('✅ Join request sent:', joinResponse.data.message);
    } catch (error) {
      console.log('❌ Join request failed:', error.response?.data?.message || error.message);
    }

    // 3. Test getting pending requests
    console.log('\n3. Testing get pending requests...');
    try {
      const pendingResponse = await axios.get(`${BASE_URL}/groups/${groupId}/pending-requests`, {
        headers: {
          'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with organizer token
        }
      });
      console.log('✅ Pending requests retrieved:', pendingResponse.data.length, 'requests');
    } catch (error) {
      console.log('❌ Get pending requests failed:', error.response?.data?.message || error.message);
    }

    // 4. Test creating a public group
    console.log('\n4. Creating a public group...');
    const createPublicResponse = await axios.post(`${BASE_URL}/groups`, {
      name: 'Test Public Group',
      description: 'A test public group for testing privacy functionality',
      category: 'Technology',
      city: 'Test City',
      privacy: 'public',
      image: 'https://via.placeholder.com/400x200'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    console.log('✅ Public group created:', createPublicResponse.data._id);
    const publicGroupId = createPublicResponse.data._id;

    // 5. Test joining a public group (should join directly)
    console.log('\n5. Testing direct join for public group...');
    try {
      const joinPublicResponse = await axios.post(`${BASE_URL}/groups/${publicGroupId}/join`, {}, {
        headers: {
          'Authorization': 'Bearer ANOTHER_USER_TOKEN_HERE' // Replace with different user token
        }
      });
      console.log('✅ Direct join successful:', joinPublicResponse.data.message);
    } catch (error) {
      console.log('❌ Direct join failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Group privacy functionality test completed!');
    console.log('\n📝 Note: Replace JWT tokens with actual user tokens to run this test');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testGroupPrivacy(); 
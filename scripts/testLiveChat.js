const jwt = require('jsonwebtoken');

// 1. Generate a fake token for a random UUID
const senderId = '4bb24524-f84a-4b14-a7fc-67b188127a78'; // Real User

const token = jwt.sign(
  { id: senderId, role: 'user' },
  'verdict_secret_2024',
  { expiresIn: '1h' }
);

async function testLiveApi() {
  console.log('Token:', token);
  
  try {
    const res = await fetch('https://verdict.sbs/api/chat/conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const body = await res.text();
    console.log('Get Conversations Response:', res.status, body);
  } catch (e) {
    console.error('Fetch Error:', e);
  }
}

testLiveApi();

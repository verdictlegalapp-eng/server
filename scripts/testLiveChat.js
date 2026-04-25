const jwt = require('jsonwebtoken');

// 1. Generate a fake token for a random UUID
const senderId = '4bb24524-f84a-4b14-a7fc-67b188127a78'; // Real User
const receiverId = 'a6b17982-49a0-43de-9383-3546c3ed64c2'; // Real Lawyer

const token = jwt.sign(
  { id: senderId, role: 'user' },
  'verdict_secret_2024',
  { expiresIn: '1h' }
);

async function testLiveApi() {
  console.log('Token:', token);
  
  // Send message
  try {
    const res = await fetch('https://verdict.sbs/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId, text: 'Test message from server script' })
    });
    
    const body = await res.json();
    console.log('Send Message Response:', res.status, body);
  } catch (e) {
    console.error('Fetch Error:', e);
  }
}

testLiveApi();

// Quick authentication test script
// Run this in the browser console to test auth flow

console.log('=== AUTHENTICATION FLOW TEST ===');

// Check if token exists
const token = localStorage.getItem('token');
console.log('1. Token exists:', !!token);

if (token) {
  console.log('2. Token length:', token.length);
  
  // Test token decoding
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('3. Token payload:', payload);
      console.log('4. Token expires:', new Date(payload.exp * 1000));
      console.log('5. Current time:', new Date());
      console.log('6. Token expired:', payload.exp * 1000 < Date.now());
      console.log('7. User role:', payload.user?.role);
    } else {
      console.log('3. Invalid token format');
    }
  } catch (e) {
    console.log('3. Token decode error:', e);
  }
} else {
  console.log('2. No token found - user should login');
}

// Test API endpoint
console.log('8. Testing protected API endpoint...');
fetch('/api/analyses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('9. API Response status:', response.status);
  if (response.status === 401) {
    console.log('   -> Authentication failed');
  } else if (response.ok) {
    console.log('   -> Authentication successful');
  }
  return response.json();
})
.then(data => {
  console.log('10. API Response data:', data);
})
.catch(error => {
  console.log('10. API Error:', error);
});

console.log('=== TEST COMPLETE ===');
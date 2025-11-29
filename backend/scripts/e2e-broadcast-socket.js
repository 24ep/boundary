// E2E test: authenticate, call admin broadcast, connect a Socket.IO client and verify event
// This script assumes the backend server is running locally and admin credentials/token are available.

const axios = require('axios').default;
const io = require('socket.io-client');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function run() {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      console.error('ADMIN_TOKEN env var is required');
      process.exit(1);
    }

    // Connect socket
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      auth: { token: adminToken }
    });

    await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error('Socket connect timeout')), 10000);
      socket.on('connect', () => { clearTimeout(to); resolve(null); });
      socket.on('connect_error', reject);
    });

    let received = false;
    socket.on('admin:broadcast', (payload) => {
      received = true;
      console.log('Received broadcast payload:', payload);
    });

    // Trigger admin broadcast
    const title = 'E2E Broadcast Test';
    const message = `Hello at ${new Date().toISOString()}`;
    await axios.post(`${API_BASE}/api/admin/broadcast`, {
      title,
      message,
      type: 'notification',
      target: 'all'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    // Wait for event
    await new Promise((resolve) => setTimeout(resolve, 3000));
    socket.close();

    if (!received) {
      console.error('Did not receive broadcast on socket');
      process.exit(2);
    }

    console.log('E2E broadcast/socket test passed');
    process.exit(0);
  } catch (err) {
    console.error('E2E test failed:', err.message);
    process.exit(1);
  }
}

run();




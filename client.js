// 客户端代码
const io = require('socket.io-client');

const socket = io('http://localhost:8000', {
  auth: {
    platformIdentifier: 'pc_official', // 你的平台标识
    userId: 'user123' // 可选，客户端用户ID
  }
});

// 监听连接成功
socket.on('connected', (data) => {
  console.log('连接成功:', data);
});

// 监听错误
socket.on('error', (err) => {
  console.error('连接失败:', err.message);
});

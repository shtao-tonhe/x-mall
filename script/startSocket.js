// /script/startSocket.js
const { initSocketServer } = require('../socket');

// 启动Socket服务器，监听8000端口
initSocketServer(8000);
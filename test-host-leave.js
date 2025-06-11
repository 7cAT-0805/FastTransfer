/**
 * 測試房主離開功能的腳本
 * 模擬房主創建房間並離開，驗證其他用戶是否收到房間關閉通知
 */

const io = require('socket.io-client');

// 測試配置
const SERVER_URL = 'http://localhost:3001';
const TEST_ROOM_ID = 'TEST_ROOM_' + Date.now();

console.log(`開始測試房主離開功能...`);
console.log(`測試房間 ID: ${TEST_ROOM_ID}`);

// 模擬房主
const hostSocket = io(SERVER_URL, {
  auth: { hostId: 'test-host-123' }
});

// 模擬普通用戶
const userSocket = io(SERVER_URL);

let hostConnected = false;
let userConnected = false;
let roomCreated = false;
let userJoinedRoom = false;

// 房主連接事件
hostSocket.on('connect', () => {
  console.log('✅ 房主已連接');
  hostConnected = true;
  checkReadyToCreateRoom();
});

// 用戶連接事件
userSocket.on('connect', () => {
  console.log('✅ 用戶已連接');
  userConnected = true;
  checkReadyToJoinRoom();
});

// 檢查是否可以創建房間
function checkReadyToCreateRoom() {
  if (hostConnected && !roomCreated) {
    console.log('🏠 房主創建房間...');
      // 模擬創建房間的 API 請求
    fetch(`${SERVER_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostId: 'test-host-123'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.roomId) {
        console.log(`✅ 房間創建成功: ${data.roomId}`);
        roomCreated = true;
        
        // 更新房間 ID
        global.testRoomId = data.roomId;
        
        // 房主加入房間
        hostSocket.emit('joinRoom', data.roomId);
        
        // 等待一段時間後讓用戶加入
        setTimeout(() => {
          checkReadyToJoinRoom();
        }, 1000);
      }
    })
    .catch(error => {
      console.error('❌ 創建房間失敗:', error);
    });
  }
}

// 檢查是否可以加入房間
function checkReadyToJoinRoom() {
  if (userConnected && roomCreated && !userJoinedRoom && global.testRoomId) {
    console.log('👤 用戶加入房間...');
    userSocket.emit('joinRoom', global.testRoomId);
    userJoinedRoom = true;
    
    // 等待一段時間後斷開房主連接
    setTimeout(testHostLeave, 2000);
  }
}

// 房主加入房間事件
hostSocket.on('roomJoined', (data) => {
  console.log('✅ 房主已加入房間:', data);
});

// 用戶加入房間事件
userSocket.on('roomJoined', (data) => {
  console.log('✅ 用戶已加入房間:', data);
});

// 用戶收到房間關閉通知
userSocket.on('roomClosed', (data) => {
  console.log('🚨 用戶收到房間關閉通知:', data.message);
  console.log('✅ 測試成功！用戶正確收到房間關閉通知');
  cleanup();
});

// 參與者數量更新
hostSocket.on('participantCountUpdate', (count) => {
  console.log(`👥 房主看到參與者數量: ${count}`);
});

userSocket.on('participantCountUpdate', (count) => {
  console.log(`👥 用戶看到參與者數量: ${count}`);
});

// 錯誤處理
hostSocket.on('error', (error) => {
  console.error('❌ 房主錯誤:', error);
});

userSocket.on('error', (error) => {
  console.error('❌ 用戶錯誤:', error);
});

// 斷線處理
hostSocket.on('disconnect', (reason) => {
  console.log('🔌 房主已斷線:', reason);
});

userSocket.on('disconnect', (reason) => {
  console.log('🔌 用戶已斷線:', reason);
});

// 測試房主離開
function testHostLeave() {
  console.log('🔥 模擬房主離開...');
  hostSocket.disconnect();
  
  // 設置超時，如果 5 秒內沒有收到房間關閉通知則測試失敗
  setTimeout(() => {
    console.log('❌ 測試失敗！用戶未收到房間關閉通知');
    cleanup();
  }, 5000);
}

// 清理資源
function cleanup() {
  console.log('🧹 清理測試資源...');
  hostSocket.disconnect();
  userSocket.disconnect();
  process.exit(0);
}

// 處理程序退出
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

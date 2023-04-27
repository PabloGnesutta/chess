// DOM Elements
const clientIdEl = document.getElementById('client-id');
const joinRoomBtn = document.getElementById('join-room-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');
const roomMsgInput = document.getElementById('room-msg-input');
const roomChatArea = document.getElementById('room-msg-chat-area');
const sendToRoomBtn = document.getElementById('send-to-room-btn');

// STATE
let isWSOpen = false;
let clientId = null;
let activeRoomId = null;

// WebSocket
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = e => {
  log('websocket connection established');
  isWSOpen = true;
};

ws.onerror = e => flushSocket('ERROR');
ws.onclose = e => flushSocket('CLOSE');

function flushSocket(cause) {
  log('websocket closed because of', cause, 'event');
  ws.onmessage = null;
  ws.onerror = null;
  ws.onclose = null;
  ws.onopen = null;
  isWSOpen = false;
  clientId = null;
  activeRoomId = null;
}

ws.onmessage = e => {
  const data = JSON.parse(e.data);

  log('incoming message', data);

  switch (data.type) {
    case 'CLIENT_REGISTERED': {
      clientId = data.clientId;
      clientIdEl.innerText = 'Connected | Client ID: ' + clientId;
      break;
    }
    case 'ROOM_JOINED': {
      activeRoomId = data.room.id;
      joinRoomBtn.innerText = 'On Room ' + activeRoomId;
      joinRoomBtn.disabled = true;
      leaveRoomBtn.disabled = false;
      break;
    }
    case 'ROOM_LEFT': {
      activeRoomId = null;
      roomChatArea.innerText = null;
      joinRoomBtn.innerText = 'Join Room';
      joinRoomBtn.disabled = false;
      leaveRoomBtn.disabled = true;
      break;
    }
    case 'ROOM_MESSAGE': {
      const msgRow = document.createElement('span');
      msgRow.innerText = 'Client ' + data.clientId + ': ' + data.msg;
      roomChatArea.appendChild(msgRow);
      break;
    }
    case 'ACKNOWLEDGE': {
      // log('message successfully sent to websocket server');
      break;
    }
    default: {
      log('Message type not supported');
      break;
    }
  }
};

function wsSend(obj) {
  if (!isWSOpen) return log('websocket connection unavailable');
  ws.send(JSON.stringify(obj));
}

// ----------
// ROOM CHAT:

function joinRoom() {
  if (activeRoomId)
    return log('Leave the current room before joining another one');

  wsSend({ type: 'JOIN_ROOM' });
}

function leaveRoom() {
  if (!activeRoomId) return log('Not currently in a room, cannot leave');
  wsSend({ type: 'LEAVE_ROOM', roomId: activeRoomId });
}

function sendRoomMessage(e) {
  e.preventDefault();
  if (!activeRoomId) return log('Join a room before sending a message');

  wsSend({
    type: 'ROOM_MESSAGE',
    msg: roomMsgInput.value,
    roomId: activeRoomId,
  });
  roomMsgInput.value = '';
  sendToRoomBtn.disabled = true;
}

function setSendToRoomButtonState(e) {
  sendToRoomBtn.disabled = e.target.value ? false : true;
}

//

function closeSocket() {
  if (!isWSOpen) return log('websocket is already closed');
  ws.close();
}

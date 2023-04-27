import { drawBoard } from '../board.js';
import { board, state } from '../gameState.js';
import { initGame } from '../initGame.js';
import { clientIdElement, roomIdElement } from '../ui/lobby-UI.js';

// DOM Elements
// const roomMsgInput = document.getElementById('room-msg-input');
// const roomChatArea = document.getElementById('room-msg-chat-area');
// const sendToRoomBtn = document.getElementById('send-to-room-btn');

// STATE
let send;
let isWSOpen = false;
let clientId = null;
let activeRoomId = null;

function connectWebSocket() {
  return new Promise((resolve, reject) => {
    if (isWSOpen) return resolve(true);

    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = e => {
      log('Websocket connection established');
      isWSOpen = true;

      send = obj => ws.send(JSON.stringify(obj));

      resolve(true);
    };

    ws.onerror = e => {
      flushSocket(ws, 'ERROR', e);
      reject('Error connecting to websocket', e);
    };

    ws.onclose = e => flushSocket(ws, 'CLOSE', e);

    ws.onmessage = e => {
      const data = JSON.parse(e.data);

      log('Incoming message', data);

      switch (data.type) {
        case 'CLIENT_REGISTERED': {
          clientId = data.clientId;
          clientIdElement.innerText = 'Online | Client ID: ' + clientId;
          break;
        }
        case 'ROOM_JOINED': {
          activeRoomId = data.room.id;
          roomIdElement.innerText = 'On Room ' + activeRoomId;
          state.playerIsColor = data.isCreator ? 'w' : 'b';
          break;
        }
        case 'ROOM_READY': {
          // TODO
          // if (data.isRoomFilledAndReady) {
          //   log('ready to start game');
          //   drawBoard(board, state.playerIsColor);
          //   initGame();
          // }
          break;
        }
        case 'ROOM_LEFT': {
          activeRoomId = null;
          // roomChatArea.innerText = null;
          // joinRoomBtn.innerText = 'Join Room';
          // joinRoomBtn.disabled = false;
          // leaveRoomBtn.disabled = true;
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
  });
}

// WebSocket

function flushSocket(ws, cause, event) {
  log('Websocket flushed due to', cause, '-', event);
  ws.onmessage = null;
  ws.onerror = null;
  ws.onclose = null;
  ws.onopen = null;
  send = null;
  isWSOpen = false;
  clientId = null;
  activeRoomId = null;
  clientIdElement.innerText = 'Offline';
  roomIdElement.innerText = '';
}

// ----------
// ROOM CHAT:

function joinRoom() {
  if (activeRoomId)
    return log('Leave the current room before joining another one');

  send({ type: 'JOIN_ROOM' });
}

function leaveRoom() {
  if (!activeRoomId) return log('Not currently in a room, cannot leave');

  send({ type: 'LEAVE_ROOM', roomId: activeRoomId });
}

function sendRoomMessage(e) {
  e.preventDefault();

  if (!activeRoomId) return log('Join a room before sending a message');

  send({
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

export { connectWebSocket, joinRoom };

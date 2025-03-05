const WEBSOCKET_URL = "ws://localhost:8080";

export const createWebSocket = (onMessage: (data: any) => void) => {
  const socket = new WebSocket(WEBSOCKET_URL);
console.log('alert()',socket)
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return socket;
};

export const sendMessage = (socket: WebSocket, message: any) => {
  socket.send(JSON.stringify(message));
};
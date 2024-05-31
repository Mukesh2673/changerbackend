const WebSocket = require("ws");
ws = new WebSocket.Server({ port: 3002 });
// Map to store client connections
const clients = new Map();
ws.on("connection", (ws,req) => {    
const urlParams = new URLSearchParams(req.url.split('?')[1]);
const userId = urlParams.get('userId');
clients.set(userId, ws);
  ws.on("message", function incoming(message) {
  });
  ws.send("Connected to WebSocket server");
});
function sendMessage(type, data, id){ 
    const message = JSON.stringify({ type, data });
    let uid=id
    if (typeof uid === 'object') {
        uid=id.toString();
    }  
    console.log("message is",uid)
    const ws= clients.get(uid);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    }
    else{
        console.error(`WebSocket connection not found or not open for user ${uid}`);
    }
}

module.exports = {ws,sendMessage};

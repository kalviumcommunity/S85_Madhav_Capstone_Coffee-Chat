const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  withCredentials: true
});

socket.on("connect", () => {
  console.log("SOCKET.IO CONNECTED!");
  process.exit(0);
});
socket.on("connect_error", (err) => {
  console.log("SOCKET.IO ERROR:", err);
  process.exit(1);
});

import { io } from "socket.io-client";

const SOCKET_URL = "http://10.151.0.207:5000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default socket;
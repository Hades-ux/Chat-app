import { io } from "socket.io-client";

export const socket = io("https://chat-app-5sb9.onrender.com", {
  transports: ["websocket","polling"],
  withCredentials: true,
});

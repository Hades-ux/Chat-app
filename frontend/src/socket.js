import { io } from "socket.io-client";

export const socket = io("http://localhost:9999", {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
});

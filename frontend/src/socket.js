import { io } from "socket.io-client";

export const socket = io("http://localhost:9999", {
  transports: ["websocket","polling"],
  withCredentials: true,
});

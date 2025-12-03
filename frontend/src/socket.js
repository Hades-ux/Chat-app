import { io } from "socket.io-client";

export const socket = io("https://chat-app-ijbu.vercel.app/api/v1", {
  transports: ["websocket","polling"],
  withCredentials: true,
});

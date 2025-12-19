import app from "./app.js";
import connectDB from "./Src/DB/dataBase.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import redis from "./Src/redis.js";
import "dotenv/config";
import Message from "./Src/Models/Message.Model.js";

const PORT = process.env.PORT || 4444;
const allowedOrigins = ["http://localhost:5173"];

// Connect database & Redis
await redis.connect();
await connectDB();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const server = http.createServer(app);

// initialize socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// SOCKET.IO
io.on("connection", async (socket) => {
  console.log("NEW CLIENT CONNECTED");

  socket.on("setup", (user) => {
    socket.join(user);
    console.log("user joined the privet room");
  });

  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log("Chat Room is joined");

  });
  
  socket.on("sendMessage", async (data) => {
    console.log(data);
    io.to(data.chatId).emit("receiveMessage", data);
  });

  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
    console.log("Chat Room is left");
  });

  // ON DISCONNECT
  socket.on("disconnect", async () => {
    console.log("CLIENT DISCONNECTED\n");
  });

  // START SERVER
});
server.listen(PORT, () => {
  console.log(`\nServer running: http://localhost:${PORT}`);
});

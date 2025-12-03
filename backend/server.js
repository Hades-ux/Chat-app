import app from "./app.js";
import connectDB from "./Src/DB/dataBase.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import redis from "./Src/redis.js";

const PORT = process.env.PORT || 4444;
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-six-delta-19.vercel.app",
];

// Connect database and redis
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

// socket.io logic
io.on("connection", (socket) => {
  console.log(" NEW CLIENT CONNECTED:", socket.id);

  // join personal room for 1v1
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(` ${socket.id} joined room → ${roomId}`);
  });

  // send + receive messages
  socket.on("sendMessage", (data) => {
    const { sender, receiver, message } = data;

    if (!sender || !receiver || !message) return;

    const roomId = [sender, receiver].sort().join("_");

    io.to(roomId).emit("receiveMessage", {
      sender,
      message,
      timeStamp: new Date(),
    });
  });

  // typing...
  socket.on("Typing", (data) => {
    const { sender, receiver, isTyping } = data;

    if (!sender || !receiver) return;

    const roomId = [sender, receiver].sort().join("_");

    socket.to(roomId).emit("Typing", {
      sender,
      isTyping,
    });
  });

  // user disconnected
  socket.on("disconnect", () => {
    console.log(" CLIENT DISCONNECTED:", socket.id);
  });
});

// start server
try {
  server.listen(PORT, () => {
    console.log(`\nServer is running at: http://localhost:${PORT}`);
  });
} catch (error) {
  console.log("\nError starting server:", error);
}

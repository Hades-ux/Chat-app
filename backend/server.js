import app from "./app.js";
import connectDB from "./Src/DB/dataBase.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT || 4444;

// Connect database
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// Creat a Http server with express
const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// socket.io connection
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  // join room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // send message to specific user
  socket.on("sendMessage", ({ sender, receiver, message }) => {
    if (!sender || !receiver || !message) return;

    // Create consistent room ID for 1v1 chat
    const roomId = [sender, receiver].sort().join("_");

    // Emit to everyone in the room (sender + receiver)
    io.to(roomId).emit("receiveMessage", {
      sender,
      receiver,
      message,
      timeStamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

try {
  server.listen(PORT, () => {
    console.log(`\nServer is running at: http://localhost:${PORT}`);
  });
} catch (error) {
  console.log("\nError during Connetion of server", error);
}

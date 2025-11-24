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

const server = http.createServer(app);

// initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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

  // receive and emit messages
  socket.on("sendMessage", (data) => {
    const { sender, receiver, message } = data;

    if (!sender || !receiver || !message) return;
    const roomId = [sender, receiver].sort().join("_");

    console.log(` EMIT TO ROOM: ${roomId}`);

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

    socket.to(roomId).emit("Typing",{
      sender,
      isTyping
    })

  })


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

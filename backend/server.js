import app from "./app.js";
import connectDB from "./Src/DB/dataBase.js";
import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4444;

// Connect database
connectDB();

// Creat a Http server with express
const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// socket.io connection
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);


socket.on("join", (userId) => {
  socket.join(userId);
  console.log(`user ${userId} joinded the room`);
});


// send message to specific user
socket.on("sendMessage", ({senderId,  reciverId, message}) => {
    io.to(reciverId).emit("receiverMessage", {
        message, senderId, timeStamp: new Date(),
    })
})

socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});

try {
  server.listen(PORT, () => {
    console.log(`\nServer is running at: http://localhost:${PORT}`);
  });
} catch (error) {
  console.log("\nError during Connetiomn of server", error);
}

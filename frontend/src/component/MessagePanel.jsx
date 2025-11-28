import { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import axios from "axios";

const MessagePanel = () => {
  const { selectedUser, messages, setMessages, sentMsg, setSentMsg, socket } = useChat();
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const chatWindowRef = useRef(null);
  const sender = localStorage.getItem("userId");
  const API = import.meta.env.VITE_API_URL;

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleTyping = () => {
    if (!selectedUser) return;

    socket.emit("Typing", { sender, receiver: selectedUser._id, isTyping: true });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socket.emit("Typing", { sender, receiver: selectedUser._id, isTyping: false });
    }, 500);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async () => {
    if (!sentMsg.trim()) return;

    const messageData = { sender, receiver: selectedUser._id, message: sentMsg };
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setSentMsg("");

    await axios.post(`${API}/message/create/${selectedUser._id}`, messageData, {
      withCredentials: true,
    });
  };

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      if (selectedUser && selectedUser._id === data.sender) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on("Typing", (data) => {
      if (selectedUser && data.sender === selectedUser._id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("Typing");
    };
  }, [selectedUser]);

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg">
      {!selectedUser ? (
        <p className="flex items-center justify-center h-full text-gray-500 text-lg">
          Select a user to start chatting
        </p>
      ) : (
        <>
          <div className="p-4 border-b bg-gray-100 flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{selectedUser.fullName}</h2>
            {isTyping && <span className="text-sm text-gray-500">typing...</span>}
          </div>

          <div
            ref={chatWindowRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === sender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm max-w-xs text-sm ${
                    msg.sender === sender
                      ? "bg-gray-400 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 flex items-center gap-3 border-t bg-gray-100">
            <input
              type="text"
              placeholder="Type your message..."
              value={sentMsg}
              onChange={(e) => {
                setSentMsg(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 border rounded-full px-4 py-2"
            />
            <button
              onClick={handleSendMessage}
              className="bg-gray-700 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MessagePanel;

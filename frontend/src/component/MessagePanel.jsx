import { useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import axios from "axios";
import { useState } from "react";

const MessagePanel = () => {
  const {
    selectedUser,
    messages,
    setMessages,
    sentMsg,
    setSentMsg,
    user,
    socket,
  } = useChat();

  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const chatWindowRef = useRef(null);
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);
  const API = import.meta.env.VITE_API_URL;

  const handleUserOnline = (userId) => {
    if (userId === selectedUser._id) {
      setOnline(true);
    }
  };

  const handleUserOffline = (userId) => {
    if (userId === selectedUser._id) {
      setOnline(false);
    }
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !selectedUser) return;
    socket.emit("getOnlineUser", selectedUser._id);

    return ()=>{
      socket.off("getOnlineUser")
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("userTyping", () => {
      setTyping(true);
    });

    socket.on("userStoppedTyping", () => {
      setTyping(false);
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [socket]);

  // set online indictor
  useEffect(() => {
    if (!socket || !selectedUser) return;

    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket, selectedUser]);

  // reciver msg through socket
  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMessage", (msg) => {
      setMessages((perv) => [...perv, msg]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  // typing indicator
  const handleTyping = () => {
    if (!user || !selectedUser || !socket) return;

    const chatId = [user, selectedUser._id].sort().join("_");

    if (!isTyping.current) {
      socket.emit("typing", chatId);
      isTyping.current = true;
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit("noTyping", chatId);
      isTyping.current = false;
    }, 1000);
  };

  useEffect(() => {
    if (!user || !selectedUser || !socket) return;
    const chatId = [user, selectedUser._id].sort().join("_");

    socket.emit("joinRoom", chatId);

    return () => {
      socket.emit("leaveRoom", chatId);
    };
  }, [user, socket, selectedUser]);

  const handleSendMessage = async () => {
    if (!sentMsg.trim() || !selectedUser) return;
    const chatId = [user, selectedUser._id].sort().join("_");

    socket.emit("noTyping", chatId);
    isTyping.current = false;

    const messageData = {
      sender: user,
      receiver: selectedUser._id,
      message: sentMsg,
      chatId,
    };

    socket.emit("sendMessage", {
      sender: user,
      receiver: selectedUser._id,
      message: sentMsg,
      chatId,
    });

    try {
      await axios.post(
        `${API}/message/create/${selectedUser._id}`,
        messageData,
        { withCredentials: true }
      );
      setSentMsg("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden">
      {!selectedUser ? (
        <p className="flex items-center justify-center h-full text-gray-500 text-lg">
          Select a user to start chatting
        </p>
      ) : (
        <>
          {/* HEADER */}
          <div className="p-4 border-b bg-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              {selectedUser.avatar.url ? (
                <img
                  src={selectedUser.avatar.url || ""}
                  alt={selectedUser.fullName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-gray-500 font-semibold text-xl">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </span>
              )}{" "}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedUser.fullName}
            </h2>{" "}
            {typing && (
              <span className="text-sm text-gray-500 ml-2">typing...</span>
            )}
            {(
              <span
                className={`h-2 w-2 rounded-full ${
                  online ? "bg-green-600" : "bg-gray-400"
                }`}
              ></span>
            )}
          </div>

          {/* MESSAGES */}
          <div
            ref={chatWindowRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3"
          >
            {messages.map((msg, i) => {
              const isMe = msg.sender === user;

              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm max-w-xs text-sm ${
                      isMe
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INPUT */}
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
              className="flex-1 border border-gray-300 rounded-full px-4 py-2"
            />

            <button
              onClick={handleSendMessage}
              className="bg-gray-700 text-white px-5 py-2 rounded-full hover:bg-gray-800"
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

import { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";

const MessagePanel = () => {
  const { selectedUser, messages, setMessages, sentMsg, setSentMsg, socket } = useChat();
  const [isTyping, setIsTyping] = useState(false);
  const [myTypingTimeout, setMyTypingTimeout] = useState(null);
  const chatWindowRef = useRef(null);
  const sender = localStorage.getItem("userId");
  const API = import.meta.env.VITE_API_URL;

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TYPING
  const handleTyping = () => {
    if (!selectedUser) return;

    socket.emit("Typing", {
      sender,
      receiver: selectedUser._id,
      isTyping: true,
    });

    if (myTypingTimeout) clearTimeout(myTypingTimeout);

    const timeout = setTimeout(() => {
      socket.emit("Typing", {
        sender,
        receiver: selectedUser._id,
        isTyping: false,
      });
    }, 500);

    setMyTypingTimeout(timeout);
  };

  async function handlSendMessage() {
    if (!sentMsg.trim()) return;

    const messageData = {
      sender: sender,
      receiver: selectedUser._id,
      message: sentMsg,
    };

    socket.emit("sendMessage", messageData);

    setMessages((prev) => [...prev, messageData]);

    await axios.post(`${API}/message/create/${selectedUser._id}`, messageData, {
      withCredentials: true,
    });

    setSentMsg("");
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("CLIENT CONNECTED:", socket.id);
    });

    const sender = localStorage.getItem("userId");

    socket.connect({
      query: { sender },
    });

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
      socket.off("connect");
      socket.off("receiveMessage");
      socket.off("Typing");
    };
  }, [selectedUser]);

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm">
      {selectedUser ? (
        <>
          <div className="p-4 border-b bg-orange-100">
            <h1 className="text-2xl font-bold">
              {selectedUser.fullName.toUpperCase()}
            </h1>
            {isTyping && (
              <div className="text-gray-500 text-sm px-3 py-1">typing...</div>
            )}
          </div>

          <div
            ref={chatWindowRef}
            className="flex-1 p-4 bg-orange-50 overflow-y-auto"
          >
            {messages.length > 0 ? (
              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === sender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl shadow-md text-sm ${
                        msg.sender === sender
                          ? "bg-amber-400 text-gray-900"
                          : "bg-white text-gray-800 border"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-10">No messages yet</p>
            )}
          </div>

          <div className="p-4 bg-orange-100 flex items-center gap-3">
            <input
              type="text"
              placeholder="type message..."
              value={sentMsg}
              onChange={(e) => {
                setSentMsg(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlSendMessage();
              }}
              className="flex-1 border rounded-3xl px-4 py-2"
            />

            <button
              className="bg-amber-400 px-5 py-2 rounded-3xl"
              onClick={handlSendMessage}
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500 flex items-center justify-center h-[90vh]">
          Select a user to chat
        </p>
      )}
    </div>
  );
};

export default MessagePanel;

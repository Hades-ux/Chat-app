import { useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import axios from "axios";

const MessagePanel = () => {
  const { selectedUser, messages, setMessages, sentMsg, setSentMsg, user } =
    useChat();

  const chatWindowRef = useRef(null);
  const API = import.meta.env.VITE_API_URL;

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop =
        chatWindowRef.current.scrollHeight;
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!sentMsg.trim() || !selectedUser) return;

    const messageData = {
      sender: user,
      receiver: selectedUser._id,
      message: sentMsg,
    };

    try {
      const res = await axios.post(
        `${API}/message/create/${selectedUser._id}`,
        messageData,
        { withCredentials: true }
      );

      // add ONLY the new message
      setMessages((prev) => [...prev, res.data.data]);
      setSentMsg("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
      {!selectedUser ? (
        <p className="flex items-center justify-center h-full text-gray-500 text-lg">
          Select a user to start chatting
        </p>
      ) : (
        <>
          {/* HEADER */}
          <div className="p-4 border-b bg-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              {selectedUser.fullName.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedUser.fullName}
            </h2>
          </div>

          {/* MESSAGES */}
          <div
            ref={chatWindowRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3"
          >
            {messages.map((msg, i) => {
              const isMe =
                msg.sender === user;

              return (
                <div
                  key={i}
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
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
              onChange={(e) => setSentMsg(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSendMessage()
              }
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

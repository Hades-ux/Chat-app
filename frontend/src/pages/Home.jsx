import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import { toast } from "react-toastify";
import { Tooltip } from "../component/ToolTip";

const Home = () => {
  const [connections, setconnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sentMsg, setSentMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [myTypingTimeout, setMyTypingTimeout] = useState(null);

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const chatWindowRef = useRef(null);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sender = localStorage.getItem("userId");

  // FETCH USER CONNECTIONS
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API}/connection/fetch`, {
          withCredentials: true,
        });
        setconnections(data.data);
      } catch (error) {
        console.error("Failed to load connections:", error);
        toast.error("Failed to load connections");
      }
    };

    fetchUser();
  }, []);

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

  // SELECT USER
  async function handleClick(receiver) {
    setSelectedUser(receiver);
    setMessages([]);

    const roomId = [sender, receiver._id].sort().join("_");
    socket.emit("joinRoom", roomId);

    const res = await axios.get(`${API}/message/fetch`, {
      params: { receiver: receiver._id },
      withCredentials: true,
    });

    setMessages(res?.data?.data || []);
  }

  // SEND MESSAGE
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

  // LOGOUT
  async function handleLogOut() {
    const confirm = window.confirm("Do you want to log out?");
    if (!confirm) return;

    try {
      const res = await axios.post(
        `${API}/auth/logOut`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  }

  return (
    <div className="h-screen bg-orange-50 flex font-serif overflow-hidden">
      <nav className="w-15 border-r border-gray-200 flex flex-col items-center justify-between gap-5 py-4">
        <Tooltip text="Add Connection" position="bottom">
          <span className="material-symbols-outlined text-3xl">person_add</span>
        </Tooltip>

        <div className=" flex flex-col items-center gap-5 border-t py-2 w-full">
          <Tooltip text="Settings">
            <span className="material-symbols-outlined cursor-pointer">
              settings
            </span>
          </Tooltip>

          <Tooltip text="Profile"position="top">
            <span className="material-symbols-outlined">account_circle</span>
          </Tooltip>
        </div>
      </nav>

      <div className="w-4/12 border-r border-gray-200 py-4 px-2">
        <div className="flex items-center mb-4 justify-between px-4">
          <h1 className="text-3xl">Chat-app</h1>
          <span
            className="material-symbols-outlined cursor-pointer"
            onClick={handleLogOut}
          >
            more_vert
          </span>
        </div>

        {connections.length > 0 ? (
          connections.map((connection) => (
            <div key={connection._id} onClick={() => handleClick(connection)}>
              <div className="bg-white border rounded-lg p-4 cursor-pointer">
                {connection.firstName.toUpperCase()}
                <div className="text-sm text-gray-600">
                  {connection.message}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No connections found.
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm">
        {selectedUser ? (
          <>
            <div className="p-4 border-b bg-orange-100">
              <h1 className="text-2xl font-bold">
                {selectedUser.firstName.toUpperCase()}
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
                <p className="text-gray-500 text-center mt-10">
                  No messages yet
                </p>
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
    </div>
  );
};

export default Home;

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import { toast } from "react-toastify";

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

  // SCROLL FUNCTION
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //  GET CURRENT USER ID
  const sender = localStorage.getItem("userId");

  //  FETCH USER CONNECTIONS
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
    // socket connected
    socket.on("connect", () => {
      console.log("CLIENT CONNECTED:", socket.id);
    });

    // listen for messages
    socket.on("receiveMessage", (data) => {
      // only add if message belongs to the current open chat
      if (selectedUser && selectedUser._id === data.sender) {
        setMessages((prev) => [...prev, data]);
      }
    });

    // listen for typing indicator
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

  //  SELECT A CHAT USER
  async function handleClick(receiver) {
    setSelectedUser(receiver);
    setMessages([]); // reset

    const roomId = [sender, receiver._id].sort().join("_");
    socket.emit("joinRoom", roomId);

    // Fetch old messages
    const res = await axios.get(`${API}/message/fetch`, {
      params: { receiver: receiver._id },
      withCredentials: true,
    });

    setMessages(res?.data?.data || []);
  }

  //  SEND MESSAGE
  async function handlSendMessage() {
    if (!sentMsg.trim()) return;

    const messageData = {
      sender: sender,
      receiver: selectedUser._id,
      message: sentMsg,
    };

    if (!messageData.sender || !messageData.receiver || !messageData.message) {
      console.error("ERROR: Some field is missing", messageData);
      toast.error("ERROR: Some field is missing", messageData);
      return;
    }

    // Send to socket
    socket.emit("sendMessage", {
      sender: sender,
      receiver: selectedUser._id,
      message: sentMsg,
    });
    // Add to UI instantly
    setMessages((prev) => [...prev, messageData]);

    // Save in DB
    await axios.post(`${API}/message/create/${selectedUser._id}`, messageData, {
      withCredentials: true,
    });

    setSentMsg("");
  }

  // TYPING
  const handleTyping = () => {
    if (!selectedUser) return;

    socket.emit("Typing", {
      sender: sender,
      receiver: selectedUser._id,
      isTyping: true,
    });

    // clear previous timeout
    if (myTypingTimeout) clearTimeout(myTypingTimeout);

    // user stops typing after 500ms
    const timeout = setTimeout(() => {
      socket.emit("Typing", {
        sender: sender,
        receiver: selectedUser._id,
        isTyping: false,
      });
    }, 500);

    setMyTypingTimeout(timeout);
  };

  //  LOGOUT
  async function handleLogOut() {
    const confirm = window.confirm("Do you want to log out from the chat app?");
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
      console.error("Logout failed:", error);
      toast.error("Logout failed:");
    }
  }

  return (
    <div className="h-screen bg-orange-50 flex font-serif overflow-hidden">
      {/* side navBar */}
      <nav className="w-15 border-r border-gray-200 flex justify-center">
        profile
      </nav>

      {/* connections container */}
      <div className="w-4/12 border-r border-gray-200 py-4 px-2">
        <div className="flex items-center mb-4 justify-between px-4">
          <h1 className="text-3xl">Chat-app</h1>
          <span
            className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-black transition"
            onClick={handleLogOut}
          >
            more_vert
          </span>
        </div>

        {connections.length > 0 ? (
          connections.map((connection) => (
            <div key={connection._id} onClick={() => handleClick(connection)}>
              <div className="bg-white border border-gray-300 rounded-lg p-4 hover:scale-102 transition transform cursor-pointer">
                {connection.firstName.toUpperCase()}
                <div className="text-sm text-gray-600">{connection.email}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-10 flex justify-center items-center h-[80vh]">
            No connections found. Start chatting by adding some friends!
          </div>
        )}
      </div>

      {/* message container */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-orange-100 border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedUser.firstName.toUpperCase()}
              </h1>
              {isTyping && (
                <div className="text-gray-500 text-sm px-3 py-1">typing...</div>
              )}
            </div>

            {/* Chat Area */}
            <div
              ref={chatWindowRef}
              className="flex-1 p-4  bg-orange-50 overflow-y-auto"
              id="chatWindow"
            >
              {messages.length > 0 ? (
                <div className="flex flex-col gap-3 ">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === sender ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl shadow-md text-sm  
                          ${
                            msg.sender === sender
                              ? "bg-amber-400 text-gray-900 rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-300 rounded-bl-none"
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

            {/* Message Input */}
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
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlSendMessage();
                  }
                }}
                className="flex-1 border border-gray-300 bg-amber-50 rounded-3xl px-4 py-2 text-gray-700 focus:outline-none"
              />

              <button
                className="bg-amber-400 text-gray-900 font-medium px-5 py-2 rounded-3xl hover:bg-amber-500 transition-all"
                onClick={handlSendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 flex items-center justify-center h-[90vh] text-lg">
            Select a user to view messages and chat
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;

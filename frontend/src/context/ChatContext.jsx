import { createContext, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const API = import.meta.env.VITE_API_URL;
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sentMsg, setSentMsg] = useState("");

  // fetch connections with last message
  const fetchConnections = async () => {
    try {
      const { data } = await axios.get(`${API}/message/lastMessage`, {
        withCredentials: true,
      });

      if (!data?.data) return;

      // normalize connections
      const normalizedConnections = data.data.map((conn) => ({
        _id: conn.user?._id || conn._id, // fallback
        fullName: conn.user?.fullName || conn.fullName || "Unknown",
        email: conn.user?.email || conn.email || "",
        lastMessage: conn?.lastMessage,
        lastMessageTime: conn?.lastMessageTime,
      }));
      setConnections(normalizedConnections);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load connections");
    }
  };

  const addConnection = async (email) => {
    try {
      const res = await axios.post(
        `${API}/connection/add`,
        { email },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      fetchConnections();
      socket.emit("new-connection"); // notify other clients
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = async () => {
    const confirmLogout = window.confirm("Do you want to Log Out?");
    if (!confirmLogout) return;

    try {
      const res = await axios.post(`${API}/auth/logOut`, {}, { withCredentials: true });
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const selectUser = async (user) => {
    if (!user) return;

    setSelectedUser(user);
    setMessages([]);
    const roomId = [userId, user._id].sort().join("_");
    socket.emit("joinRoom", roomId);

    try {
      const res = await axios.get(`${API}/message/fetch`, {
        params: { receiver: user._id },
        withCredentials: true,
      });
      setMessages(res.data?.data || []);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };


  return (
    <ChatContext.Provider
      value={{
        connections,
        fetchConnections,
        addConnection,
        logout,
        selectedUser,
        setSelectedUser,
        messages,
        setMessages,
        sentMsg,
        setSentMsg,
        selectUser,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

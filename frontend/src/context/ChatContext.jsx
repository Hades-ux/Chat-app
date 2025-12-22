import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";

const API = import.meta.env.VITE_API_URL;
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [sentMsg, setSentMsg] = useState("");

  // refresh fetch
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/user/owner/profile`, {
          withCredentials: true,
        });
        const refresh = res.data.data;
        setUser(refresh);
      } catch (error) {
        setUser(null);
      }
    };

    fetch();
  }, []);

  // fetch connections
  const fetchConnections = async () => {
    try {
      const { data } = await axios.get(`${API}/message/lastMessage`, {
        withCredentials: true,
      });

      if (!data?.data) return;

      const normalizedConnections = data.data.map((conn) => ({
        _id: conn.user?._id || conn._id,
        fullName: conn.user?.fullName || conn.fullName || "Unknown",
        email: conn.user?.email || conn.email || "",
        avatar: conn.user?.avatar || conn.avatar || null,
        online: false,
        lastMessage: conn?.lastMessage,
        lastMessageTime: conn?.lastMessageTime,
      }));

      setConnections(normalizedConnections);
    } catch (error) {
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
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = async () => {
    if (!window.confirm("Do you want to Log Out?")) return;

    try {
      const res = await axios.post(
        `${API}/auth/logOut`,
        {},
        { withCredentials: true }
      );
      if (socket?.connected) {
        socket.disconnect();
      }
      localStorage.removeItem("token");
      setUser(null);
      toast.success(res.data.message);
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const selectUser = async (user) => {
    if (!user) return;

    setSelectedUser(user);
    setMessages([]);

    try {
      const res = await axios.get(`${API}/message/fetch`, {
        params: { receiver: user._id },
        withCredentials: true,
      });

      setMessages(res.data?.data || []);
    } catch {
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    if (!socket || !user) return;
    if (!socket.connected) {
      socket.connect();
    }

    if (socket.connected) {
      socket.emit("setup", user);
    }

    const onConnect = () => {
      socket.emit("setup", user);
    };

    socket.on("connect", onConnect);

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error");
    };
  }, [user, socket]);

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
        user,
        setUser,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

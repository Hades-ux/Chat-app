import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const API = import.meta.env.VITE_API_URL;
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sentMsg, setSentMsg] = useState("");
  const [sender, setSender] = useState(null);

  // fetch Connection
  const fetchConnections = async () => {
    try {
      const { data } = await axios.get(`${API}/connection/fetch`, {
        withCredentials: true,
      });
      setConnections(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load connections");
    }
  };

  // addConnection
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

  // logout
  const logout = async () => {
    const confirmLogout = window.confirm("Do You want to Log Out?");
    if (!confirmLogout) return;
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
  };

  // selectUser
  const selectUser = async (user) => {
    if (!user) return; // safety check

    setSelectedUser(user);
    setMessages([]); // reset old messages

    const sender = localStorage.getItem("userId");
    const roomId = [sender, user._id].sort().join("_");
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

  // Socket listener
  useEffect(() => {
    socket.on("new-connection", fetchConnections);
    return () => socket.off("new-connection", fetchConnections);
  }, []);

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

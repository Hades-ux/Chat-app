import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";

const API = import.meta.env.VITE_API_URL;
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState("")
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sentMsg, setSentMsg] = useState("");

  //fetch user data
      useEffect(() => {
        const fetchUser = async () => {
            try {
              const data = await axios.get(`${API}/user/owner/profile`, {withCredentials: true})
              if(!data) return toast.error("user Not Found")
               const  sender = data.data.user
                setUser(sender)
              console.log("Sender: ",sender)
            } catch (error) {
              toast.error("Failed to fetchh user data");
            }
        }

        fetchUser()

      },[])
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
      toast.success(res.data.message);
    } catch {
      toast.error("Logout failed");
    } finally {
      navigate("/");
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
    socket.connect()
    socket.on("connect", () => {
    });

    socket.on("disconnect", () => {
      console.log("socket disonnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect")
      socket.disconnect()
    }

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
        user
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

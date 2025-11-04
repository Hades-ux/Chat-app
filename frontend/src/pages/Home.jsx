import axios from "axios";
import { useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";

const Home = () => {
  const [connections, setconnection] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await axios.get(`${API}/Connections`);
      setconnection(data);
    };

    fetchUser();
  }, []);

  async function handleLogOut() {
    const confirm = window.confirm("Do you want to log out from the chat app?");
    if (!confirm) return;
    try {
      const res = await axios.post(`${API}/auth/logOut`);
      console.log(res.data.message);
    } catch (error) {
      console.error("Logout failed:", error);
    }finally{
        navigate("/")
    }
  }
  return (
    <div className="min-h-screen bg-blue-200 flex font-serif">

      {/* side navBar */}
      <nav className="w-15 border-r">profile</nav>

      {/* connections container */}
      <div className="w-4/12 border-r py-4 px-2">
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
            <div
              key={connection.id}
              onClick={() => setSelectedUser(connection)}
            >
              <div className="bg-white border border-gray-300 rounded-lg p-4 hover:scale-105 transition transform cursor-pointer">
                {connection.firstName}
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
      <div className="flex-1 p-6">
        {selectedUser ? (
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Chat with {selectedUser.firstName}
            </h2>
            <p className="text-gray-600 mb-4">{selectedUser.email}</p>
            {/* You can add chat input, messages, etc. here */}
            <div className="border-t pt-4">Chat messages...</div>
          </div>
        ) : (
          <p className="text-gray-500 flex items-center justify-center h-[90vh]">
            Select a user to view messages and chat
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;

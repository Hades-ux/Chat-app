import axios from "axios";
import { useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";

const Home = () => {
  const [connections, setconnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [id, setId] = useState("")

  const [sentMsg, setSentMsg] = useState("")

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API}/connection/fetch`,{
        withCredentials: true,
      });
       setconnections(data.data);
     } catch (error) {
      console.error("Failed to load connections:", err);
     }
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

  function handleClick(user) {
    setSelectedUser(user)
    setId(user._id)
    console.log("Selected User ID:", user._id);

    axios.get(`${API}/message/fetch`, {
    params: { receiver: user._id },
    withCredentials: true,
  })

  }

  function handlSendMessage() {

  }

  return (
    <div className="min-h-screen bg-orange-50 flex font-serif">

      {/* side navBar */}
      <nav className="w-15 border-r border-gray-400 flex justify-center">profile</nav>

      {/* connections container */}
      <div className="w-4/12 border-r border-gray-400 py-4 px-2">
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
              key={connection._id}
              onClick={() => handleClick(connection)}
            >
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
      <div className="flex-1">
        {selectedUser ? (
          <div className="">
               <h1 className="ml-2 text-2xl font-bold mb-2">{selectedUser.firstName.toUpperCase()}</h1> 

            <div className="border-t pt-4 text-center">Chat messages...</div>

            {/* message input */}
            <div className=" flex gap-2 items-center justify-center">
            <input 
            type="text"
            placeholder="Enter Message"
            value={sentMsg}
            onChange={(e) => setSentMsg(e.target.value)}
            className="border border-gray-300 rounded-3xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 w-11/12" />
            <button 
            className="bg-amber-400 p-2 rounded-4xl cursor-pointer hover:bg-amber-500 duration-300"
            onClick={handlSendMessage}> send</button>
            </div>
            
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
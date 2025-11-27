import { useEffect } from "react";
import { useChat } from "../context/ChatContext";

const ConnectionList = () => {
  const { connections=[], fetchConnections, logout, selectUser  } = useChat();

  // Fetch updated list
  useEffect(() => {
    fetchConnections();
  }, []);

 // SELECT USER
  async function handleClick(receiver) {
    await selectUser()
  }

  // LOGOUT
  async function handleLogOut() {
   await logout()
  }

  return (
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
          <div
            className="mb-2"
            key={connection._id}
            onClick={() => handleClick(connection)}
          >
            <div className="bg-white border border-gray-300 shadow-sm hover:scale-103 rounded-lg p-4 cursor-pointer duration-300">
              {connection.fullName.toUpperCase()}
              <div className="text-sm text-gray-600">{connection.email}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 mt-10">
          No connections found.
        </div>
      )}
    </div>
  );
};

export default ConnectionList;

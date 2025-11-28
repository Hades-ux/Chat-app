import { useEffect } from "react";
import { useChat } from "../context/ChatContext";

const ConnectionList = () => {
  const { connections = [], fetchConnections, logout, selectUser } = useChat();

  useEffect(() => {
    fetchConnections();
  }, []);

  async function handleClick(receiver) {
    await selectUser(receiver);
  }

  async function handleLogOut() {
    await logout();
  }

  return (
    <div className="w-4/12 border-r border-gray-200 py-4 px-4 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ChatApp</h1>
        <span
          className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-gray-900"
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
            className="bg-white shadow-sm rounded-xl p-4 mb-3 cursor-pointer hover:shadow-md transition"
          >
            <h2 className="font-semibold text-gray-800">{connection.fullName}</h2>
            <p className="text-sm text-gray-500 truncate">{connection.email}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-10">No connections found.</p>
      )}
    </div>
  );
};

export default ConnectionList;

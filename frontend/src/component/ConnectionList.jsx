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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ChatApp</h1>
        <span
          className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-gray-900 text-2xl"
          onClick={handleLogOut}
        >
          logout
        </span>
      </div>

      {connections.length > 0 ? (
        connections.map((connection) => (
          <div
            key={connection._id}
            onClick={() => handleClick(connection)}
            className="bg-white rounded-xl p-4 mb-3 cursor-pointer hover:shadow-md transition shadow-sm flex items-center gap-3"
          >
            {/* Avatar + online indicator */}
            <div className="relative w-12 h-12">
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xl">
                {connection.avatar.url ? (
                  <img
                    src={connection.avatar.url||""}
                    alt={connection.fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-500 font-semibold text-xl">
                    {connection.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {connection.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            {/* Name + Last message */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
                  {connection.fullName}
                </h2>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {connection.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-10">No connections found.</p>
      )}
    </div>
  );
};

export default ConnectionList;

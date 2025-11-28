import { useState } from "react";
import { toast } from "react-toastify";
import { useChat } from "../context/ChatContext";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { addConnection } = useChat();

  async function handleAddConnection(e) {
    e.preventDefault();
    if (!email) {
      toast.error("Email cannot be empty");
      return;
    }
    await addConnection(email);
    setEmail("");
    setIsOpen(false);
  }

  return (
    <>
      <nav className="w-16 border-r border-gray-200 flex flex-col items-center justify-between gap-6 py-4 bg-gray-50 shadow-sm">
        <span
          className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 transition"
          onClick={() => setIsOpen(true)}
        >
          person_add
        </span>

        <div className="flex flex-col items-center gap-6 border-t pt-4">
          <span className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900">
            settings
          </span>
          <span className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900">
            account_circle
          </span>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-96 p-6 rounded-2xl shadow-lg border border-gray-200 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">Add Connection</h1>
              <span
                className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                close
              </span>
            </div>

            <form onSubmit={handleAddConnection} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-box"
              />
              <button className="bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg transition">
                Add Connection
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;

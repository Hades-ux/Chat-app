import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useChat } from "../context/ChatContext";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { addConnection } = useChat();

  async function handleAddConnection(e) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }
    try {
      await addConnection(email);
      setEmail("");
      setIsOpen(false);
      toast.success("Connection added successfully");
    } catch (err) {
      toast.error(err.message || "Failed to add connection");
    }
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* SIDEBAR */}
      <nav className="w-20 border-r border-gray-200 flex flex-col items-center justify-between py-6 bg-gray-50 shadow-sm">
        <button
          aria-label="Add Connection"
          className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 transition text-3xl"
          onClick={() => setIsOpen(true)}
        >
          person_add
        </button>

        <div className="flex flex-col items-center gap-6 border-t pt-6 w-full">
          <button
            aria-label="Settings"
            className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 text-3xl"
          >
            settings
          </button>
          <button
            aria-label="Account"
            className="material-symbols-outlined cursor-pointer text-gray-700 hover:text-gray-900 text-3xl"
          >
            account_circle
          </button>
        </div>
      </nav>

      {/* ADD CONNECTION MODAL */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-96 p-8 rounded-2xl shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-xl font-semibold text-gray-800">
                Add Connection
              </h1>
              <button
                aria-label="Close"
                className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                close
              </button>
            </div>

            <form onSubmit={handleAddConnection} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:ring-gray-500 focus:border-gray-500 rounded-xl px-4 py-2 outline-none"
              />
              <button
                type="submit"
                disabled={!email.trim()}
                className="bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
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

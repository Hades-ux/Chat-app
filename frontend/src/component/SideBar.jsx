import { useState } from "react";
import { toast } from "react-toastify";
import { useChat } from "../context/ChatContext";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { addConnection} = useChat()

  // add Connection
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
      <nav className="w-15 border-r border-gray-200 flex flex-col items-center justify-between gap-5 py-4">
        <span
          className="material-symbols-outlined cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          person_add
        </span>

        <div className="flex flex-col items-center gap-5 border-t py-2 w-full">
          <span className="material-symbols-outlined cursor-pointer">
            settings
          </span>

          <span className="material-symbols-outlined cursor-pointer">
            account_circle
          </span>
        </div>
      </nav>

      {/* BACKGROUND BLUR + OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
          onClick={() => setIsOpen(false)} // close when clicking outside
        >
          {/* POPUP */}
          <div
            className="bg-gray-100 w-96 h-56 border border-gray-300 rounded-xl p-4 z-50"
            onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
          >
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">
                Enter email to add connection
              </h1>

              <span
                className="material-symbols-outlined border border-gray-300 bg-gray-200 hover:bg-gray-400 cursor-pointer rounded-sm"
                onClick={() => setIsOpen(false)}
              >
                close
              </span>
            </div>

            <form
              onSubmit={handleAddConnection}
              className="p-4 flex flex-col gap-2"
            >
              <input
                type="email"
                placeholder="example@example.com"
                className="input-box"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                className="bg-gray-500 p-3 rounded-xl cursor-pointer text-white"
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

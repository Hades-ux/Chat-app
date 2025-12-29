import { toast } from "react-toastify";
import { useChat } from "../context/ChatContext";
import { useState } from "react";

const AddConection = () => {
  const [email, setEmail] = useState("");
  const { addConnection, setPopup, fetchConnections } = useChat();

  async function handleAddConnection(e) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }
    try {
      await addConnection(email);
      setEmail("");
      setPopup(null);
      fetchConnections();
    //   toast.success("Connection added successfully");
    } catch (err) {
      toast.error(err.message || "Failed to add connection");
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Add Connection</h1>
        <button
          aria-label="Close"
          className="material-symbols-outlined cursor-pointer text-gray-600 hover:text-gray-900"
          onClick={() => setPopup(null)}
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
          className="input-box"
        />
        <button
          type="submit"
          disabled={!email.trim()}
          className="bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Connection
        </button>
      </form>
    </>
  );
};

export default AddConection;

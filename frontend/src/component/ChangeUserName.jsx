import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useChat } from "../context/ChatContext";

const ChangeUserName = () => {
  const API = import.meta.env.VITE_API_URL;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setPopup, owner, setOwner } = useChat();

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    if (name.trim() === owner?.fullName) {
      toast.info("Username is unchanged");
      return;
    }

    try {
      setLoading(true);
      await axios.patch(
        `${API}/user/update/userName`,
        { newUserName: name.trim() },
        {
          withCredentials: true,
        }
      );
      toast.success(`${name} updated successfully`);
      setName("");
      setPopup(null);
      window.location.reload();
    } catch (error) {
      toast.error("Not Able to update Name");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-center text-2xl font-semibold text-gray-700 mb-2">
        Change Username
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        This name will be visible to other users
      </p>

      <form className="flex flex-col gap-5" onSubmit={handleOnSubmit}>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="changeName"
            className="text-sm font-medium text-gray-600"
          >
            New Username
          </label>
          <input
            aria-label="Change username"
            id="changeName"
            type="text"
            placeholder="Enter your new name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-box transition"
            disabled={loading}
            maxLength={20}
            minLength={3}
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="py-2 rounded-lg text-white font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
};

export default ChangeUserName;

import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useChat } from "../context/ChatContext";

const ChangeUserEmail = () => {
  const [email, setEmail] = useState("");
  const API = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const { setPopup, owner, setOwner } = useChat();

  const isValid  = email.includes("@")

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    if (email === owner?.email) {
      toast.info("Email is unchange");
      return
    }
    try {
      setLoading(true)
      const res = await axios.patch(
        `${API}/user/update/userEmail`,
        { newUserEmail: email.trim() },
        { withCredentials: true }
      );
      toast.success(`${email} updated successfully`)
      setEmail("")
      setPopup(null);
      window.location.reload();
    } catch (error) {
      toast.error("Not able to Update Email");
    } finally{
      setLoading(false)
    }
  };
  return (
    <>
      <h1 className="text-center text-2xl font-semibold text-gray-700 mb-2">
        Change Email
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        This Email will be visible to other users and also use for login
      </p>

      <form className="flex flex-col gap-5" onSubmit={handleOnSubmit}>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="changeEmail"
            className="text-sm font-medium text-gray-600"
          >
            New Email
          </label>
          <input
            id="changeEmail"
            type="email"
            placeholder="Enter your new Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-box transition"
            disabled={loading}
          />
          {email && (isValid ?"":<p className="text-sm text-red-500">Email must include @</p>)}
        </div>

        <button
          type="submit"
          disabled={!email.trim() || loading || !isValid}
          className="py-2 rounded-lg text-white font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
};

export default ChangeUserEmail;

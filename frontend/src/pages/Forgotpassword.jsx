import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";

const Forgotpassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      await axios.post(`${API}/auth/forgot-password`, {
        email,
      });

      toast.success(`Rest password link send to ${email}`);
    } catch (error) {
      toast.error("Failed to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box-border min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="border h-96 w-full max-w-xl rounded-3xl border-gray-200 bg-white shadow-2xl flex flex-col gap-4 items-center">
        <h2 className="text-2xl font-semibold text-center mt-4 mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your registered email, and we’ll send you a link to reset your
          password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 items-center w-full px-4"
        >
          <div className="flex flex-col w-full">
            <label
              htmlFor="email"
              className="font-medium text-gray-700 mb-1 tracking-wide"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2 text-white transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <NavLink
          to="/"
          className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
        >
          ← Back to Login
        </NavLink>
      </div>
    </div>
  );
};

export default Forgotpassword;

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";

const LogIn = () => {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleOnSumbit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API}/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      toast.success("Login Successfull");
      navigate("/home")
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="box-border justify-center items-center h-screen w-screen flex bg-blue-200 font-serif">
      {/* form */}
      <form
        onSubmit={handleOnSumbit}
        className="h-96 w-96 border border-gray-300 rounded-3xl bg-white shadow-2xl flex flex-col gap-4 items-center p-4"
      >
        <h1 className="text-3xl ">Login</h1>

        {/* Email Input */}
        <div className=" flex flex-col gap-1 w-3/4 ">
          <label htmlFor="Email" className="text-xl">
            Email
          </label>
          <input
            id="Email"
            name="Email"
            type="email"
            className="border-2 outline-none border-gray-300 p-2 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className=" flex flex-col gap-1 w-3/4 ">
          <label htmlFor="Password" className="text-xl">
            Password
          </label>
          <div className="border-2  border-gray-300 p-2 rounded-lg">
            <input
              id="Password"
              name="Password"
              className="outline-none"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((showPassword) => !showPassword)}
              className="text-sm text-gray-500 ml-7"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          className="border p-2 rounded w-3/4 border-gray-300 cursor-pointer hover:bg-gray-100"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="w-3/4 flex flex-col gap-1 items-start">
          <NavLink
            to="/ForgotPassword"
            className={({ isActive }) =>
              `text-sm ${
                isActive ? "text-blue-500" : "text-gray-600"
              }`
            }
          >
            Forgot Password
          </NavLink>

          <NavLink
            to="/registerUser"
            className={({ isActive }) =>
              `text-sm ${
                isActive ? "text-blue-500" : "text-gray-600"
              }`
            }
          >
            Don't have an account? Sign Up here
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default LogIn;

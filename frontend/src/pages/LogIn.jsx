import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";

const LogIn = () => {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleOnSumbit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      const data = response.data;

      toast.success("Login Successfull");

      if (data?.user?.id) {
       localStorage.setItem("user", data.user.id);
      }
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="box-border justify-center items-center h-screen w-screen flex bg-gray-600 font-serif">
      <div className="border h-96 w-full max-w-sm rounded-3xl border-gray-200 bg-white shadow-2xl flex flex-col gap-4 items-center">
        <h2 className="text-2xl font-semibold text-center mt-4 mb-2">Login</h2>

        {/* form */}
        <form
          onSubmit={handleOnSumbit}
          className="flex flex-col gap-2 items-center w-full px-4"
        >
          {/* Email Input */}
          <div className=" flex flex-col gap-1 w-full ">
            <label htmlFor="Email" className="text-xl">
              Email
            </label>
            <input
              id="Email"
              name="Email"
              type="email"
              className="input-box"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="password"
              className="text-gray-800 font-medium text-lg tracking-wide"
            >
              Password
            </label>

            <div
      
            >
              <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-box"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-sm hover:opacity-80"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2 text-white transition-all duration-200 cursor-pointer ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="w-full flex flex-col gap-1 items-start px-4">
          <NavLink
            to="/ForgotPassword"
            className={({ isActive }) =>
              `text-sm hover:text-gray-800 ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`
            }
          >
            Forgot Password
          </NavLink>

          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `text-sm hover:text-gray-800 ${
                  isActive ? "text-blue-500" : "text-gray-500"
                }`
              }
            >
              Sign Up here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;

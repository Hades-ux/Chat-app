import axios from "axios";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import MultistepForm from "../component/MultistepForm";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields!");
      return;
    }
    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, {
        fullName,
        email,
        password,
      });

      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.log("Axios error: ", error.response);
      console.log("Axios error: ", error.response.data);

      if (
        error.response &&
        error.response.data &&
        error.response?.data?.message
      ) {
        toast.error(
          "Not able to create account: " + error.response?.data?.message
        );
      } else {
        toast.error("Not able to create account: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-semibold text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-box"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-box"
          />

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

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2 text-white transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{" "}
          <NavLink
            to="/"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
          >
            Login
          </NavLink>
        </p>
      </div>
    </div>
    // <>
    // <MultistepForm/>
    // </>
  );
};

export default Register;

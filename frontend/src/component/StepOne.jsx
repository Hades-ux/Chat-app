import { useState } from "react";

const StepOne = ({ data, onChange, next }) => {
  const [showPassword, setShowPassword] = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(data.email);
  const passwordValid = data.password.length >= 6;
  const isValid = emailValid && passwordValid;

  return (
    <div className="background">
      <div className="main-box w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold text-gray-800">
          Create your account
        </h2>
        <p className="text-center text-sm text-gray-400 mt-1 mb-6">
          Get started in less than a minute
        </p>

        <div className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={data.email}
              onChange={onChange}
              className={`input-box transition
                ${
                  data.email && !emailValid
                    ? "border-red-400 focus:ring-red-400"
                    : "focus:ring-green-400"
                }`}
            />
            {data.email && !emailValid && (
              <span className="text-xs text-red-500">
                Please enter a valid email
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 6 characters"
              value={data.password}
              onChange={onChange}
              className={`input-box pr-12 transition
                ${
                  data.password && !passwordValid
                    ? "border-red-400 focus:ring-red-400"
                    : "focus:ring-green-400"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>

            <span
              className={`text-xs mt-1 ${
                passwordValid ? "text-green-500" : "text-gray-400"
              }`}
            >
              Minimum 6 characters
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end mt-7">
          <button
            onClick={next}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg font-medium transition-all
              ${
                isValid
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
          >
            Continue →
          </button>
        </div>

        {/* Trust */}
        <p className="text-center text-xs text-gray-400 mt-5">
          🔒 Your information is securely encrypted
        </p>
      </div>
    </div>
  );
};

export default StepOne;

import { useRef } from "react";

const OTP_LENGTH = 6;

const StepThree = ({ data, onChange, back, submit, loading }) => {
  const inputsRef = useRef([]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const otpArray = data.otp.split("");
    otpArray[index] = value[0];

    onChange({
      target: {
        name: "otp",
        value: otpArray.join("").slice(0, OTP_LENGTH),
      },
    });

    if (index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key !== "Backspace") return;

    const otpArray = data.otp.split("");

    // Clear current value if exists
    if (otpArray[index]) {
      otpArray[index] = "";
    }
    // Move back & clear previous
    else if (index > 0) {
      otpArray[index - 1] = "";
      inputsRef.current[index - 1]?.focus();
    }

    onChange({
      target: {
        name: "otp",
        value: otpArray.join(""),
      },
    });
  };

  const isComplete = data.otp.length === OTP_LENGTH;

  return (
    <div className="background flex items-center justify-center min-h-screen">
      <div className="main-box w-full max-w-md p-6 rounded-2xl shadow-lg bg-white">
        <h2 className="text-center mb-1 text-2xl font-semibold text-gray-700">
          Verify Email
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter the 6-digit code sent to <br />
          <span className="font-medium">{data.email}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={data.otp[index] || ""}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 outline-none rounded-lg focus:ring-2 focus:ring-gray-400"
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={back}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!isComplete || loading}
            className={`px-5 py-2 rounded-lg transition
              ${
                isComplete && !loading
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
          >
            {loading ? "Verifying..." : "Submit"}
          </button>
        </div>

        {/* Resend */}
        <p className="text-center text-sm text-gray-400 mt-5">
          Didn’t receive the code?{" "}
          <button className="text-blue-500 hover:underline">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default StepThree;

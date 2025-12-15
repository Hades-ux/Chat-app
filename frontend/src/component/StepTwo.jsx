import { useMemo } from "react";

const StepTwo = ({ data, onChange, next, back }) => {
  const avatarPreview = useMemo(() => {
    if (!data.avatar) return null;
    return URL.createObjectURL(data.avatar);
  }, [data.avatar]);

  const isValid = data.username && data.avatar;

  return (
    <div className="background">
      <div className="main-box w-full max-w-md p-4 rounded-2xl shadow-lg bg-white">
        <h2 className="text-center mb-1 text-2xl font-semibold text-gray-700">
          Profile Info
        </h2>
        <p className="text-center text-sm text-gray-400">
          Tell us a bit about yourself
        </p>

        <div className="flex flex-col gap-2">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              name="username"
              placeholder="Choose a username"
              value={data.username}
              onChange={onChange}
              required
              className="input-box focus:ring-2 focus:ring-green-400"
            />
            <span className="text-xs text-gray-400">
              This will be visible to other users
            </span>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              Profile picture
            </label>

            <label className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-green-400 transition">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="text-sm text-gray-400">
                  Click to upload an image
                  <br />
                  <span className="text-xs">PNG, JPG up to 5MB</span>
                </div>
              )}

              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={onChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <button
            onClick={back}
            className="button px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            ← Back
          </button>

          <button
            onClick={next}
            disabled={!isValid}
            className={`button px-5 py-2 rounded-lg transition
              ${
                isValid
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useChat } from "../context/ChatContext";

const ChangeUserAvatar = () => {
  const API = import.meta.env.VITE_API_URL;
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const { setPopup, owner, setOwner } = useChat();
  const [preview, setPreview] = useState(null);

  const isAvatar = owner?.avatar?.url;

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!file || loading) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      await axios.patch(
        `${API}/user/update-avatar/Image`,
        formData,
        {
          withCredentials: true,
        }
      );
      toast.success(`Avatar updated successfully`);
      setFile("");
      setPopup(null);
      window.location.reload();
    } catch (error) {
      toast.error("Not Able to update Avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-center text-2xl font-semibold text-gray-700 mb-2">
        {isAvatar ? "Change Avatar" : "Update Avatar"}
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        This name will be visible to other user
      </p>

      <form className="flex flex-col gap-5" onSubmit={handleOnSubmit}>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="changeAvatar"
            className="text-sm font-medium text-gray-600"
          >
            New Avatar
          </label>
          <input
            aria-label="Change Avatar"
            id="changeAvatar"
            type="file"
            accept="image/*"
            placeholder="Enter your new name"
            onChange={(e) => setFile(e.target.files[0])}
            className="input-box transition"
            disabled={loading}
          />
          {file && (
            <div className="flex flex-col gap-2">
              {/* File Name */}
              <p className="text-sm text-gray-500">
                Selected file: {file.name}
              </p>

              {/* File Preview */}
              <img
                src={preview}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="py-2 rounded-lg text-white font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
};

export default ChangeUserAvatar;

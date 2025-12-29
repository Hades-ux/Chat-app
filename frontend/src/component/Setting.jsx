import { useChat } from "../context/ChatContext";
import { PANELS } from "../context/UIState.js";

const Setting = () => {
  const { owner, setActivePanel, logout, deleteUser } = useChat();

  const avatarUrl = owner?.avatar?.url;
  const firstChar =
    owner?.fullName?.charAt(0)?.toUpperCase() ||
    owner?.email?.charAt(0)?.toUpperCase();

  async function handleLogOut() {
    await logout();
  }

  async function handleDelete() {
    await deleteUser()
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-800">Settings</h1>

      {/* Profile Card */}
      <div
        onClick={() => setActivePanel(PANELS.USER_PROFILE)}
        className="group flex items-center justify-between rounded-2xl p-4 cursor-pointer
                   bg-white hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={owner?.fullName || "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-gray-600">
                {firstChar}
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <p className="font-medium text-gray-800">
              {owner?.fullName || "Your Profile"}
            </p>
            <p className="text-sm text-gray-500">View profile</p>
          </div>
        </div>

        {/* Chevron */}
        <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600">
          chevron_right
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="flex items-center gap-4 rounded-2xl p-4
                   text-red-600 hover:bg-red-50 transition"
      >
        <span className="material-symbols-outlined">delete</span>
        <span className="font-medium">Delete</span>
      </button>

      {/* Logout */}
      <button
        onClick={handleLogOut}
        className="flex items-center gap-4 rounded-2xl p-4
                   text-red-600 hover:bg-red-50 transition"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

export default Setting;

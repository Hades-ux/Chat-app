import { useChat } from "../context/ChatContext";
import { POPUPS } from "../context/UIState";
import ChangeUserName from "./ChangeUserName";
import ChangeUserEmail from "./ChangeUserEmail"
import PopupShell from "./modal/popup/PopupShell";
import ChangeUserAvatar from "./ChangeUserAvatar";

const Profile = () => {
  const { owner, setPopup, popup } = useChat();

  if (!owner) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading profile...
      </div>
    );
  }

  const avatarUrl = owner?.avatar?.url;
  const firstChar =
    owner?.fullName?.charAt(0)?.toUpperCase() ||
    owner?.email?.charAt(0)?.toUpperCase();

  return (
    <div className="h-full w-full bg-gray-100">
      {/* Top Section */}
      <div className="bg-white px-6 pt-8 pb-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 cursor-pointer"
        onClick={()=>setPopup(POPUPS.CHANGE_AVATAR)}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={owner.fullName || "Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-semibold text-gray-600">
              {firstChar}
            </span>
          )}
        </div>

        {/* Verification */}
        <p
          className={`text-sm mt-1 ${
            owner.isVerified ? "text-green-600" : "text-gray-500"
          }`}
        >
          {owner.isVerified ? "Verified account" : "Not verified"}
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-3 bg-white">
        {/* Name */}
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Name</p>

          <div className="flex items-center justify-between">
            <p className="text-xl font-medium text-gray-900">
              {owner.fullName}
            </p>
            <button
              className="bg-green-400 text-white p-2 rounded-md"
              onClick={() => setPopup(POPUPS.CHANGE_USERNAME)}
            >
              Change Name
            </button>
          </div>
        </div>
        {/* Email */}
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Email</p>

          <div className="flex items-center justify-between">
            <p className="text-gray-900">{owner.email}</p>
            <button
              className="bg-green-400 text-white p-2 rounded-md"
              onClick={() => setPopup(POPUPS.CHANGE_EMAIL)}
            >
              Change Email
            </button>
          </div>
        </div>

        {/* Joined Date */}
        <div className="px-6 py-4">
          <p className="text-xs text-gray-500 mb-1">Joined</p>
          <p className="text-gray-900">
            {new Date(owner.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* popUps */}
        <PopupShell visible={POPUPS.CHANGE_USERNAME === popup}>
          <ChangeUserName/>
        </PopupShell>

        <PopupShell visible={POPUPS.CHANGE_EMAIL === popup}>
          <ChangeUserEmail/>
        </PopupShell>

        <PopupShell visible={POPUPS.CHANGE_AVATAR === popup}>
          <ChangeUserAvatar/>
        </PopupShell>

    </div>
  );
};

export default Profile;

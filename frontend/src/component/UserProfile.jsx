import { useChat } from "../context/ChatContext";

const Profile = () => {
  const { userProfile } = useChat();

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading profile...
      </div>
    );
  }

  const avatarUrl = userProfile?.avatar?.url;
  const firstChar =
    userProfile?.fullName?.charAt(0)?.toUpperCase() ||
    userProfile?.email?.charAt(0)?.toUpperCase();
  return (
    <div className="h-full w-full bg-gray-100">
      {/* Top Section */}
      <div className="bg-white px-6 pt-8 pb-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 cursor-pointer">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userProfile.fullName || "Avatar"}
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
            userProfile.isVerified ? "text-green-600" : "text-gray-500"
          }`}
        >
          {userProfile.isVerified ? "Verified account" : "Not verified"}
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-3 bg-white">
        {/* Name */}
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Name</p>
            <p className="text-xl font-medium text-gray-900">
              {userProfile.fullName}
            </p>
        </div>
        {/* Email */}
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Email</p>

            <p className="text-gray-900">{userProfile.email}</p>
        </div>

        {/* Joined Date */}
        <div className="px-6 py-4">
          <p className="text-xs text-gray-500 mb-1">Joined</p>
          <p className="text-gray-900">
            {new Date(userProfile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

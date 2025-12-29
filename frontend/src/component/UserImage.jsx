import { useChat } from "../context/ChatContext.jsx";

const UserImage = () => {
  const { userProfile } = useChat();

  if (!userProfile) {
    return (
      <div className="h-32 w-32 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  const avatarUrl = userProfile?.avatar?.url;
  const firstChar =
    userProfile?.fullName?.charAt(0)?.toUpperCase() ||
    userProfile?.email?.charAt(0)?.toUpperCase();

  return (
    <>
    <div className="flex items-center justify-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={userProfile.fullName || "Avatar"}
          className="h-40 w-40 object-cover border"
        />
      ) : (
        <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-4xl font-semibold text-gray-600">
            {firstChar}
          </span>
        </div>
      )}
    </div>
    </>
  );
};

export default UserImage;

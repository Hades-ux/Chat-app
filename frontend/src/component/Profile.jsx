import { useChat } from "../context/ChatContext";

const Profile = () => {
  const { owner } = useChat();

  if (!owner) {
    return (
      <div className="p-6 text-gray-500 text-center">
        Loading profile...
      </div>
    );
  }

  const avatarUrl = owner?.avatar?.url;
  const firstChar =
    owner?.fullName?.charAt(0)?.toUpperCase() ||
    owner?.email?.charAt(0)?.toUpperCase();

  return (
    <div className="h-full w-full bg-gray-100 p-6">
      
      {/* Card */}
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={owner.fullName || "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-semibold text-gray-600">
                {firstChar}
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <p className="text-lg font-medium text-gray-800 text-center">
          {owner.fullName}
        </p>

        {/* Verification */}
        <p
          className={`text-sm text-center mt-1 ${
            owner.isVerified ? "text-green-600" : "text-red-500"
          }`}
        >
          {owner.isVerified ? "Verified Account" : "Not Verified"}
        </p>

        {/* Divider */}
        <hr className="my-5" />

        {/* Details */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Email</span>
            <span className="text-gray-800">{owner.email}</span>
          </div>

          <div className="flex justify-between">
            <span>Joined</span>
            <span className="text-gray-800">
              {new Date(owner.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

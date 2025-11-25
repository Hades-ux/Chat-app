const registerValidation = (data) => {
  const fullName = data.fullName?.trim();
  const email = data.email?.trim()?.toLowerCase();
  const password = data.password?.trim();

  if (!fullName) return "Username is required";

  if (!email) return "Email is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return "Invalid email format";

  if (!password) return "Password is required";

  if (password.length < 6)
    return "Password must be at least 6 characters";

  return null;
};

export { registerValidation };

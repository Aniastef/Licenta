// utils/syncUser.js
import userAtom from "../atoms/userAtom";
export const syncUser = async (setUser) => {
  try {
    const res = await fetch("/api/users/me", {
      credentials: "include",
    });

    const data = await res.json();
    setUser(data);
    localStorage.setItem("licenta", JSON.stringify(data));
    console.log("🔄 User synced:", data);
    return data; // 👈 returnează user-ul
  } catch (error) {
    console.error("Failed to sync user:", error);
    return null;
  }
};

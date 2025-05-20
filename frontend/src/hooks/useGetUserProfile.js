import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const useGetUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Nou
  const { username } = useParams();

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true); // 🟡 Începe încărcarea
        const res = await fetch(`/api/users/profile/${username}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data.error) {
          console.error("Error:", data.error);
          setUser(null);
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error("Error:", error.message);
        setUser(null);
      } finally {
        setLoading(false); // ✅ Gata încărcarea
      }
    };

    if (username) getUser();
  }, [username]);

  return { user, loading }; // ✅ Returnează și `loading`
};

export default useGetUserProfile;

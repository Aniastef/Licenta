import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const useGetUserProfile = () => {
  const [user, setUser] = useState(null);
  const { username } = useParams();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();

        if (data.error) {
          console.error("Error:", data.error);
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Error:", error.message);
      } 
    };
    getUser();
  }, [username]);

  return { user };
};

export default useGetUserProfile;
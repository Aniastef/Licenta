import { useEffect, useState } from "react";

const useUnreadMessagesCount = () => {
  const [count, setCount] = useState(0);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations", {
        credentials: "include",
      });

      const data = await res.json();
      if (Array.isArray(data.conversations)) {
        const unread = data.conversations.filter((c) => c.isUnread).length;
        setCount(unread);
      }
    } catch (err) {
      console.error("Error fetching unread messages count", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Refresh la fiecare 10s
    return () => clearInterval(interval);
  }, []);

  return count;
};

export default useUnreadMessagesCount;

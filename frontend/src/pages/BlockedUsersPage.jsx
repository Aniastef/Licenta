import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  Spinner,
} from "@chakra-ui/react";

const BlockedUsersPage = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch("/api/users/blocked", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      const data = await res.json();
      setBlockedUsers(data.blockedUsers || []);
    } catch (err) {
      console.error("Failed to fetch blocked users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const res = await fetch(`/api/users/unblock/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        setBlockedUsers((prev) => prev.filter((user) => user._id !== userId));
      }
    } catch (err) {
      console.error("Failed to unblock user", err);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return (
    <Box p={6} maxWidth="700px" mx="auto">
      <Heading size="lg" mb={6}>Blocked Users</Heading>
      {loading ? (
        <Spinner />
      ) : blockedUsers.length === 0 ? (
        <Text>No users are currently blocked.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {blockedUsers.map((user) => (
            <HStack key={user._id} justify="space-between" p={4} borderWidth="1px" borderRadius="md">
              <HStack>
                <Avatar
                  name={user.firstName}
                  src={user.profilePicture || "/default-avatar.png"}
                />
                <Text>{user.firstName} {user.lastName}</Text>
              </HStack>
              <Button
                colorScheme="green"
                size="sm"
                onClick={() => handleUnblock(user._id)}
              >
                Unblock
              </Button>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default BlockedUsersPage;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  Spinner,
  useToast,
} from '@chakra-ui/react';

const BlockedUsersPage = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch('/api/users/blocked', {
        credentials: 'include',
      });
      const data = await res.json();
      setBlockedUsers(data.blockedUsers || []);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const res = await fetch(`/api/users/unblock/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast({
          title: 'User unblocked',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchBlockedUsers();
      } else {
        toast({
          title: 'Failed to unblock user',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Unblock error:', err);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return (
    <Box maxW="600px" mx="auto" mt={10} p={5}>
      <Heading mb={6}>Blocked Users</Heading>
      {loading ? (
        <Spinner />
      ) : blockedUsers.length === 0 ? (
        <Text>You have not blocked any users.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {blockedUsers.map((user) => (
            <HStack key={user._id} justify="space-between">
              <HStack>
                <Avatar src={user.profilePicture} name={`${user.firstName} ${user.lastName}`} />
                <Text>
                  {user.firstName} {user.lastName}
                </Text>
              </HStack>
              <Button colorScheme="green" onClick={() => handleUnblock(user._id)}>
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

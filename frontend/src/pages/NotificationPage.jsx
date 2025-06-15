import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  Button,
  Badge,
  Flex,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include',
      });
      const data = await res.json();
      console.log('📬 Notifications:', JSON.stringify(data, null, 2));
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsSeen = async () => {
    try {
      await fetch('/api/notifications/mark-all-seen', {
        method: 'POST',
        credentials: 'include',
      });
      toast({
        title: 'All notifications marked as seen.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as seen', err);
    }
  };

  const acceptInvite = async (galleryId) => {
    if (!galleryId) {
      toast({
        title: 'Missing gallery ID',
        description: "This invite doesn't contain a valid gallery reference.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log('✅ Accepting invite to:', galleryId);
    try {
      const res = await fetch(`/api/galleries/${galleryId}/accept-invite`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept invite');

      toast({
        title: 'Invite accepted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to accept invite', err);
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const declineInvite = async (galleryId) => {
    if (!galleryId) {
      toast({
        title: 'Missing gallery ID',
        description: "This invite doesn't contain a valid gallery reference.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log('❌ Declining invite to:', galleryId);
    try {
      const res = await fetch(`/api/galleries/${galleryId}/decline-invite`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to decline invite');

      toast({
        title: 'Invite declined',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to decline invite', err);
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleNavigate = async (n) => {
    try {
      await fetch(`/api/notifications/${n._id}/mark-seen`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to mark as seen', err);
    } finally {
      navigate(n.link || '/');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <Spinner size="xl" mt={10} />;

  return (
    <Box p={8} maxW="3xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="xl">
          All Notifications
        </Heading>
        <Button size="sm" onClick={markAllAsSeen} colorScheme="blue">
          Mark all as read
        </Button>
      </Flex>
      <VStack align="stretch" spacing={4}>
        {notifications.length === 0 ? (
          <Text>No notifications found.</Text>
        ) : (
          notifications.map((n) => (
            <Box
              key={n._id}
              p={4}
              rounded="md"
              bg={n.seen ? 'gray.100' : 'blue.50'}
              borderWidth={1}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text>{n.message}</Text>
                {!n.seen && <Badge colorScheme="blue">New</Badge>}
              </Flex>
              <Text fontSize="xs" color="gray.500" mb={2}>
                {new Date(n.createdAt).toLocaleString()}
              </Text>

              {n.type === 'invite' && n.meta?.galleryId ? (
                <GalleryInviteActions
                  galleryId={n.meta.galleryId}
                  onAccept={() => acceptInvite(n.meta.galleryId)}
                  onDecline={() => declineInvite(n.meta.galleryId)}
                />
              ) : (
                <Button
                  size="sm"
                  variant="link"
                  colorScheme="blue"
                  onClick={() => handleNavigate(n)}
                >
                  View
                </Button>
              )}
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default NotificationsPage;

// ✅ Componentă internă pentru verificarea dacă userul e deja colaborator
const GalleryInviteActions = ({ galleryId, onAccept, onDecline }) => {
  const [alreadyCollaborator, setAlreadyCollaborator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/api/galleries/${galleryId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        const currentUserId = data?.currentUserId || null;

        if (Array.isArray(data.collaborators)) {
          const isCollab = data.collaborators.some((c) => c._id === currentUserId);
          setAlreadyCollaborator(isCollab);
        }
      } catch (e) {
        console.warn('Error checking collaborator status', e.message);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [galleryId]);

  if (loading) return <Text fontSize="xs">Checking access...</Text>;
  if (alreadyCollaborator)
    return (
      <Text fontSize="sm" color="green.600">
        ✅ You're already a collaborator
      </Text>
    );

  return (
    <HStack>
      <Button colorScheme="green" size="sm" onClick={onAccept}>
        Accept
      </Button>
      <Button colorScheme="red" size="sm" onClick={onDecline}>
        Decline
      </Button>
    </HStack>
  );
};

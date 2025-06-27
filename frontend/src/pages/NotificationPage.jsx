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
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error('Expected an array of notifications, got:', data);
        setNotifications([]);
      }
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
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as seen.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const acceptInvite = async (notificationId, galleryId) => {
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
    console.log('Accepting invite to:', galleryId);
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

  const declineInvite = async (notificationId, galleryId) => {
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
    console.log(' Declining invite to:', galleryId);
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
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === n._id ? { ...notif, seen: true } : notif
        )
      );
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
                  notification={n} 
                  galleryId={n.meta.galleryId}
                  onAccept={() => acceptInvite(n._id, n.meta.galleryId)} 
                  onDecline={() => declineInvite(n._id, n.meta.galleryId)}
                />
              ) : (
                n.link && ( 
                  <Button
                    size="sm"
                    variant="link"
                    colorScheme="blue"
                    onClick={() => handleNavigate(n)}
                  >
                    View
                  </Button>
                )
              )}
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default NotificationsPage;

const GalleryInviteActions = ({ notification, galleryId, onAccept, onDecline }) => {
  const [loading, setLoading] = useState(true);
  const [inviteStatus, setInviteStatus] = useState('pending'); 

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/galleries/${galleryId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        const currentUserId = notification.user; 

        if (!data) {
          setInviteStatus('not_found'); 
          return;
        }

        const isCollab = data.collaborators.some((c) => c._id === currentUserId);
        const isPending = data.pendingCollaborators.some((p) => p._id === currentUserId);

        if (isCollab) {
          setInviteStatus('already_collaborator');
        } else if (!isPending) {
          setInviteStatus('withdrawn'); 
        } else {
          setInviteStatus('pending'); 
        }
      } catch (e) {
        console.warn('Error checking collaborator status:', e.message);
        setInviteStatus('error'); 
      } finally {
        setLoading(false);
      }
    };

    if (notification.type === 'invite') {
      if (notification.seen) {
        setInviteStatus('handled');
        setLoading(false);
      } else {
        checkStatus();
      }
    } else {
      setLoading(false); 
    }
  }, [galleryId, notification]); 

  const handleAccept = async () => {
    await onAccept(); 
    setInviteStatus('accepted'); 
  };

  const handleDecline = async () => {
    await onDecline(); 
    setInviteStatus('declined'); 
  };

  if (loading) {
    return <Text fontSize="xs">Checking invitation status...</Text>;
  }

  if (inviteStatus === 'accepted') {
    return (
      <Text fontSize="sm" color="green.600">
        You accepted this invitation.
      </Text>
    );
  }

  if (inviteStatus === 'declined') {
    return (
      <Text fontSize="sm" color="red.600">
        You declined this invitation.
      </Text>
    );
  }

  if (inviteStatus === 'already_collaborator') {
    return (
      <Text fontSize="sm" color="blue.600">
        You're already a collaborator.
      </Text>
    );
  }

  if (inviteStatus === 'withdrawn' || inviteStatus === 'not_found') {
    return (
      <Text fontSize="sm" color="gray.600">
        Invitation no longer valid.
      </Text>
    );
  }

  if (inviteStatus === 'handled') {
    return (
      <Text fontSize="sm" color="gray.600">
        Invitation handled.
      </Text>
    );
  }

  if (inviteStatus === 'error') {
    return (
      <Text fontSize="sm" color="red.500">
        Error checking invitation status.
      </Text>
    );
  }

  return (
    <HStack spacing={3}>
      <Button size="sm" colorScheme="green" onClick={handleAccept}>
        Accept
      </Button>
      <Button size="sm" colorScheme="red" onClick={handleDecline}>
        Decline
      </Button>
    </HStack>
  );
};
import React, { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  IconButton,
  Box,
  Text,
  Badge,
  VStack,
  Button,
  HStack,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const NotificationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      const data = await res.json();

      if (Array.isArray(data)) {
        setNotifications(data);
        setUnseenCount(data.filter((n) => !n.seen).length);
      } else {
        console.error('Expected an array of notifications, got:', data);
        setNotifications([]);
        setUnseenCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAsSeenAndNavigate = async (notification) => {
    try {
      await fetch(`/api/notifications/${notification._id}/mark-seen`, {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => (n._id === notification._id ? { ...n, seen: true } : n)),
      );
      setUnseenCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as seen', err);
    } finally {
      setIsOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
    }
  };

  const markAllAsSeen = async () => {
    try {
      await fetch('/api/notifications/mark-all-seen', {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications((prevNotifications) => prevNotifications.map((n) => ({ ...n, seen: true })));
      setUnseenCount(0);
    } catch (err) {
      console.error('Failed to mark all as seen', err);
    }
  };

  const acceptInvite = async (notificationId, galleryId) => {
    try {
      const res = await fetch(`/api/galleries/${galleryId}/accept-invite`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n._id === notificationId
              ? {
                  ...n,
                  seen: true,
                }
              : n,
          ),
        );
        setUnseenCount((prevCount) => Math.max(0, prevCount - 1));
      } else {
        console.error('Failed to accept invite:', await res.json());
      }
    } catch (err) {
      console.error('Failed to accept invite', err);
    }
  };

  const declineInvite = async (notificationId, galleryId) => {
    try {
      const res = await fetch(`/api/galleries/${galleryId}/decline-invite`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((n) => n._id !== notificationId),
        );
        setUnseenCount((prevCount) => Math.max(0, prevCount - 1));
      } else {
        console.error('Failed to decline invite:', await res.json());
      }
    } catch (err) {
      console.error('Failed to decline invite', err);
    }
  };

  return (
    <>
      <Box position="relative">
        <IconButton
          icon={<BellIcon boxSize={7} />}
          onClick={handleOpen}
          aria-label="Notifications"
          variant="ghost"
        />
        {unseenCount > 0 && (
          <Badge
            colorScheme="red"
            position="absolute"
            top="0"
            right="0"
            borderRadius="full"
            fontSize="0.7em"
            px={2}
          >
            {unseenCount}
          </Badge>
        )}
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={() => setIsOpen(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader display="flex" justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold">
              Notifications
            </Text>
            <Button size="sm" variant="outline" onClick={markAllAsSeen}>
              Mark all as read
            </Button>
          </DrawerHeader>

          <DrawerBody>
            <VStack align="start" spacing={4}>
              {notifications.length === 0 ? (
                <Text>No notifications</Text>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <Box
                    key={n._id}
                    p={3}
                    bg={n.seen ? 'gray.100' : 'blue.50'}
                    rounded="md"
                    w="100%"
                    cursor={n.type !== 'invite' && n.link ? 'pointer' : 'default'}
                    onClick={() => n.type !== 'invite' && n.link && markAsSeenAndNavigate(n)}
                  >
                    <Text mb={1}>{n.message}</Text>
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
                        <Box mt={1} cursor="pointer" onClick={() => markAsSeenAndNavigate(n)}>
                          <Text color="blue.600" fontSize="sm">
                            View
                          </Text>
                        </Box>
                      )
                    )}
                  </Box>
                ))
              )}
            </VStack>

            <HStack justify="space-between" mt={4} w="100%">
              <Button
                variant="link"
                colorScheme="blue"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
              >
                See all notifications
              </Button>
            </HStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NotificationDrawer;

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

    if (notification.type === 'invite' && !notification.seen) {
      checkStatus();
    } else if (notification.type === 'invite' && notification.seen) {
      setInviteStatus('handled');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [galleryId, notification]);

  const handleAccept = async () => {
    await onAccept(galleryId);
    setInviteStatus('accepted');
  };

  const handleDecline = async () => {
    await onDecline(galleryId);
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

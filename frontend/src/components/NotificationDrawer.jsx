import React, { useEffect, useState } from "react";
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
  HStack
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const NotificationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      const data = await res.json();
      setNotifications(data);
      setUnseenCount(data.filter((n) => !n.seen).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  const markAsSeenAndNavigate = async (notification) => {
    try {
      await fetch(`/api/notifications/${notification._id}/mark-seen`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to mark notification as seen", err);
    } finally {
      setIsOpen(false);
      navigate(notification.link || "/");
    }
  };

  const acceptInvite = async (galleryId) => {
    try {
      await fetch(`/api/galleries/${galleryId}/accept-invite`, {
        method: "POST",
        credentials: "include",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to accept invite", err);
    }
  };

  const declineInvite = async (galleryId) => {
    try {
      await fetch(`/api/galleries/${galleryId}/decline-invite`, {
        method: "POST",
        credentials: "include",
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to decline invite", err);
    }
  };

  return (
    <>
      <IconButton
        icon={<BellIcon />}
        onClick={handleOpen}
        position="relative"
        aria-label="Notifications"
        variant="ghost"
      >
        {unseenCount > 0 && (
          <Badge colorScheme="red" position="absolute" top="-1" right="-1">
            {unseenCount}
          </Badge>
        )}
      </IconButton>

      <Drawer isOpen={isOpen} placement="right" onClose={() => setIsOpen(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Notifications</DrawerHeader>
          <DrawerBody>
            <VStack align="start" spacing={4}>
              {notifications.length === 0 ? (
                <Text>No notifications</Text>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <Box
                    key={n._id}
                    p={3}
                    bg={n.seen ? "gray.100" : "blue.50"}
                    rounded="md"
                    w="100%"
                  >
                    <Text mb={2}>{n.message}</Text>

                    {n.type === "invite" && n.meta?.galleryId ? (
                      <GalleryInviteActions
                        galleryId={n.meta.galleryId}
                        onAccept={() => acceptInvite(n.meta.galleryId)}
                        onDecline={() => declineInvite(n.meta.galleryId)}
                      />
                    ) : (
                      <Box
                        mt={2}
                        cursor="pointer"
                        onClick={() => markAsSeenAndNavigate(n)}
                      >
                        <Text color="blue.600" fontSize="sm">
                          View
                        </Text>
                      </Box>
                    )}
                  </Box>
                ))
              )}
            </VStack>

            <Button
              mt={4}
              variant="link"
              colorScheme="blue"
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
            >
              See all notifications
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NotificationDrawer;

// ✅ Reutilizabil: verifică dacă userul e deja colaborator
const GalleryInviteActions = ({ galleryId, onAccept, onDecline }) => {
  const [alreadyCollaborator, setAlreadyCollaborator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/api/galleries/${galleryId}`, {
          credentials: "include",
        });
        const data = await res.json();
        const currentUserId = data?.currentUserId;

        if (Array.isArray(data.collaborators)) {
          const isCollab = data.collaborators.some((c) => c._id === currentUserId);
          setAlreadyCollaborator(isCollab);
        }
      } catch (e) {
        console.warn("Error checking collaborator status", e.message);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [galleryId]);

  if (loading) return <Text fontSize="xs">Checking...</Text>;
  if (alreadyCollaborator)
    return <Text fontSize="sm" color="green.600">✅ You're already a collaborator</Text>;

  return (
    <HStack spacing={3}>
      <Button size="sm" colorScheme="green" onClick={onAccept}>
        Accept
      </Button>
      <Button size="sm" colorScheme="red" onClick={onDecline}>
        Decline
      </Button>
    </HStack>
  );
};

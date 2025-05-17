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
      
      // If it's an array, use it, otherwise log an error
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnseenCount(data.filter((n) => !n.seen).length);
      } else {
        console.error("Expected an array of notifications, got:", data);
        setNotifications([]);
        setUnseenCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };
  

  const handleOpen = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications(); // la montare
  }, []);
  
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 10000); // mai frecvent
    return () => clearInterval(interval);
  }, []);
  
  


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

  const markAllAsSeen = async () => {
    try {
      await fetch("/api/notifications/mark-all-seen", {
        method: "POST",
        credentials: "include",
      });
      fetchNotifications(); // actualizează lista după
    } catch (err) {
      console.error("Failed to mark all as seen", err);
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
      <Box position="relative">
  <IconButton
  icon={<BellIcon boxSize={7} />} // ⬅️ fă-l mai mare, default e 5 (20px), acum e 7 (28px)
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
  <Text fontSize="lg" fontWeight="bold">Notifications</Text>
  <Button size="sm" variant="outline" onClick={markAllAsSeen}>
    Mark all as seen
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
      bg={n.seen ? "gray.100" : "blue.50"}
      rounded="md"
      w="100%"
    >
      <Text mb={1}>{n.message}</Text>
    
      {/* ⏱️ Data notificării */}
      <Text fontSize="xs" color="gray.500" mb={2}>
        {new Date(n.createdAt).toLocaleString()}
      </Text>
    
      {n.type === "invite" && n.meta?.galleryId ? (
        <GalleryInviteActions
          galleryId={n.meta.galleryId}
          onAccept={() => acceptInvite(n.meta.galleryId)}
          onDecline={() => declineInvite(n.meta.galleryId)}
        />
      ) : (
        <Box
          mt={1}
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

{/* 🔘 New Buttons */}
<HStack justify="space-between" mt={4} w="100%">

  <Button
    variant="link"
    colorScheme="blue"
    onClick={() => {
      setIsOpen(false);
      navigate("/notifications");
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

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  useToast
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import searchIcon from "../assets/searchIcon.png";

const MotionBox = motion(Box);

const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isBlocked, setIsBlocked] = useState(false);


  const currentUserId = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && conversations.length > 0) {
      const found = conversations.find((conv) => conv.user._id === userId);
      if (found) setSelectedUser(found.user);
    }
  }, [userId, conversations]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });
  
      const data = await res.json();
      setCurrentUser(data);
  
      // 🧠 Setăm corect isBlocked — comparăm .toString()
      if (userId && data.blockedUsers) {
        const isBlocked = data.blockedUsers.some(
          (u) => String(u._id || u) === String(userId)
        );
        setIsBlocked(isBlocked);
      }
    } catch (error) {
      console.error("Failed to fetch current user", error);
    }
  };
  

  const handleToggleBlock = async () => {
    try {
      const route = isBlocked ? "unblock" : "block";
  
      const res = await fetch(`/api/users/${route}/${userId}`, {
        method: "POST",
        credentials: "include",
      });
  
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
  
        const isBlockedNow = updatedUser.blockedUsers.some(
          (u) => String(u._id || u) === String(userId)
        );
        setIsBlocked(isBlockedNow);
  
        toast({
          title: route === "unblock" ? "User unblocked" : "User blocked",
          status: route === "unblock" ? "success" : "warning",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to update block status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Block/unblock error:", err.message);
    }
  };
  
  
  
  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
        await fetch(`/api/messages/seen/${userId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        });
      } else {
        console.error("Error fetching messages:", data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const response = await fetch(`/api/users/search?query=${search}`, {
        credentials: "include",
      });
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    navigate(`/messages/${user._id}`);
    setSearch("");
    setSearchResults([]);
  };

  const handleSendMessage = async () => {
  
    if (!newMessage.trim()) return;
  
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ receiverId: userId, content: newMessage }),
      });
  
      const data = await response.json();
  
      if (response.status === 403) {
        toast({
          title: "You were blocked.",
          description: data.error || "You cannot message this user.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      if (response.ok) {
        setMessages([...messages, data.data]);
        setNewMessage("");
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  
  const getLastSeenMessage = () => {
    const sentMessages = messages.filter(
      (msg) => String(msg.sender?._id) === String(currentUserId) && msg.isRead && msg.readAt
    );
    return sentMessages.length > 0
      ? sentMessages[sentMessages.length - 1]
      : null;
  };

  
  useEffect(() => {
    if (userId && currentUser) {
      const found = conversations.find((conv) => conv.user._id === userId);
      if (found) setSelectedUser(found.user);
    }
  }, [currentUser]);
  

  return (
    <Flex height="100vh">
      {/* Sidebar */}
      <Box width="30%" p={4} borderRight="1px solid #ddd">
        <Heading size="md">Chats</Heading>
        <Flex mt={3} align="center">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            flex="1"
          />
          <Button ml={2} onClick={handleSearch} bg="transparent" _hover={{ bg: "gray.200" }}>
            <img src={searchIcon} alt="Search" width="20px" height="20px" />
          </Button>
        </Flex>

        {searchResults.length > 0 && (
          <VStack mt={2} align="start" spacing={1} bg="gray.100" p={2} borderRadius="md">
            {searchResults.map((user) => (
              <HStack
                key={user._id}
                p={2}
                borderRadius="md"
                width="100%"
                _hover={{ backgroundColor: "gray.200" }}
                onClick={() => handleSelectUser(user)}
                cursor="pointer"
              >
                <Avatar size="sm" name={user.firstName} />
                <Text>{user.firstName} {user.lastName}</Text>
              </HStack>
            ))}
          </VStack>
        )}

        <VStack mt={4} align="start" spacing={2}>
          {conversations.map((conv) => (
            <HStack
              key={conv.user._id}
              p={3}
              borderRadius="md"
              width="100%"
              _hover={{ backgroundColor: "gray.100" }}
              onClick={() => handleSelectUser(conv.user)}
              cursor="pointer"
              justify="space-between"
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={conv.user.firstName}
                  src={conv.user.profilePicture || "https://i.pravatar.cc/150"}
                />
                <Text>{conv.user.firstName} {conv.user.lastName}</Text>
              </HStack>
              {conv.isUnread && (
                <Box w="10px" h="10px" borderRadius="full" bg="red.400" />
              )}
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Chat Window */}
      <Box width="70%" p={5}>
        {selectedUser ? (
          <VStack mb={4} align="start" spacing={3}>
            <HStack spacing={4} align="center">
              <Avatar
                name={selectedUser.firstName}
                src={selectedUser.profilePicture || "https://i.pravatar.cc/150"}
                size="md"
              />
              <Heading size="lg">
                Chat with {selectedUser.firstName} {selectedUser.lastName}
              </Heading>
            </HStack>
            {selectedUser && currentUser && (
          <Button
          colorScheme={isBlocked ? "green" : "red"}
          onClick={handleToggleBlock}
        >
          {isBlocked ? "Unblock User" : "Block User"}
        </Button>
        
        
        )}



          </VStack>
        ) : (
          <Heading size="lg" mb={2}>Messages</Heading>
        )}

<Box width="70%" p={5}>
        {selectedUser ? (
          <HStack mb={4} spacing={4} align="center">
            <Avatar
              name={selectedUser.firstName}
              src={selectedUser.profilePicture || "https://i.pravatar.cc/150"}
              size="md"
            />
            <Heading size="lg">
              Chat with {selectedUser.firstName} {selectedUser.lastName}
            </Heading>
          </HStack>
        ) : (
          <Heading size="lg" mb={2}>Messages</Heading>
        )}

        <Box
          border="1px solid #ddd"
          borderRadius="md"
          p={4}
          mt={2}
          height="65vh"
          overflowY="auto"
          backgroundColor="gray.50"
        >
          {loading ? (
            <Flex justify="center" align="center" height="100%">
              <Spinner size="lg" />
            </Flex>
          ) : messages.length === 0 ? (
            <Text>No messages yet.</Text>
          ) : (
            <VStack spacing={5} align="stretch">
              {messages.map((msg, index) => {
                const isCurrentUser = String(msg.sender?._id) === String(currentUserId);
                const lastSeen = getLastSeenMessage();
                const isLastSeen = lastSeen && lastSeen._id === msg._id;

                return (
                  <Flex
                    key={index}
                    direction="column"
                    align={isCurrentUser ? "flex-end" : "flex-start"}
                  >
                    <MotionBox
                      bg={isCurrentUser ? "blue.100" : "gray.200"}
                      px={6}
                      py={4}
                      fontSize="lg"
                      borderRadius="2xl"
                      maxWidth="80%"
                      wordBreak="break-word"
                      boxShadow="md"
                      alignSelf={isCurrentUser ? "flex-end" : "flex-start"}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {!isCurrentUser && (
                        <Flex align="center" mb={2}>
                          <Avatar
                            size="sm"
                            name={msg.sender?.firstName}
                            src={msg.sender?.profilePicture || "https://i.pravatar.cc/150"}
                            mr={3}
                          />
                          <Text fontWeight="bold" fontSize="md">
                            {msg.sender?.firstName}
                          </Text>
                        </Flex>
                      )}
                      <Text fontSize="md" whiteSpace="pre-wrap">{msg.content}</Text>
                      <Text fontSize="sm" color="gray.500" textAlign="right" mt={2}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {isCurrentUser && isLastSeen && (
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Seen at {new Date(msg.readAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </MotionBox>
                  </Flex>
                );
              })}
              <div ref={messagesEndRef} />
            </VStack>
          )}
        </Box>


        <Flex mt={4}>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            flex={1}
            fontSize="lg"
            py={3}
          />
          <Button ml={2} colorScheme="blue" onClick={handleSendMessage} px={6} fontSize="lg">
            Send
          </Button>
        </Flex>
    
      {!isBlocked && (
  <Flex mt={4}> ... </Flex>
)}
{isBlocked && (
  <Text mt={4} fontSize="md" color="red.500">
    You have blocked this user. Unblock them to continue the conversation.
  </Text>
)}


      </Box>

      </Box>
    </Flex>
  );
};

export default MessagesPage;

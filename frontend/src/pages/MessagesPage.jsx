import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import searchIcon from "../assets/searchIcon.png";

const MessagesPage = () => {
  const { userId } = useParams();
  console.log("📢 Current userId from URL:", userId);

  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  const fetchConversations = async () => {
    try {
      console.log("🔄 Fetching conversations...");
      const response = await fetch("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include", // ✅ include cookie-ul
      });
      const data = await response.json();
      console.log("✅ Conversations fetched:", data);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log(`📢 Fetching messages for user: ${userId}`);

      const response = await fetch(`/api/messages/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include", // ✅ include cookie-ul
      });

      const data = await response.json();
      console.log("✅ Messages response:", data);

      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        console.error("❌ Error fetching messages:", data);
      }
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      console.log(`🔍 Searching for: ${search}`);
      const response = await fetch(`/api/users/search?query=${search}`, {
        credentials: "include", // ✅ include cookies dacă sunt folosite pentru auth
      });
      const data = await response.json();
      console.log("✅ Search results:", data);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("❌ Error searching users:", error);
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
        credentials: "include", // ✅ important dacă backend-ul se bazează pe cookie
        body: JSON.stringify({ receiverId: userId, content: newMessage }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data.data]);
        setNewMessage("");
        fetchConversations();
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  return (
    <Flex height="100vh">
      {/* Sidebar - Conversations List */}
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
            >
              <Avatar
                size="sm"
                name={conv.user.firstName}
                src={conv.user.profilePicture || "/default-avatar.png"} // ✅ Fix aici
              />
              <Text>{conv.user.firstName} {conv.user.lastName}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Chat Window */}
      <Box width="70%" p={5}>
        <Heading size="lg">Messages</Heading>
        <Box
          border="1px solid #ddd"
          borderRadius="md"
          p={4}
          mt={4}
          height="400px"
          overflowY="auto"
        >
          {loading ? (
            <Flex justify="center" align="center" height="100%">
              <Spinner size="lg" />
            </Flex>
          ) : messages.length === 0 ? (
            <Text>No messages yet.</Text>
          ) : (
            <VStack spacing={3} align="start">
              {messages.map((msg, index) => (
                <HStack
                  key={index}
                  alignSelf={msg.sender?._id === userId ? "flex-start" : "flex-end"}
                  bg={msg.sender?._id === userId ? "gray.200" : "blue.200"}
                  p={3}
                  borderRadius="md"
                >
                  <Avatar
                    size="sm"
                    name={msg.sender?.firstName || "User"}
                    src={msg.sender?.profilePicture || "/default-avatar.png"} // ✅ Fix avatar în mesaje
                  />
                  <Text>{msg.content}</Text>
                </HStack>
              ))}
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
          />
          <Button ml={2} colorScheme="blue" onClick={handleSendMessage}>
            Send
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default MessagesPage;

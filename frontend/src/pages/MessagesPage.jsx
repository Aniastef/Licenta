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
  useToast,
   Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Textarea, Select, useDisclosure,
  Spacer,
  Image
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import searchIcon from "../assets/searchIcon.png";
import attachIcon from "../assets/attach.png";
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
  const fileInputRef = useRef();

  const [isBlocked, setIsBlocked] = useState(false);
const { isOpen, onOpen, onClose } = useDisclosure();
const [reportReason, setReportReason] = useState("");
const [reportDetails, setReportDetails] = useState("");


  const currentUserId = currentUser?._id;
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const toast = useToast();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      setTimeout(() => { // 🔥 Așteaptă puțin
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 100); // 100ms e de obicei suficient
    }
  };
  
  
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);
  

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




const handleSelectUser = (user, e) => {
  if (e) {
  e.preventDefault();
  e.stopPropagation();
}
 // 👈 evită redirect implicit
  setSelectedUser(user);
  navigate(`/messages/${user._id}`);
  setSearch("");
  setSearchResults([]);
};


  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
  
    try {
      let attachmentsData = [];
if (selectedFiles.length > 0) {
  attachmentsData = await Promise.all(
    selectedFiles.map(async (file) => {
      let type;
      if (file.type.startsWith("image")) type = "image";
      else if (file.type.startsWith("video")) type = "video";
      else if (file.type.startsWith("audio")) type = "audio";
      else if (file.type === "application/pdf") type = "application";
      else type = "other";

      return {
        url: await toBase64(file),
        type,
      };
    })
  );
}

      
  
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          receiverId: userId,
          content: newMessage,
          attachments: attachmentsData,
        }),
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
        const completeMessage = {
          ...data.data,
          sender: currentUser,
        };
        setMessages([...messages, completeMessage]);
        setNewMessage("");
        setSelectedFiles([]);
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
  
const handleSubmitReport = async () => {
  if (!reportReason) {
    toast({ title: "Please select a reason", status: "warning" });
    return;
  }

  try {
    const response = await fetch("/api/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
      body: JSON.stringify({
        reportedUserId: userId,
        reason: reportReason,
        details: reportDetails,
      }),
    });

    if (!response.ok) throw new Error("Failed to send report");

    toast({ title: "Report submitted", status: "success" });
    setReportReason("");
    setReportDetails("");
    onClose();
  } catch (error) {
    toast({ title: error.message, status: "error" });
  }
};

  return (
    <Flex height="100vh">
      {/* Sidebar */}
      <Box  width="25%" p={4} borderRight="1px solid #ddd">
      <Heading size="md" mb={3}>Chats</Heading>

<Flex mb={3} align="center">
  <Input
    placeholder="Search users..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
    flex="1"
    borderRadius="full"
  />
  <Button ml={2} onClick={handleSearch} bg="transparent" _hover={{ bg: "gray.200" }}>
    <img src={searchIcon} alt="Search" width="20px" height="20px" />
  </Button>
</Flex>

{searchResults.length > 0 ? (
  <VStack mt={2} align="start" spacing={1} bg="gray.100" p={2} borderRadius="md">
    {searchResults.map((user) => (
      <HStack
        key={user._id}
        onClick={(e) => handleSelectUser(user, e)}
        p={2}
        borderRadius="md"
        width="100%"
        _hover={{ backgroundColor: "gray.200" }}
        cursor="pointer"
      >
<Avatar
  size="sm"
  name={`${user.firstName} ${user.lastName}`}
  src={user.profilePicture || undefined}
/>

        <Text>{user.firstName} {user.lastName}</Text>
      </HStack>
    ))}
  </VStack>
) : (
<Box mt={4} maxHeight="calc(100vh - 180px)" overflowY="auto">
<VStack align="start" spacing={2}>
      {conversations.map((conv) => (
        <HStack
          key={conv.user._id}
          p={3}
          borderRadius="md"
          width="100%"
          _hover={{ backgroundColor: "gray.100" }}
onClick={(e) => handleSelectUser(conv.user, e)}
          cursor="pointer"
          justify="space-between"
          align="flex-start"
        >
          <HStack align="flex-start">
          <Avatar
  size="sm"
  name={`${conv.user.firstName} ${conv.user.lastName}`}
  src={conv.user.profilePicture || undefined}
/>

            <Box>
              <Text fontWeight="bold">
                {conv.user.firstName} {conv.user.lastName}
              </Text>
              <Text fontSize="sm" color="gray.500" noOfLines={1} maxW="150px">
  {
    conv.lastMessage
      ? conv.lastMessage.content?.trim()
        ? conv.lastMessage.content
        : (conv.lastMessage.attachments && conv.lastMessage.attachments.length > 0 
          ? "Attachment sent."
          : "No messages yet.")
      : "No messages yet."
  }
</Text>


            </Box>
          </HStack>
          {conv.isUnread && (
            <Box w="10px" h="10px" borderRadius="full" bg="red.400" mt={1} />
          )}
        </HStack>
      ))}
    </VStack>
  </Box>
)}


      </Box>
  
      {/* Chat Window */}
      <Box width="70%" p={5}>
        {selectedUser ? (
          <>
            <VStack mb={4} align="start" spacing={3}>
            <HStack spacing={4} align="center" width="100%">
            <Avatar
  name={`${selectedUser.firstName} ${selectedUser.lastName}`}
  src={selectedUser.profilePicture || undefined}
  size="lg"
/>

  <Heading size="lg">
    {selectedUser.firstName} {selectedUser.lastName}
  </Heading>
  <Spacer /> {/* 🔥 Mută butoanele în dreapta */}
  {selectedUser && currentUser && (
    <HStack spacing={2}>
      <Button colorScheme="red" variant="outline" onClick={onOpen}>
  Report User
</Button>

      <Button
        colorScheme={isBlocked ? "green" : "red"}
        onClick={handleToggleBlock}
      >
        {isBlocked ? "Unblock User" : "Block User"}
      </Button>
    </HStack>
  )}
</HStack>

            </VStack>
  
            <Box
                ref={messagesContainerRef} // 👈 aici
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
                  const isCurrentUser = String(msg.sender?._id) === String(currentUser?._id);
              
                  // 🔥 Determină dacă e prima dată când apare această zi
                  const currentDate = new Date(msg.timestamp).toDateString();
                  const prevDate = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;
                  const showDate = currentDate !== prevDate;
              
                  const lastSeen = getLastSeenMessage();
                  const isLastSeen = lastSeen && lastSeen._id === msg._id;
              
                  return (
                    <React.Fragment key={index}>
                      {showDate && (
                        <Flex justify="center" my={2}>
                          <Text fontSize="sm" color="gray.500">
                            {currentDate}
                          </Text>
                        </Flex>
                      )}
             <Flex
  direction="column"
  align={isCurrentUser ? "flex-end" : "flex-start"}
  mb={2}
>
  <Flex align="flex-end" gap={2}>
    {!isCurrentUser && ( // Avatar pentru alt user
     <Avatar
     size="sm"
     name={`${msg.sender?.firstName || ""} ${msg.sender?.lastName || ""}`}
     src={msg.sender?.profilePicture || undefined}
   />
   
    )}
    {isCurrentUser && ( // 🔥 Ora în stânga pentru mesajele portocalii
      <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
        {new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    )}
    <MotionBox
      bg={isCurrentUser ? "orange.200" : "green.200"}
      px={6}
      py={4}
      fontSize="lg"
      borderRadius="2xl"
      maxWidth="80%"
      wordBreak="break-word"
      boxShadow="md"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isCurrentUser && (
        <Text fontWeight="bold" fontSize="md" mb={1}>
          {msg.sender?.firstName}
        </Text>
      )}
{msg.content && (
  <Text fontSize="md" whiteSpace="pre-wrap">{msg.content}</Text>
)}

{msg.attachments && msg.attachments.map((att, idx) => {
 if (att.type === "image") return (
  <Image 
    key={idx} 
    src={att.url} 
    maxW="300px" 
    maxH="300px" 
    minW="150px"
    minH="150px"
    borderRadius="md" 
    objectFit="contain" 
  />
);

  if (att.type === "video") return <video key={idx} src={att.url} controls style={{ maxWidth: "300px" }} />;
  if (att.type === "audio") return <audio key={idx} src={att.url} controls />;
  return <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer">Download File</a>;
})}
    </MotionBox>
    {!isCurrentUser && ( // 🔥 Ora în dreapta pentru mesajele verzi
      <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
        {new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    )}
  </Flex>

  {/* 🔥 Seen sub mesaj, aliniat cu bubble-ul */}
  {isCurrentUser && isLastSeen && (
    <Flex justify="flex-start" mt={1} pr={6}>
      <Text fontSize="xs" color="gray.500">
        Seen at {new Date(msg.readAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Flex>
  )}
</Flex>

                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </VStack>
              
              )}
            </Box>

            {!isBlocked ? (
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
                <Flex align="center" gap={2} >
                <Button 
  variant="ghost" 
  onClick={() => fileInputRef.current.click()}
>
  <Image src={attachIcon} alt="Attach" boxSize="25px" />
</Button>
<Input
  type="file"
  ref={fileInputRef}
  multiple
  display="none"
  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
/>

</Flex>


                <Button ml={2} colorScheme="blue" onClick={handleSendMessage} px={6} fontSize="lg">
                  Send
                </Button>
              </Flex>
            ) : (
              <Text mt={4} fontSize="md" color="red.500">
                You have blocked this user. Unblock them to continue the conversation.
              </Text>
            )}
          </>
        ) : (
          <Heading size="lg" mb={2}>Messages</Heading>
        )}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Report {selectedUser?.firstName}</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <Select
        placeholder="Select a reason"
        value={reportReason}
        onChange={(e) => setReportReason(e.target.value)}
        mb={3}
      >
        <option value="harassment">Harassment</option>
        <option value="spam">Spam or advertising</option>
        <option value="inappropriate">Inappropriate content</option>
        <option value="impersonation">Impersonation</option>
        <option value="other">Other</option>
      </Select>
      <Textarea
        placeholder="Additional details (optional)"
        value={reportDetails}
        onChange={(e) => setReportDetails(e.target.value)}
        rows={4}
      />
    </ModalBody>
    <ModalFooter>
      <Button onClick={onClose} mr={3}>Cancel</Button>
      <Button colorScheme="red" onClick={handleSubmitReport}>
        Submit Report
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

    </Flex>
  );
}
  

export default MessagesPage;

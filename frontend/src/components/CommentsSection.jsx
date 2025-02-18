import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import RectangleShape from "../assets/rectangleShape";
import { Link } from "react-router-dom";


export default function CommentsSection({ resourceId, resourceType }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState({});
  const [user] = useRecoilState(userAtom); // Obține utilizatorul logat
  const showToast = useShowToast();

  // Fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments?resourceId=${resourceId}&resourceType=${resourceType}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
  
      const data = await res.json();
  
      // ✅ Asigură-te că preluăm doar comentariile principale
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  useEffect(() => {
    if (resourceId && resourceType) fetchComments();
  }, [resourceId, resourceType]);
  

  const handleDislikeAndUndislike = async (commentId) => {
    if (!user) {
      showToast("Error", "You must be logged in to dislike or undislike a comment", "error");
      return;
    }
  
    try {
      const res = await fetch(`/api/comments/${commentId}/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include autentificarea
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        showToast("Error", data.message || "Failed to dislike/undislike the comment", "error");
        return;
      }
  
      // Actualizăm starea locală a comentariilor
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                likes: Array.isArray(comment.likes) ? data.likes : comment.likes,
                dislikes: Array.isArray(comment.dislikes) ? data.dislikes : comment.dislikes,
              }
            : comment
        )
      );
  
      showToast("Success", data.message, "success");
    } catch (err) {
      console.error("Error in dislike/undislike:", err.message);
      showToast("Error", "Failed to process your request", "error");
    }
  };
  const handleLikeAndUnlike = async (commentId) => {
    if (!user) {
      showToast("Error", "You must be logged in to like or unlike a comment", "error");
      return;
    }
  
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        showToast("Error", data.message || "Failed to like/unlike the comment", "error");
        return;
      }
  
      // Actualizăm starea locală a comentariilor
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                likes: Array.isArray(comment.likes) ? data.likes : comment.likes,
                dislikes: Array.isArray(comment.dislikes) ? data.dislikes : comment.dislikes,
              }
            : comment
        )
      );
  
      showToast("Success", data.message, "success");
    } catch (err) {
      console.error("Error in like/unlike:", err.message);
      showToast("Error", "Failed to process your request", "error");
    }
  };
  

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
  
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          userId: user._id,
          resourceId,
          resourceType, // Utilizează resourceType din props
        }),
        credentials: "include",
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to add comment:", errorData.message);
        return;
      }
  
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err.message);
    }
  };
  
  // Add reply
  const handleAddReply = async (parentId) => {
    if (!replyContent[parentId]?.trim() || !user) return;

    try {
      const res = await fetch(`/api/comments/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent[parentId],
          parentId,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to add reply:", errorData.message);
        return;
      }

      const data = await res.json();
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === parentId
            ? { ...comment, replies: [...(comment.replies || []), data.reply] }
            : comment
        )
      );
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
    } catch (err) {
      console.error("Error adding reply:", err.message);
    }
  };

  useEffect(() => {
    if (resourceId) fetchComments();
  }, [resourceId]);

  return (
    <Flex direction="column" mt={8}>
      <RectangleShape
        bgColor="blue.300" // Culoare galbenă
        title="Comments"
        minW="500px"
        maxW="500px"
        textAlign="left"
        zIndex="1" // Apare sub galben

      />
      <Flex direction="column" spacing={4}>
        {isLoading ? (
          <Text>Loading comments...</Text>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Box
              key={comment._id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={useColorModeValue("gray.50", "gray.800")}
            >
              {/* Profil utilizator */}
              <Flex align="center" mb={3}>
                <Link to={`/profile/${comment.userId?.username}`}>
                  <Avatar src={comment.userId?.profilePicture} size="sm" cursor="pointer" />
                </Link>
                <Link to={`/profile/${comment.userId?.username}`}>
                  <Text ml={2} fontWeight="bold" cursor="pointer">
                    {comment.userId?.username || "Unknown User"}
                  </Text>
                </Link>
                <Text ml="auto" fontSize="sm" color="gray.500">
                  {comment.createdAtFormatted || "N/A"}
                </Text>
              </Flex>



              {/* Conținut comentariu */}
              <Text>{comment.content}</Text>

              {/* Likes și dislikes */}
              <HStack mt={2}>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => handleLikeAndUnlike(comment._id)}
                >
                  👍 {Array.isArray(comment.likes) ? comment.likes.length : 0}
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDislikeAndUndislike(comment._id)}
                >
                  👎 {Array.isArray(comment.dislikes) ? comment.dislikes.length : 0}
                </Button>
              </HStack>

              {/* Răspunsuri */}
              <Stack mt={4} spacing={3}>
                {comment.replies?.map((reply) => (
                  <Box
                    key={reply._id}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    bg={useColorModeValue("gray.100", "gray.700")}
                  >
                    <Flex align="center" mb={2}>
                      <Link to={`/profile/${reply.userId?.username}`}>
                        <Avatar src={reply.userId?.profilePicture} size="xs" cursor="pointer" />
                      </Link>
                      <Link to={`/profile/${reply.userId?.username}`}>
                        <Text ml={2} fontWeight="bold" cursor="pointer">
                          {reply.userId?.username || "Unknown User"}
                        </Text>
                      </Link>
                      <Text ml="auto" fontSize="sm" color="gray.500">
                        {reply.createdAtFormatted || "N/A"}
                      </Text>
                    </Flex>

                    <Text>{reply.content}</Text>
                  </Box>
                ))}
                {user && (
                  <>
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent[comment._id] || ""}
                      onChange={(e) =>
                        setReplyContent((prev) => ({
                          ...prev,
                          [comment._id]: e.target.value,
                        }))
                      }
                      rows={2}
                    />
                    <Button
                      size="sm"
                      mt={2}
                      colorScheme="blue"
                      onClick={() => handleAddReply(comment._id)}
                      isDisabled={!replyContent[comment._id]?.trim()}
                    >
                      Reply
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          ))
        ) : (
          <Text color="gray.500">No comments yet.</Text>
        )}
      </Flex>

      {user ? (
        <Box mt={4}>
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button
            mt={2}
            colorScheme="purple"
            onClick={handleAddComment}
            isDisabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      ) : (
        <Text color="gray.500">You must be logged in to add a comment.</Text>
      )}
    </Flex>
  );
}

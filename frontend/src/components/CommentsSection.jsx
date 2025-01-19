import {
    Box,
    Button,
    Flex,
    Stack,
    Text,
    Textarea,
    useColorModeValue,
    HStack,
  } from '@chakra-ui/react';
  import { useState, useEffect } from 'react';
  import { useRecoilState } from 'recoil';
  import userAtom from '../atoms/userAtom';
  import useShowToast from '../hooks/useShowToast';
  import RectangleShape
   from '../assets/rectangleShape';
  export default function CommentsSection({ resourceId }) {
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
        const res = await fetch(`/api/comments?resourceId=${resourceId}&resourceType=Product`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
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
            resourceType: "Product",
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
        setComments((prev) =>
          prev.map((comment) =>
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
  
    const handleLikeAndUnlike = async (commentId) => {
        if (!user) {
          showToast("Error", "You must be logged in to like or unlike a comment", "error");
          return;
        }
      
        try {
          const res = await fetch(`/api/comments/${commentId}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Include autentificarea
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
                    likes: Array.isArray(comment.likes)
                      ? data.likes
                      : comment.likes,
                    dislikes: Array.isArray(comment.dislikes)
                      ? data.dislikes
                      : comment.dislikes,
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
                    likes: Array.isArray(comment.likes)
                      ? data.likes
                      : comment.likes,
                    dislikes: Array.isArray(comment.dislikes)
                      ? data.dislikes
                      : comment.dislikes,
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
  
    useEffect(() => {
      if (resourceId) fetchComments();
    }, [resourceId]);
  
    return (
      <Flex direction="column"mt={8}>
        <RectangleShape
        bgColor="#62cbe0" // Culoare albastră
        title="Explore our community and our various artists!"
        maxW="300px"
        textAlign="left"
        left="-2"
      />
        <Flex spacing={4}>
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
                <Text>{comment.content}</Text>
  
                {/* Likes and Dislikes */}
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





  
                {/* Replies */}
                <Stack mt={4} spacing={3}>
                  {comment.replies?.map((reply, index) => (
                    <Box
                      key={index}
                      p={3}
                      borderWidth={1}
                      borderRadius="md"
                      bg={useColorModeValue("gray.100", "gray.700")}
                    >
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
  
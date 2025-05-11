import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Textarea,
  Image,
  Avatar,
  Collapse,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import likeIcon from "../assets/like.svg";
import dislikeIcon from "../assets/dislike.svg";



// ... importurile tale rămân la fel

export default function CommentsSection({ resourceId, resourceType }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [user] = useRecoilState(userAtom);
  const showToast = useShowToast();
  const [expandedComments, setExpandedComments] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const charCount = (text) => text.length;
  const [isLoading, setIsLoading] = useState(true);


  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments?resourceId=${resourceId}&resourceType=${resourceType}`, {
        credentials: "include", // ✅ Adăugat
      });
            if (!res.ok) throw new Error("Failed to fetch comments");
  
      const data = await res.json();
  
      // ✅ Asigură-te că preluăm doar comentariile principale
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
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
                likes: data.likes,
                dislikes: data.dislikes,

              }
            : comment
        )
      );
  
      showToast("Success", data.message, "success");

      await fetchComments();

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

      await fetchComments();

    } catch (err) {
      console.error("Error in like/unlike:", err.message);
      showToast("Error", "Failed to process your request", "error");
    }
  };
  

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
  
  const toggleExpand = (commentId) => { setExpandedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] })); };
  const toggleReplies = (commentId) => { setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] })); };

  return (
    <Flex direction="column" ml={100} gap={6}>
      {/* Header-ul tău cu buline */}
      <Flex direction="row" align="center" justifyContent="space-between">
        <Text fontWeight="bold" width="100px" borderBottom="2px solid gray" pb={1}>Comments</Text>
        <Flex gap={2}>
          <Box boxSize={6} bg="green.600" borderRadius="full" />
          <Box boxSize={6} bg="gray.800" borderRadius="full" />
        </Flex>
      </Flex>

      {comments.map((comment) => (
        <Box maxW="1300px" p={3} borderWidth="1px" borderRadius="md" key={comment._id}>
          <Flex align="flex-start" gap={3}>
            {/* Avatar și user info */}
            <Flex gap={2} direction="column" align="center" justify="center" mr={5}>
              <Avatar src={comment.userId?.profilePicture} size="lg" />
              <Text fontSize="sm" color="gray.600">@{comment.userId?.username}</Text>
            </Flex>
            {/* Content */}
            <Box w="100%">
              <Text fontWeight="bold">{comment.userId?.firstName} {comment.userId?.lastName}</Text>
              {charCount(comment.content) > 400 ? (
                <>
                  <Collapse startingHeight={50} in={expandedComments[comment._id]}>
                    <Text lineHeight="1.7" whiteSpace="pre-wrap" wordBreak="break-word" overflowWrap="anywhere" mt={1}>
                      {comment.content}
                    </Text>
                  </Collapse>
                  <ChakraLink fontSize="sm" color="blue.500" onClick={() => toggleExpand(comment._id)}>
                    {expandedComments[comment._id] ? "see less" : "see more"}
                  </ChakraLink>
                </>
              ) : (
                <Text lineHeight="1.7" whiteSpace="pre-wrap" wordBreak="break-word" overflowWrap="anywhere" mt={1}>
                  {comment.content}
                </Text>
              )}

              {/* Likes/Dislikes */}
              <HStack mt={2}>
  <Button
    size="sm"
    variant="ghost"
    onClick={() => handleLikeAndUnlike(comment._id)}
    leftIcon={<Image src={likeIcon} w="16px" h="16px" />}
  >
    {Array.isArray(comment.likes) ? comment.likes.length : 0}
  </Button>
  <Button
    size="sm"
    variant="ghost"
    onClick={() => handleDislikeAndUndislike(comment._id)}
    leftIcon={<Image src={dislikeIcon} w="16px" h="16px" />}
  >
    {Array.isArray(comment.dislikes) ? comment.dislikes.length : 0}
  </Button>

  {/* 🔥 Aici adaugi butonul de Reply */}
  <Button
    size="sm"
    variant="ghost"
    onClick={() =>
      activeReplyBox === comment._id
        ? setActiveReplyBox(null)
        : setActiveReplyBox(comment._id)
    }
  >
    Reply
  </Button>

  {/* 🔥 Aici adaugi butonul de Show/Hide Replies */}
  {comment.replies?.length > 0 && (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => toggleReplies(comment._id)}
    >
      {showReplies[comment._id] ? "Hide replies" : `Show replies (${comment.replies.length})`}
    </Button>
  )}
</HStack>




              {/* Replies */}
              {showReplies[comment._id] && (
                <Flex direction="column" mt={3} pl={10} gap={3}>
                  {comment.replies?.map((reply) => (
                    <Flex key={reply._id} align="flex-start" gap={3}>
                      <Avatar src={reply.userId?.profilePicture} size="sm" />
                      <Box>
                        <Text fontWeight="bold">{reply.userId?.firstName} {reply.userId?.lastName}</Text>
                        <Text fontSize="sm" color="gray.600">@{reply.userId?.username}</Text>
                        <Text lineHeight="1.7" whiteSpace="pre-wrap" wordBreak="break-word" overflowWrap="anywhere" mt={1}>
                          {reply.content}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </Flex>
              )}
              {/* Reply box */}
              {user && activeReplyBox === comment._id && (
                <Collapse in={activeReplyBox === comment._id} animateOpacity>
                  <Flex direction="column" mt={3} pl={10} gap={2}>
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent[comment._id] || ""}
                      onChange={(e) => setReplyContent((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                      rows={2}
                      size="sm"
                    />
                    <Button size="xs" onClick={() => { handleAddReply(comment._id); setActiveReplyBox(null); }}>
                      Send
                    </Button>
                  </Flex>
                </Collapse>
              )}
            </Box>
          </Flex>
        </Box>
      ))}
      {/* Add comment */}
      {user && (
        <Box mt={4}>
          <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} />
          <Button mt={2} colorScheme="gray" onClick={handleAddComment} isDisabled={!newComment.trim()}>
            Add Comment
          </Button>
        </Box>
      )}
    </Flex>
  );
}
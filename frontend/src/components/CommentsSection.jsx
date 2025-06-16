// CommentsSection.jsx
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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import likeIcon from '../assets/like.svg';
import dislikeIcon from '../assets/dislike.svg';
import { Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Select,
  useDisclosure,
} from '@chakra-ui/react';

// ... importurile tale rămân la fel

export default function CommentsSection({ resourceId, resourceType }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [user] = useRecoilState(userAtom);
  const showToast = useShowToast();
  const [expandedComments, setExpandedComments] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const charCount = (text) => text.length;
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [commentToReport, setCommentToReport] = useState(null);

// CommentsSection.jsx - inside handleSubmitReport
  const handleSubmitReport = async () => {
    if (!reportReason || !commentToReport) {
      showToast('Error', 'Please select a reason', 'warning');
      return;
    }

    const reportedUserId = typeof commentToReport.userId === 'object' && commentToReport.userId !== null
      ? commentToReport.userId._id
      : commentToReport.userId;

    // --- ADD THIS CONSOLE.LOG ---
    console.log("Reporting comment with reportedUserId:", reportedUserId);
    console.log("Full commentToReport:", commentToReport);
    // ----------------------------

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reportedUserId: reportedUserId,
          reason: reportReason,
          details: `Reported comment: "${commentToReport.content}"\n\nDetails: ${reportDetails}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to get more specific error from server
        console.error("Server error response:", errorData);
        throw new Error(errorData.error || 'Failed to submit report');
      }

      showToast('Success', 'Report submitted', 'success');
      setReportReason('');
      setReportDetails('');
      setCommentToReport(null);
      onClose();
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  };
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/comments?resourceId=${resourceId}&resourceType=${resourceType}`,
        {
          credentials: 'include',
        },
      );
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId && resourceType) fetchComments();
  }, [resourceId, resourceType]);

  const handleDislikeAndUndislike = async (commentId) => {
    if (!user) {
      showToast('Error', 'You must be logged in to dislike or undislike a comment', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/dislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include autentificarea
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('Error', data.message || 'Failed to dislike/undislike the comment', 'error');
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
            : comment,
        ),
      );

      showToast('Success', data.message, 'success');

      await fetchComments();
    } catch (err) {
      console.error('Error in dislike/undislike:', err.message);
      showToast('Error', 'Failed to process your request', 'error');
    }
  };

  const handleLikeAndUnlike = async (commentId) => {
    if (!user) {
      showToast('Error', 'You must be logged in to like or unlike a comment', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('Error', data.message || 'Failed to like/unlike the comment', 'error');
        return;
      }

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                likes: Array.isArray(comment.likes) ? data.likes : comment.likes,
                dislikes: Array.isArray(comment.dislikes) ? data.dislikes : comment.dislikes,
              }
            : comment,
        ),
      );

      showToast('Success', data.message, 'success');

      await fetchComments();
    } catch (err) {
      console.error('Error in like/unlike:', err.message);
      showToast('Error', 'Failed to process your request', 'error');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const res = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          userId: user._id,
          resourceId,
          resourceType,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to add comment:', errorData.message);
        return;
      }

      setNewComment('');
      await fetchComments(); // 🔥 Soluția cheie: reîncarcă comentariile complet populate
    } catch (err) {
      console.error('Error adding comment:', err.message);
    }
  };

  const handleAddReply = async (parentId) => {
    if (!replyContent[parentId]?.trim() || !user) return;

    try {
      const res = await fetch(`/api/comments/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent[parentId],
          parentId,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to add reply:', errorData.message);
        return;
      }

      const data = await res.json();
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === parentId
            ? { ...comment, replies: [...(comment.replies || []), data.reply] }
            : comment,
        ),
      );
      setReplyContent((prev) => ({ ...prev, [parentId]: '' }));
    } catch (err) {
      console.error('Error adding reply:', err.message);
    }
  };

  useEffect(() => {
    if (resourceId) fetchComments();
  }, [resourceId]);

  const toggleExpand = (commentId) => {
    setExpandedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };
  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <Flex direction="column" ml={100} gap={6}>
      {}
      <Flex direction="row" align="center" justifyContent="space-between">
        <Text fontWeight="bold" width="100px" borderBottom="2px solid gray" pb={1}>
          Comments
        </Text>
        <Flex gap={2}>
          <Box boxSize={6} bg="green.600" borderRadius="full" />
          <Box boxSize={6} bg="gray.800" borderRadius="full" />
        </Flex>
      </Flex>

      {comments.map((comment) => (
        <Box maxW="1300px" p={3} borderWidth="1px" borderRadius="md" key={comment._id}>
          <Flex align="flex-start" gap={3}>
            <Flex gap={2} direction="column" align="center" justify="center" mr={5}>
              <Avatar src={comment.userId?.profilePicture} size="lg" />
              <Text fontSize="sm" color="gray.600">
                @{comment.userId?.username}
              </Text>
            </Flex>
            <Box w="100%">
              <Text fontWeight="bold">
                {comment.userId?.firstName} {comment.userId?.lastName}
              </Text>
              {charCount(comment.content) > 400 ? (
                <>
                  <Collapse startingHeight={50} in={expandedComments[comment._id]}>
                    <Text
                      lineHeight="1.7"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      overflowWrap="anywhere"
                      mt={1}
                    >
                      {comment.content}
                    </Text>
                  </Collapse>
                  <ChakraLink
                    fontSize="sm"
                    color="blue.500"
                    onClick={() => toggleExpand(comment._id)}
                  >
                    {expandedComments[comment._id] ? 'see less' : 'see more'}
                  </ChakraLink>
                </>
              ) : (
                <Text
                  lineHeight="1.7"
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                  overflowWrap="anywhere"
                  mt={1}
                >
                  {comment.content}
                </Text>
              )}

              {}
              <HStack mt={2}>
                {user && (
                  <>
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
                  </>
                )}

                {}
                {user && (
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
                )}

                {user && (comment.userId?._id === user._id || user.role === 'admin') && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={async () => {
                      const confirm = window.confirm(
                        'Are you sure you want to delete this comment?',
                      );
                      if (!confirm) return;

                      try {
                        const res = await fetch(`/api/comments/${comment._id}`, {
                          method: 'DELETE',
                          credentials: 'include',
                        });

                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Failed to delete');

                        showToast('Success', data.message, 'success');
                        await fetchComments();
                      } catch (err) {
                        showToast('Error', err.message, 'error');
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}

                {}
                {comment.replies?.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => toggleReplies(comment._id)}>
                    {showReplies[comment._id]
                      ? 'Hide replies'
                      : `Show replies (${comment.replies.length})`}
                  </Button>
                )}
                {user && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setCommentToReport(comment);
                      onOpen();
                    }}
                  >
                    Report
                  </Button>
                )}
              </HStack>

              {}
              {showReplies[comment._id] && (
                <Flex direction="column" mt={3} pl={10} gap={3}>
                  {comment.replies?.map((reply) => (
                    <Flex key={reply._id} align="flex-start" gap={3}>
                      <Avatar src={reply.userId?.profilePicture} size="sm" />
                      <Box>
                        <Text fontWeight="bold">
                          {reply.userId?.firstName} {reply.userId?.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          @{reply.userId?.username}
                        </Text>
                        <Text
                          lineHeight="1.7"
                          whiteSpace="pre-wrap"
                          wordBreak="break-word"
                          overflowWrap="anywhere"
                          mt={1}
                        >
                          {reply.content}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </Flex>
              )}
              {}
              {user && activeReplyBox === comment._id && (
                <Collapse in={activeReplyBox === comment._id} animateOpacity>
                  <Flex direction="column" mt={3} pl={10} gap={2}>
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent[comment._id] || ''}
                      onChange={(e) =>
                        setReplyContent((prev) => ({ ...prev, [comment._id]: e.target.value }))
                      }
                      rows={2}
                      size="sm"
                    />
                    <Button
                      size="xs"
                      onClick={() => {
                        handleAddReply(comment._id);
                        setActiveReplyBox(null);
                      }}
                    >
                      Send
                    </Button>
                  </Flex>
                </Collapse>
              )}
            </Box>
          </Flex>
        </Box>
      ))}
      {}
      {user && (
        <Box mt={4}>
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button
            mt={2}
            colorScheme="gray"
            onClick={handleAddComment}
            isDisabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Comment</ModalHeader>
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
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleSubmitReport}>
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
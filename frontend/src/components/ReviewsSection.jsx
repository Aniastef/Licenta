// components/ReviewsSection.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Textarea,
  HStack,
  Avatar,
  Collapse,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link } from "react-router-dom";

export default function ReviewsSection({ productId }) {
  const user = useRecoilValue(userAtom);
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [userReview, setUserReview] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(data);

      if (user) {
        const own = data.find((r) => r.userId?._id === user._id);
        if (own) {
          setUserReview(own);
          setRating(own.rating);
          setContent(own.content);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, rating, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      toast({ title: data.message, status: "success", duration: 2000 });
      setContent("");
      fetchReviews();
    } catch (err) {
      toast({ title: "Error", description: err.message, status: "error" });
    }
  };

  const toggleExpand = (reviewId) => {
    setExpandedReviews((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  return (
    <Flex direction="column" ml={100} gap={6}>
      <Flex direction="row" align="center" justifyContent="space-between">
        <Text fontWeight="bold" width="100px" borderBottom="2px solid gray" pb={1}>
          Reviews
        </Text>
        <Flex gap={2}>
          <Box boxSize={6} bg="yellow.400" borderRadius="full" />
          <Box boxSize={6} bg="gray.800" borderRadius="full" />
        </Flex>
      </Flex>

      {reviews.length > 0 ? (
        reviews.map((review) => (
          <Box maxW="1300px" p={3} borderWidth="1px" borderRadius="md" bg="gray.50" key={review._id}>
            <Flex align="flex-start" gap={3}>
              <Flex gap={2} direction="column" align="center" justify="center" mr={5}>
                <Link to={`/profile/${review.userId?.username}`}>
                  <Avatar src={review.userId?.profilePicture} size="lg" cursor="pointer" />
                </Link>
                <Text fontSize="sm" color="gray.600">@{review.userId?.username}</Text>
              </Flex>
              <Box w="100%">
                <Text fontWeight="bold">{review.userId?.firstName} {review.userId?.lastName}</Text>
                <Text color="yellow.500" fontWeight="semibold">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </Text>
                {review.content && (
                  <>
                    <Collapse startingHeight={50} in={expandedReviews[review._id]}>
                      <Text lineHeight="1.7" whiteSpace="pre-wrap" wordBreak="break-word" overflowWrap="anywhere" mt={1}>
                        {review.content}
                      </Text>
                    </Collapse>
                    {review.content.length > 400 && (
                      <ChakraLink fontSize="sm" color="blue.500" onClick={() => toggleExpand(review._id)}>
                        {expandedReviews[review._id] ? "see less" : "see more"}
                      </ChakraLink>
                    )}
                  </>
                )}
              </Box>
            </Flex>
          </Box>
         ))
        ) : null}
   

      {user && (
        <Box >
          <Text fontWeight="bold" mb={2}>
            {userReview ? "Update your review" : "Leave a review"}
          </Text>
          <HStack mb={2}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                size="sm"
                onClick={() => setRating(star)}
                colorScheme={star <= rating ? "yellow" : "gray"}
                variant={star <= rating ? "solid" : "outline"}
              >
                {star}★
              </Button>
            ))}
          </HStack>
          <Textarea
            placeholder="Write something... (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button mt={2} colorScheme="blue" onClick={handleSubmit}>
            {userReview ? "Update Review" : "Submit Review"}
          </Button>
        </Box>
      )}
    </Flex>
  );
} 

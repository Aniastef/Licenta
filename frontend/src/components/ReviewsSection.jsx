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
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import RectangleShape from "../assets/rectangleShape";
import { Link } from "react-router-dom";

export default function ReviewsSection({ productId }) {
  const user = useRecoilValue(userAtom);
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [userReview, setUserReview] = useState(null);

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

  return (
    <Box mt={10}>
      <RectangleShape
        bgColor="yellow.300"
        title="Reviews"
        minW="500px"
        maxW="500px"
        textAlign="left"
      />

      {reviews.length > 0 ? (
        reviews.map((review) => (
          <Box
            key={review._id}
            p={4}
            mt={3}
            borderWidth={1}
            borderRadius="md"
            bg="gray.50"
          >
            <Flex align="center" mb={2} gap={3}>
              <Link to={`/profile/${review.userId?.username}`}>
                <Avatar
                  src={review.userId?.profilePicture}
                  name={review.userId?.username}
                  size="sm"
                  cursor="pointer"
                />
              </Link>
              <Text fontWeight="bold">{review.userId?.username}</Text>
              <Text color="yellow.500" fontWeight="semibold">
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </Text>
            </Flex>
            {review.content && <Text>{review.content}</Text>}
          </Box>
        ))
      ) : (
        <Text mt={4} color="gray.500">
          No reviews yet.
        </Text>
      )}

      {user && (
        <Box mt={6}>
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
    </Box>
  );
}

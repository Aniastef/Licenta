import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Flex, Heading, Text, Image, Select, Input, Spinner, VStack } from "@chakra-ui/react";
import GalleryCard from "../components/GalleryCard";
import CommentsSection from "../components/CommentsSection";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

export default function GalleryPage() {
  const { username, galleryName } = useParams();
  const [gallery, setGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const [filterText, setFilterText] = useState('');
  const currentUser = useRecoilValue(userAtom);

  const fetchGallery = async () => {
    try {
      if (galleryName === "all-products") {
        const response = await fetch(`/api/products/user/${username}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user's products");
        }
        const data = await response.json();
        setGallery({ name: `${username}'s Products`, products: data.products });
      } else {
        const response = await fetch(`/api/galleries/${username}/${galleryName}`);
        if (!response.ok) throw new Error("Failed to fetch gallery");
        const data = await response.json();
        setGallery(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  

  useEffect(() => {
    fetchGallery();
  }, [username, galleryName]);

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text>Error: {error}</Text>;
  if (!gallery) return <Text>Gallery not found.</Text>;

  return (
    <Flex direction="column">
      <GalleryCard gallery={gallery} currentUserId={currentUser._id} fetchGallery={fetchGallery} />
      <CommentsSection resourceId={gallery._id} resourceType="Gallery" />
    </Flex>
  );
}

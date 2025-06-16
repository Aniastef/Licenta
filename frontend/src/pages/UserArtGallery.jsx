import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Select,
  Input,
  Spinner,
  VStack,
  Divider,
} from '@chakra-ui/react';
import GalleryCard from '../components/GalleryCard';
import CommentsSection from '../components/CommentsSection';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

export default function GalleryPage() {
  const { galleryId } = useParams();
  const [gallery, setGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const [filterText, setFilterText] = useState('');
  const currentUser = useRecoilValue(userAtom);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch gallery');
      const data = await response.json();
      setGallery(data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('➡️ galleryId from params:', galleryId);
    fetchGallery();
  }, [galleryId]);

  if (isLoading) return <Spinner size="xl" />;
  if (error) return <Text>Error: {error}</Text>;
  if (!gallery) return <Text>Gallery not found.</Text>;

  return (
    <Flex direction="column">
      <GalleryCard gallery={gallery} currentUserId={currentUser?._id} fetchGallery={fetchGallery} />
      <Divider my={4} />

      <CommentsSection resourceId={gallery._id} resourceType="Gallery" />
      <Divider my={4} />
    </Flex>
  );
}

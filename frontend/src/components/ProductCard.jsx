import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  useToast,
  VStack,
  HStack,
  Input,
  useDisclosure,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Circle,
} from '@chakra-ui/react';
import { useCart } from './CartContext';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import { Link as RouterLink } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import WaveformPlayer from './WaveformPlayer';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useRef } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import writingBackground from '../assets/writing.svg';

const ProductCard = ({ product }) => {
  if (!product) return <Text>Loading product...</Text>;

  const { addToCart } = useCart();
  const user = useRecoilValue(userAtom);
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [visibleImages, setVisibleImages] = useState([0, 1, 2]);
  const [quantity, setQuantity] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isLongDescription = product?.description?.length > 300;
  const hasImageOrVideoOrWriting =
    (product.images?.length || 0) > 0 ||
    (product.videos?.length || 0) > 0 ||
    (Array.isArray(product.writing) && product.writing.length > 0) ||
    (typeof product.writing === 'string' && product.writing.trim());

  const onlyAudio = product.audios?.length > 0 && !hasImageOrVideoOrWriting;

  const { isOpen: isImageOpen, onOpen: openImage, onClose: closeImage } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);

  const imagesPerPage = 5;
  const scrollRef = useRef();
  const thumbnailContainerRef = useRef();
  const [thumbnailsToShow, setThumbnailsToShow] = useState([]);
  const [viewMode, setViewMode] = useState('image');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const modes = ['image', 'video', 'writing'];
  const otherModes = modes.filter((mode) => mode !== viewMode);

  useEffect(() => {
    if (!product || !product.images) return;

    const maxHeight = 500;
    const singleThumbnailHeight = 100;

    let totalHeight = 0;
    const visible = [];

    for (let i = currentIndex; i < product.images.length; i++) {
      totalHeight += singleThumbnailHeight;
      if (totalHeight > maxHeight) break;
      visible.push(i);
    }

    setVisibleImages(visible);
  }, [product, currentIndex]);

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!user?.username || !product?._id) return;

    const checkIfFavorite = async () => {
      try {
        const res = await fetch(`/api/users/favorites/${user.username}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setIsFavorite(data.some((favProduct) => favProduct._id === product._id));
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkIfFavorite();
  }, [user?.username, product?._id]);

  useEffect(() => {
    if (!product) return;

    if (product.images?.length > 0) {
      setViewMode('image');
    } else if (product.videos?.length > 0) {
      setViewMode('video');
    } else if (
      (Array.isArray(product.writing) &&
        product.writing.length > 0 &&
        product.writing[0]?.trim()) ||
      (typeof product.writing === 'string' && product.writing.trim())
    ) {
      setViewMode('writing');
    } else if (product.audios?.length > 0) {
      setViewMode('audio');
    }
  }, [product]);

  console.log('writing:', product?.writing);

  const handleAddToCart = () => {
    addToCart({
      product,
      quantity,
    });
    toast({
      title: 'Product added!',
      description: `${product.title} (x${quantity}) was added to your cart.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast({
          title: 'Product deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top-right',
        });
        window.location.href = `/profile/${user.username}`;
      } else {
        const data = await res.json();
        toast({
          title: 'Failed to delete product',
          description: data.error || 'Unknown error',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleAddToFavorites = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add favorites.',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      const res = await fetch(`/api/products/favorites/${product._id}`, {
        method: isFavorite ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);
        toast({
          title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
          description: `${product.title} was ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleThumbnailChange = (direction) => {
    const newIndex =
      direction === 'up'
        ? Math.max(currentIndex - 1, 0)
        : Math.min(currentIndex + 1, product.images.length - imagesPerPage);
    setCurrentIndex(newIndex);

    const newVisibleImages = [];
    for (let i = newIndex; i < newIndex + imagesPerPage; i++) {
      if (product.images[i]) newVisibleImages.push(i);
    }
    setVisibleImages(newVisibleImages);
  };

  if (!product) {
    return <Text>Loading product...</Text>;
  }

  return (
    <Flex align="center" mt={8} position="relative" maxW="1800px" mx="auto">
      {!product ? (
        <Text>Loading product details...</Text>
      ) : (
        <Flex align="flex-start" direction={'column'}>
          <Flex direction="row" align="flex-start" gap={4}>
            <Flex direction="column" align="center" gap={4}>
              <HStack spacing={4} ml={100}>
                {viewMode !== 'image' && product.images?.length > 0 && (
                  <Button colorScheme="green" size="md" onClick={() => setViewMode('image')}>
                    Switch to image
                  </Button>
                )}
                {viewMode !== 'video' && product.videos?.length > 0 && (
                  <Button colorScheme="yellow" size="md" onClick={() => setViewMode('video')}>
                    Switch to video
                  </Button>
                )}
                {viewMode !== 'writing' &&
                  ((typeof product.writing === 'string' && product.writing.trim()) ||
                    (Array.isArray(product.writing) && product.writing[0]?.trim())) && (
                    <Button colorScheme="purple" size="md" onClick={() => setViewMode('writing')}>
                      Switch to writing
                    </Button>
                  )}
              </HStack>

              <Flex direction="row" align="flex-start" gap={10} pl={4}>
                {}
                <VStack align="center" spacing={2}>
                  {(viewMode === 'image' && product.images?.length > 1) ||
                  (viewMode === 'video' && product.videos?.length > 1) ? (
                    <>
                      <Button
                        onClick={() => handleThumbnailChange('up')}
                        isDisabled={currentIndex === 0}
                        size="sm"
                      >
                        ↑
                      </Button>

                      <Box
                        maxH="500px"
                        overflow="hidden"
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-start"
                        alignItems="center"
                        gap={2}
                      >
                        {viewMode === 'image'
                          ? visibleImages.map((index) => (
                              <Image
                                key={index}
                                src={product.images[index]}
                                alt={`Thumbnail ${index + 1}`}
                                borderRadius="md"
                                objectFit="cover"
                                w="350px"
                                h="250px"
                                cursor="pointer"
                                onClick={() => setCurrentIndex(index)}
                                border={currentIndex === index ? '2px solid green' : 'none'}
                              />
                            ))
                          : product.videos?.map((url, i) => (
                              <Box
                                key={i}
                                as="video"
                                src={url}
                                onClick={() => setCurrentVideoIndex(i)}
                                muted
                                playsInline
                                preload="metadata"
                                controls={false}
                                cursor="pointer"
                                w="100px"
                                h="100px"
                                borderRadius="md"
                                objectFit="cover"
                                border={currentVideoIndex === i ? '2px solid green' : 'none'}
                              />
                            ))}
                      </Box>

                      <Button
                        onClick={() => handleThumbnailChange('down')}
                        isDisabled={currentIndex + visibleImages.length >= product.images.length}
                        size="sm"
                      >
                        ↓
                      </Button>
                    </>
                  ) : null}
                </VStack>

                {}
                <Flex justify="center">
                  {viewMode === 'writing' ? (
                    <Box w="700px" h="700px" position="relative">
                      <Image
                        src={writingBackground}
                        alt="writing paper"
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        zIndex={0}
                        pointerEvents="none"
                      />
                      <Box
                        position="absolute"
                        top="110"
                        left="0"
                        right="0"
                        bottom="10"
                        overflowY="auto"
                        px={50}
                        pt={10}
                        zIndex={1}
                      >
                        <Box
                          fontFamily="serif"
                          fontSize="lg"
                          color="black"
                          whiteSpace="pre-wrap"
                          lineHeight="1.8"
                          dangerouslySetInnerHTML={{
                            __html:
                              Array.isArray(product.writing) && product.writing.length > 0
                                ? product.writing[0]
                                : typeof product.writing === 'string'
                                  ? product.writing
                                  : '',
                          }}
                        />
                      </Box>
                    </Box>
                  ) : viewMode === 'image' ? (
                    <Box
                      w="600px"
                      h="600px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Image
                        src={product.images[currentIndex]}
                        alt="Main Product Image"
                        maxW="100%"
                        maxH="100%"
                        objectFit="contain"
                        cursor="zoom-in"
                        onClick={() => {
                          setSelectedImage(product.images[currentIndex]);
                          openImage();
                        }}
                      />
                    </Box>
                  ) : viewMode === 'video' ? (
                    <Box
                      w="800px"
                      h="600px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Box
                        as="video"
                        src={product.videos?.[currentVideoIndex]}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        maxW="100%"
                        maxH="100%"
                        objectFit="contain"
                        borderRadius="md"
                      />
                    </Box>
                  ) : viewMode === 'audio' && onlyAudio ? (
                    <Box
                      w="800px"
                      h="600px"
                      overflowY="auto"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box minW="300px" maxW="500px" p={2} borderRadius="md" boxShadow="md">
                        <VStack spacing={4}>
                          {product.audios.map((url, index) => (
                            <Box
                              key={index}
                              minW="300px"
                              maxW="500px"
                              p={2}
                              borderRadius="md"
                              boxShadow="md"
                            >
                              <WaveformPlayer url={url} />
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    </Box>
                  ) : null}
                </Flex>
              </Flex>
            </Flex>

            {}
            <Flex mt={5} direction="column" align="flex-start" justify="flex-start" ml={5}>
              <HStack justify="space-between" align="center" w="100%">
                <Text
                  fontWeight="bold"
                  fontSize="2xl"
                  maxW="800px"
                  whiteSpace="normal"
                  wordBreak="break-word"
                >
                  {product.title}
                </Text>
                {user && (
                  <Button
                    variant="ghost"
                    colorScheme={isFavorite ? 'red' : 'gray'}
                    onClick={handleAddToFavorites}
                    fontSize="sm"
                    leftIcon={
                      <Text fontSize="3xl">
                        {' '}
                        {}
                        {isFavorite ? '❤️' : '🤍'}
                      </Text>
                    }
                    _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                  ></Button>
                )}
              </HStack>

              {product.user?.username && (
                <Text mt={2}>
                  Created by{' '}
                  <RouterLink
                    to={`/profile/${product.user.username}`}
                    style={{ color: '#3182ce', textDecoration: 'underline' }}
                  >
                    {product.user.firstName || 'Unknown'} {product.user.lastName || 'User'}
                  </RouterLink>
                </Text>
              )}

              {}
              {product.category?.length > 0 && (
                <Text mt={1} color="gray.600">
                  Category:{' '}
                  <b>
                    {Array.isArray(product.category)
                      ? product.category.map((cat, index) => (
                          <React.Fragment key={cat}>
                            {cat}
                            {index < product.category.length - 1 && ', '}
                          </React.Fragment>
                        ))
                      : product.category}
                  </b>
                </Text>
              )}

              {product.galleries?.length > 0 && (
                <Box mt={2}>
                  <Text fontWeight="bold">Part of galleries:</Text>
                  <HStack spacing={2} wrap="wrap">
                    {product.galleries.map((galleryWrapper) =>
                      galleryWrapper.gallery ? (
                        <RouterLink
                          key={galleryWrapper.gallery._id}
                          to={`/galleries/${galleryWrapper.gallery._id}`}
                          style={{ color: '#3182ce', textDecoration: 'underline' }}
                        >
                          {galleryWrapper.gallery.name} {}
                        </RouterLink>
                      ) : null,
                    )}
                  </HStack>
                </Box>
              )}

              <Text
                mt={2}
                color={
                  product.forSale ? (product.quantity > 0 ? 'green.500' : 'red.500') : 'gray.500'
                }
              >
                {!product.forSale
                  ? 'Not for sale'
                  : product.quantity > 0
                    ? `Stock: ${product.quantity} left`
                    : 'Out of stock'}
              </Text>
              {product.forSale && typeof product.price === 'number' && (
                <Text mt={1} color="green.600" fontWeight="bold" fontSize="lg">
                  Price: €{product.price.toFixed(2)}
                </Text>
              )}

              {product.user?._id && user?._id && product.user._id === user._id ? (
                <>
                  <Button
                    mt={2}
                    as={RouterLink}
                    to={`/update/product/${product._id}`}
                    bg="orange"
                    borderRadius="lg"
                    width={300}
                    height="50px"
                    _hover={{ bg: 'red.500' }}
                  >
                    Edit artwork
                  </Button>
                  <Button
                    mt={2}
                    colorScheme="red"
                    borderRadius="lg"
                    width={300}
                    height="45px"
                    onClick={handleDeleteProduct}
                  >
                    Delete artwork
                  </Button>
                </>
              ) : (
                <Flex direction="row">
                  <Button
                    bg="gray.300"
                    borderRadius="2xl"
                    width={300}
                    height="50px"
                    onClick={handleAddToCart}
                    isDisabled={!product.forSale || product.quantity === 0}
                  >
                    {!product.forSale
                      ? 'Not for Sale'
                      : product.quantity > 0
                        ? 'Add to Cart'
                        : 'Out of Stock'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                    isDisabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                    size="sm"
                    width="50px"
                    textAlign="center"
                    isDisabled={!product.forSale || product.quantity === 0}
                  />
                  <Button
                    size="sm"
                    onClick={() => setQuantity((prev) => Math.min(prev + 1, product.quantity))}
                    isDisabled={quantity >= product.quantity}
                  >
                    +
                  </Button>
                </Flex>
              )}

              <Box mt={7}>
                <Text fontWeight="bold">Description:</Text>
                <Box mt={2} fontSize="md" color="gray.700">
                  {product.description && product.description.replace(/<[^>]*>/g, '').trim() ? (
                    <>
                      <Box
                        maxW="400px"
                        maxH="500px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="pre-wrap"
                        wordBreak="break-word"
                        dangerouslySetInnerHTML={{
                          __html: isLongDescription
                            ? product.description.slice(0, 500) + '...'
                            : product.description,
                        }}
                      />
                      {isLongDescription && (
                        <Button mt={2} size="sm" colorScheme="blue" variant="link" onClick={onOpen}>
                          See full description
                        </Button>
                      )}
                    </>
                  ) : (
                    <Text color="gray.500">No description</Text>
                  )}
                </Box>
              </Box>
            </Flex>
          </Flex>
          {product.audios?.length > 0 && !onlyAudio && (
            <Box maxW="800px" w="100%" ml={105} mt={6}>
              <Flex align="center" gap={2} position="relative" justify="center">
                {product.audios.length > 2 && (
                  <IconButton
                    icon={<ChevronLeftIcon boxSize={6} />}
                    onClick={() => scrollByAmount(-400)}
                    aria-label="Scroll left"
                    bg="white"
                    boxShadow="md"
                    borderRadius="full"
                    _hover={{ bg: 'gray.100' }}
                  />
                )}

                <Box
                  ref={scrollRef}
                  overflowX="auto"
                  overflowY="hidden"
                  whiteSpace="nowrap"
                  flex="1"
                  px={4}
                  css={{
                    '&::-webkit-scrollbar': { height: '6px' },
                    '&::-webkit-scrollbar-thumb': { background: '#ccc', borderRadius: '8px' },
                  }}
                >
                  <HStack spacing={4} justify="center">
                    {product.audios.map((url, i) => (
                      <Box
                        key={i}
                        minW="300px"
                        maxW="300px"
                        borderRadius="md"
                        p={2}
                        flexShrink={0}
                        boxShadow="sm"
                      >
                        <WaveformPlayer url={url} />
                      </Box>
                    ))}
                  </HStack>
                </Box>

                {product.audios.length > 2 && (
                  <IconButton
                    icon={<ChevronRightIcon boxSize={6} />}
                    onClick={() => scrollByAmount(400)}
                    aria-label="Scroll right"
                    bg="white"
                    boxShadow="md"
                    borderRadius="full"
                    _hover={{ bg: 'gray.100' }}
                  />
                )}
              </Flex>
            </Box>
          )}
        </Flex>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Description</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              fontSize="md"
              color="gray.700"
              whiteSpace="pre-wrap"
              wordBreak="break-word"
              dangerouslySetInnerHTML={{ __html: product?.description || '' }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isImageOpen} onClose={closeImage} size="5xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" />
          <ModalBody p={0} display="flex" justifyContent="center" alignItems="center">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: false }}
            >
              <TransformComponent>
                <Image
                  src={selectedImage}
                  alt="Zoomed Image"
                  borderRadius="lg"
                  maxH="90vh"
                  objectFit="contain"
                  cursor="grab"
                />
              </TransformComponent>
            </TransformWrapper>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ProductCard;

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  Grid,
  Stack,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const colorPalette = [
  "blue.200",
  "teal.200",
  "purple.200",
  "pink.200",
  "orange.200",
  "green.200",
  "yellow.200",
];

const ExploreGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await fetch("/api/galleries");
      const data = await response.json();
      const fetchedGalleries = data.galleries || [];

      setGalleries(fetchedGalleries);
      setFilteredGalleries(fetchedGalleries);
    } catch (error) {
      console.error("Error fetching galleries:", error.message);
    }
  };

  // 🔍 Funcție de filtrare a galeriilor după tag-uri
  useEffect(() => {
    if (searchTags.length === 0) {
      setFilteredGalleries(galleries);
    } else {
      const filtered = galleries.filter((gallery) =>
        searchTags.every((tag) =>
          gallery.tags?.some((galleryTag) =>
            galleryTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
      setFilteredGalleries(filtered);
    }
  }, [searchTags, galleries]);

  // 🔹 Adăugare tag nou în lista de filtrare
  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      const newTag = tagInput.trim().toLowerCase();
      if (!searchTags.includes(newTag)) {
        setSearchTags([...searchTags, newTag]);
      }
      setTagInput("");
    }
  };

  // ❌ Ștergere tag din filtrare
  const handleTagRemove = (tag) => {
    setSearchTags(searchTags.filter((t) => t !== tag));
  };

  return (
    <Box mt={8} px={4}>
      <Heading as="h2" size="lg" mb={6}>
        Explore Galleries
      </Heading>

      {/* ✅ Căutare după tag-uri */}
      <Box mb={4}>
        <Input
          placeholder="Type a tag and press Enter..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagAdd}
          maxW="400px"
          mb={2}
          bg="white"
        />
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {searchTags.map((tag, index) => (
            <Tag key={index} size="md" borderRadius="full" colorScheme="blue">
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => handleTagRemove(tag)} />
            </Tag>
          ))}
        </Stack>
      </Box>

      {/* ✅ Afișare galerii filtrate */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
        {filteredGalleries.length > 0 ? (
          filteredGalleries.map((gallery, index) => {
            const bgColor = colorPalette[index % colorPalette.length];
            const productImages = (gallery.products || [])
              .filter((product) => product.images?.length > 0)
              .flatMap((product) => product.images)
              .slice(0, 6);

            return (
              <LinkBox
                key={gallery._id}
                bg={bgColor}
                p={4}
                borderRadius="lg"
                boxShadow="md"
                overflow="hidden"
                _hover={{ boxShadow: "xl", transform: "scale(1.02)", transition: "0.3s" }}
              >
                <Stack spacing={2} mb={3}>
                  <Heading size="md">
                    <LinkOverlay as={Link} to={`/gallery/${gallery._id}`}>
                      {gallery.name}
                    </LinkOverlay>
                  </Heading>
                  <Text color="gray.600">{gallery.products?.length || 0} products</Text>
                  {/* 🔹 Afișare tag-uri galerii */}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {gallery.tags?.map((tag, idx) => (
                      <Tag key={idx} size="sm" colorScheme="gray">
                        {tag}
                      </Tag>
                    ))}
                  </Stack>
                </Stack>

                {/* 📌 Grid adaptiv pentru imagini */}
                {productImages.length > 0 ? (
                  <Grid
                    templateColumns={productImages.length === 1 ? "1fr" : "repeat(2, 1fr)"}
                    gap={2}
                    borderRadius="md"
                    overflow="hidden"
                  >
                    {productImages.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`Gallery image ${idx}`}
                        width="100%"
                        height="auto"
                        maxH={productImages.length === 1 ? "240px" : "120px"}
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ))}
                  </Grid>
                ) : (
                  <Text textAlign="center" color="gray.500">
                    No images available
                  </Text>
                )}
              </LinkBox>
            );
          })
        ) : (
          <Text>No galleries found.</Text>
        )}
      </Grid>
    </Box>
  );
};

export default ExploreGalleries;

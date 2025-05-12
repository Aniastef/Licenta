import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Input,
  Select,
  Stack,
  Wrap,
  WrapItem,
  Button,
  SimpleGrid,
  HStack,
  Circle,
  Image,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const GALLERIES_PER_PAGE = 12;
const GALLERY_CATEGORIES = [
  "General", "Photography", "Painting", "Drawing", "Sketch", "Illustration", "Digital Art",
  "Pixel Art", "3D Art", "Animation", "Graffiti", "Calligraphy", "Typography", "Collage",
  "Mixed Media", "Sculpture", "Installation", "Fashion", "Textile", "Architecture",
  "Interior Design", "Product Design", "Graphic Design", "UI/UX", "Music", "Instrumental",
  "Vocal", "Rap", "Spoken Word", "Podcast", "Sound Design", "Film", "Short Film",
  "Documentary", "Cinematography", "Video Art", "Performance", "Dance", "Theatre", "Acting",
  "Poetry", "Writing", "Essay", "Prose", "Fiction", "Non-fiction", "Journal", "Comics",
  "Manga", "Zine", "Fantasy Art", "Surrealism", "Realism", "Abstract", "Minimalism",
  "Expressionism", "Pop Art", "Concept Art", "AI Art", "Experimental", "Political Art",
  "Activist Art", "Environmental Art"
];


const ExploreGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [filterTags, setFilterTags] = useState([]);
  const [sortOption, setSortOption] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterCategories, setFilterCategories] = useState([]);
  const getCategoryColor = (category) => {
    const colors = [
      "blue", "green", "red", "orange", "purple", "teal", "cyan", "pink", "yellow"
    ];
    const index = GALLERY_CATEGORIES.indexOf(category);
    return colors[index % colors.length] || "gray";
  };
  
  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch("/api/galleries", { credentials: "include" });
      const data = await res.json();
      setGalleries(data.galleries || []);
    } catch (err) {
      console.error("Error fetching galleries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let updated = [...galleries];

    updated = updated.filter((g) => {
      let matchSearch = true;
      const lower = filterText.toLowerCase();

      if (searchBy === "name") {
        matchSearch = (g.name || "").toLowerCase().includes(lower);
      } else if (searchBy === "creator") {
        matchSearch = (`${g.user?.firstName || ""} ${g.user?.lastName || ""}`).toLowerCase().includes(lower);
      } else if (searchBy === "tags") {
        matchSearch = (g.tags || []).some((tag) => tag.toLowerCase().includes(lower));
      }

      const matchTags =
        filterTags.length === 0 || filterTags.every((tag) => g.tags?.includes(tag));

        const matchCategory =
  filterCategories.length === 0 || filterCategories.includes(g.category);

  return matchSearch && matchCategory;
});

    updated.sort((a, b) => {
      if (sortOption === "name") {
        return sortDirection === "asc"
          ? (a.name || "").localeCompare(b.name || "")
          : (b.name || "").localeCompare(a.name || "");
      } else if (sortOption === "date") {
        return sortDirection === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }      
      else if (sortOption === "products") {
        return sortDirection === "asc"
          ? (a.products?.length || 0) - (b.products?.length || 0)
          : (b.products?.length || 0) - (a.products?.length || 0);
      } else {
        return 0;
      }
    });
    

    setFilteredGalleries(updated);
    setCurrentPage(1);
  }, [galleries, filterText, searchBy, sortOption, sortDirection, filterTags, filterCategories]);

  const paginated = filteredGalleries.slice(
    (currentPage - 1) * GALLERIES_PER_PAGE,
    currentPage * GALLERIES_PER_PAGE
  );

  const totalPages = Math.ceil(filteredGalleries.length / GALLERIES_PER_PAGE);

  return (
    <Box p={4}>
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          Explore Galleries
        </Text>
        <Flex position="absolute" right={4} gap={2}>
          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>

      <Flex justify="space-between" align="center" my={4} wrap="wrap">
        <HStack spacing={4} mb={2}>
          <Text>Search by:</Text>
          <Select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} w="160px">
            <option value="name">Gallery name</option>
            <option value="creator">Creator</option>
            <option value="collaborators">Collaborators</option>
            <option value="tags">Tags</option>
          </Select>
          <Input
            placeholder={`Search by ${searchBy}...`}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            w="250px"
          />
        </HStack>

        <HStack spacing={2}>
          <Text>Sort by:</Text>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            w="200px"
          >
            <option value="name">Name</option>
            <option value="products">Number of art pieces</option>
            <option value="date">Creation date</option>

          </Select>

          <Button onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}>
          {sortDirection === "asc" ? "↑" : "↓"}
        </Button>

        </HStack>
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Sidebar */}
        <Box w="220px" p={4} borderWidth={1} borderRadius="lg">
        <Text fontWeight="bold">Filter by Category</Text>
<Wrap spacing={2} mt={2} >
  {GALLERY_CATEGORIES.map((cat) => (
    <WrapItem key={cat} w="100%">
     <Button
  size="sm"
  width="100%"
  borderRadius="full"
  colorScheme={
    filterCategories.includes(cat)
      ? getCategoryColor(cat)
      : "gray"
  }
  variant={filterCategories.includes(cat) ? "solid" : "outline"}
  onClick={() =>
    setFilterCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    )
  }
>
  {cat}
</Button>

    </WrapItem>
  ))}
</Wrap>

        </Box>

        {/* Gallery List */}
        <Box flex={1}>
          {loading ? (
            <Text>Loading...</Text>
          ) : paginated.length === 0 ? (
            <Text>No galleries found.</Text>
          ) : (
            <>
<SimpleGrid minChildWidth="400px" spacing={6}>
{paginated.map((gallery) => (
  <Link to={`/galleries/${gallery.owner?.username}/${gallery.name}`} key={gallery._id}>
  <Box
                      p={0}
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="md"
                      overflow="hidden"
                      border="1px solid #ccc"
                      _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                      h="100%"
                      display="flex"
                      flexDirection="column"
                    >
                     <Box h="200px" bg="gray.300">
  {gallery.coverPhoto ? (
    <Image
      src={gallery.coverPhoto}
      alt={gallery.name}
      objectFit="cover"
      w="100%"
      h="100%"
    />
  ) : gallery.products?.[0]?.images?.[0] ? (
    <Image
      src={gallery.products[0].images[0]}
      alt={gallery.name}
      objectFit="cover"
      w="100%"
      h="100%"
    />
  ) : (
    <Flex align="center" justify="center" h="100%">
      <Text>No image</Text>
    </Flex>
  )}
</Box>


                      <Box textAlign="center" py={3}>
                        <Text fontWeight="bold">{gallery.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {gallery.products?.length || 0} products
                        </Text>
                        <Text fontSize="sm" mt={1}>
  <strong>Creator:</strong> {gallery.owner?.firstName} {gallery.owner?.lastName}
</Text>

{gallery.category && (
  <Text fontSize="sm" color="teal.600">
    <strong>Category:</strong> {gallery.category}
  </Text>
)}


{gallery.collaborators?.length > 0 && (
  <Text fontSize="sm" color="blue.500">
    <strong>Collaborators:</strong>{" "}
    {gallery.collaborators.map(c => `${c.firstName} ${c.lastName}`).join(", ")}
  </Text>
)}

                        {gallery.tags?.length > 0 && (
                          <Text fontSize="sm" color="purple.600">
                            <strong>Tags:</strong> {gallery.tags.join(", ")}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>

              <Flex mt={6} align="center" justify="space-between">
                <Text>
                  {1 + (currentPage - 1) * GALLERIES_PER_PAGE} - {Math.min(currentPage * GALLERIES_PER_PAGE, filteredGalleries.length)} of {filteredGalleries.length} galleries
                </Text>
                <HStack spacing={2}>
                  <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>
                    Previous
                  </Button>
                  {[...Array(Math.min(3, totalPages)).keys()].map((i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      colorScheme={currentPage === i + 1 ? "blue" : undefined}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  {totalPages > 3 && <Text>...</Text>}
                  <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} isDisabled={currentPage === totalPages}>
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ExploreGalleries;

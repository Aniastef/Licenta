import {
  Box,
  Button,
  Circle,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const UserArticlesPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userAtom);
  const toast = useToast();
  const [articles, setArticles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const formatDateKey = (date) => new Date(date).toISOString().split("T")[0];
  
  const articlesByDate = {};
  articles.forEach((article) => {
    const key = formatDateKey(article.createdAt);
    if (!articlesByDate[key]) articlesByDate[key] = [];
    articlesByDate[key].push(article);
  });
  
  const filteredArticles = selectedDate
    ? articlesByDate[formatDateKey(selectedDate)] || []
    : articles;
  
  const tileContent = ({ date }) => {
    const key = formatDateKey(date);
    return articlesByDate[key] ? <Box color="blue.500" fontWeight="bold">•</Box> : null;
  };
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`/api/articles/user/${username}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setArticles(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
          toast({
            title: "Error",
            description: data.error,
            status: "error",
            duration: 3000,
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          status: "error",
          duration: 3000,
        });
      }
    };
    fetchArticles();
  }, [username]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
  
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Deleted",
          description: "Article deleted successfully",
          status: "success",
          duration: 3000,
        });
        setArticles((prev) => prev.filter((a) => a._id !== id));
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete article",
          status: "error",
          duration: 3000,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("default", { month: "short" }).toUpperCase();
    const day = String(date.getDate()).padStart(2, "0");
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { day, month, time };
  };
  

  return (
    <Box maxW="1800px" mx="auto" py={6}>
   
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
              <Text fontWeight="bold" fontSize="2xl" textAlign="center">
                @{username}'s Articles
              </Text>
              <Flex position="absolute" right={4} gap={2}>
                <Circle size="30px" bg="yellow.400" />
                <Circle size="30px" bg="green.400" />
              </Flex>
            </Flex>
      {currentUser?.username === username && (
        <Button colorScheme="blue" ml={5} mb={6} onClick={() => navigate("/create/article")}>
          Write a new ARTicle
        </Button>
      )}

<Flex direction={{ base: "column", md: "row" }} gap={10} px={4} mt={6}>
  {/* Calendar Sidebar */}
  <Box minW={{ base: "100%", md: "300px" }}>
    <Calendar  
      onChange={setSelectedDate}
      value={selectedDate}
      tileContent={tileContent}
    />

    {selectedDate && (
      <Button mt={2} size="sm" onClick={() => setSelectedDate(null)}>
        Show all articles
      </Button>
    )}
  </Box>

  {/* Article List */}
  <VStack spacing={6} align="stretch" flex={1}>
    {filteredArticles.length === 0 ? (
      <Text>No articles for this day.</Text>
    ) : (
      filteredArticles.map((article) => {
        const { day, month, time } = formatDate(article.createdAt);
        return (
          <Flex
            key={article._id}
            gap={4}
            borderBottom="1px solid #e2e8f0"
            pb={4}
            align="flex-start"
            wrap="wrap"
          >
            {/* Date */}
            <Box w="60px" textAlign="center">
              <Text fontWeight="bold" fontSize="lg">{day}</Text>
              <Text fontSize="sm" color="gray.500">{month}</Text>
              <Text fontSize="xs" color="gray.400">{time}</Text>
            </Box>

            {/* Article Details */}
            <Box
  key={article._id}
  p={0}
  borderWidth="1px"
  borderRadius="md"
  shadow="md"
  _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
  transition="all 0.2s"
  cursor="pointer"
  onClick={() => navigate(`/articles/${article._id}`)}
  bg="white"
>
  {/* Imaginea de sus, dacă există */}
  {article.coverImage && (
    <Image
      src={article.coverImage}
      alt="Cover"
      w="100%"
      minH="150px"
      maxH="250px"
      objectFit="cover"
      borderTopRadius="md"
    />
  )}

  {/* Fundal de foaie DOAR sub imagine */}
  <Box
    px={6}
    py={6}
    sx={{
      backgroundImage: `
        repeating-linear-gradient(to bottom, transparent, transparent 29px, #cbd5e0 30px),
        linear-gradient(to right, #dc2626 1px, transparent 2px)
      `,
      backgroundSize: "100% 30px, 1px 100%",
      backgroundPosition: "left 40px top, left 40px top",
      backgroundRepeat: "repeat-y, no-repeat",
    }}
  >
    <Text
      as={RouterLink}
      to={`/articles/${article._id}`}
      fontWeight="bold"
      fontSize="xl"
      _hover={{ textDecoration: "underline", color: "blue.500" }}
    >
      {article.title}
    </Text>

    {article.subtitle && (
      <Text fontSize="md" color="gray.600" mt={1}>
        {article.subtitle}
      </Text>
    )}

    <Text fontSize="sm" color="gray.500" mt={2}>
      {article.content.replace(/<[^>]+>/g, "").slice(0, 50)}...
    </Text>

    <Text fontSize="xs" color="gray.400" mt={1}>
      {new Date(article.createdAt).toLocaleString()}
    </Text>

    <Button
      as={RouterLink}
      to={`/articles/${article._id}`}
      size="sm"
      variant="link"
      colorScheme="blue"
      mt={2}
    >
      View Details →
    </Button>
    
  </Box>
  {currentUser?.username === username && (
  <Button
    colorScheme="red"
    size="sm"
    ml={5}
    mb={2}
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(article._id);
    }}
  >
    Delete
  </Button>
)}

</Box>

          </Flex>
        );
      })
    )}
  </VStack>
</Flex>

    </Box>
  );
};

export default UserArticlesPage;

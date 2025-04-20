// --- UserArticlesPage.jsx ---
import {
    Box,
    Button,
    Heading,
    Input,
    VStack,
    Text,
    Link,
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  import { Link as RouterLink, useParams } from "react-router-dom";
  import ReactQuill from "react-quill-new";
  import "react-quill-new/dist/quill.snow.css";
  import useShowToast from "../hooks/useShowToast";
  
  const UserArticlesPage = () => {
    const { username } = useParams();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [articles, setArticles] = useState([]);
    const showToast = useShowToast();
  
    const fetchArticles = async () => {
      const res = await fetch(`/api/articles/user/${username}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setArticles(data);
    };
  
    useEffect(() => {
      fetchArticles();
    }, [username]);
  
    const handleSave = async () => {
      if (!title || !content) return showToast("Error", "Title and content required", "error");
  
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setContent("");
        fetchArticles();
        showToast("Saved", "Article saved", "success");
      } else {
        showToast("Error", data.error || "Something went wrong", "error");
      }
    };
  
    return (
      <Box maxW="container.md" mx="auto" py={6}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Write a new article</Heading>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            style={{ height: "200px", marginBottom: "20px" }}
          />
          <Button colorScheme="blue" onClick={handleSave}>Save</Button>
  
          <Heading size="md" mt={8}>My Articles</Heading>
          {articles.map((a) => (
            <Box key={a._id} p={4} bg="gray.100" borderRadius="md">
              <Link as={RouterLink} to={`/articles/${a._id}`} fontWeight="bold">
                {a.title}
              </Link>
              <Text fontSize="sm" color="gray.600">
                {new Date(a.createdAt).toLocaleString()}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  };
  
  export default UserArticlesPage;
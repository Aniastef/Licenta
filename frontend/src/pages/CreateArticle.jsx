import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    VStack,
    useToast,
    Text,
    Spinner,
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import ReactQuill from "react-quill-new";
  import "react-quill-new/dist/quill.snow.css";
  import GalleryImageCropModal from "../components/GalleryImageCropModal";
import imageCompression from "browser-image-compression";

  const CreateOrEditArticlePage = () => {
    const { id } = useParams(); // Dacă există, e editare
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingExisting, setLoadingExisting] = useState(!!id);
    const toast = useToast();
    const navigate = useNavigate();
    const [subtitle, setSubtitle] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [rawCoverImage, setRawCoverImage] = useState(null);
    const [croppedCoverImage, setCroppedCoverImage] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    
  
    useEffect(() => {
      if (id) {
        fetch(`/api/articles/${id}`, { credentials: "include" })
          .then((res) => res.json())
          .then((data) => {
            setTitle(data.title || "");
            setSubtitle(data.subtitle || "");
            setContent(data.content || "");
            setCoverImage(data.coverImage || "");

          })
          .catch((err) => {
            toast({
              title: "Error loading article",
              description: err.message,
              status: "error",
              duration: 3000,
            });
          })
          .finally(() => setLoadingExisting(false));
      }
    }, [id]);
  
    const handleSubmit = async (asDraft = false) => {
      if (!title || !content) {
        toast({
          title: "Error",
          description: "Title and content are required.",
          status: "error",
          duration: 3000,
        });
        return;
      }
  
      setIsLoading(true);
  
      try {
        const res = await fetch(`/api/articles${id ? `/${id}` : ""}`, {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title, subtitle, content, coverImage, draft: asDraft })
        });
  
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save article");
  
        toast({
          title: id ? "Article updated" : "Article created",
          description: asDraft ? "Saved as draft." : "Published successfully.",
          status: "success",
          duration: 3000,
        });
  
        navigate(`/articles/${data._id}`);
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    if (loadingExisting)
      return (
        <Container maxW="container.md" py={10}>
          <Spinner size="xl" />
        </Container>
      );
  
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading>{id ? "Edit Article" : "Create New Article"}</Heading>
          <Input
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
                    <Input
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
/>
<Input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawCoverImage(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  }}
/>


{croppedCoverImage && (
  <Box mt={2}>
    <img
      src={croppedCoverImage}
      alt="Cover Preview"
      style={{ maxHeight: "250px", width: "100%", objectFit: "cover", borderRadius: "6px" }}
    />
  </Box>
)}


<ReactQuill
  value={content}
  onChange={setContent}
  modules={{
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }}
  formats={[
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "align", "color", "background", "link", "image"
  ]}
  style={{ height: "200px", overflowY: "auto", marginBottom: "20px" }}
/>

          <Box display="flex" justifyContent="flex-end" gap={4}>
            <Button
              onClick={() => handleSubmit(true)}
              variant="outline"
              isLoading={isLoading}
            >
              Save Draft
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleSubmit(false)}
              isLoading={isLoading}
            >
              {id ? "Update" : "Publish"}
            </Button>
          </Box>
        </VStack>
        <GalleryImageCropModal
  isOpen={isCropModalOpen}
  onClose={() => setIsCropModalOpen(false)}
  imageSrc={rawCoverImage}
  onCropComplete={(cropped) => {
    setCroppedCoverImage(cropped);
    setCoverImage(cropped); // salvează ca Base64
  }}
/>

      </Container>
    );
  };
  
  export default CreateOrEditArticlePage;
  
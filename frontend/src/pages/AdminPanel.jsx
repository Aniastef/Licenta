import React, { useEffect, useState } from "react";
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast,
  Select, Input, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Textarea, Flex, Heading,
  FormControl,
  FormLabel,
  Switch,
  Image
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver"; // ✅ Pentru descărcare fișiere
import Papa from "papaparse"; // ✅ Pentru generare CSV
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill";
import ImageCropModal from '../components/ImageCropModal';
import GalleryImageCropModal from "../components/GalleryImageCropModal";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // ✅ Adăugare tab switcher
  const [actionFilter, setActionFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [saleFilter, setSaleFilter] = useState("all");
  const [productSortField, setProductSortField] = useState("name");
  const [productSortOrder, setProductSortOrder] = useState("asc");
  // Pentru articole
const [articles, setArticles] = useState([]);
const [articleSearch, setArticleSearch] = useState("");
const [articleSortField, setArticleSortField] = useState("title");
const [articleSortOrder, setArticleSortOrder] = useState("asc");

// Pentru evenimente
const [events, setEvents] = useState([]);
const [eventSearch, setEventSearch] = useState("");
const [eventSortField, setEventSortField] = useState("name");
const [eventSortOrder, setEventSortOrder] = useState("asc");

// Pentru galerii
const [galleries, setGalleries] = useState([]);
const [gallerySearch, setGallerySearch] = useState("");
const [gallerySortField, setGallerySortField] = useState("name");
const [gallerySortOrder, setGallerySortOrder] = useState("asc");
const [editProduct, setEditProduct] = useState(null);
const [isProductModalOpen, setIsProductModalOpen] = useState(false);
const [cropModalOpen, setCropModalOpen] = useState(false);
const [rawImage, setRawImage] = useState(null);
const [croppedImage, setCroppedImage] = useState(null);
const [editGallery, setEditGallery] = useState(null);
const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
const [rawGalleryCover, setRawGalleryCover] = useState(null);
const [croppedGalleryCover, setCroppedGalleryCover] = useState(null);
const [isGalleryCropOpen, setIsGalleryCropOpen] = useState(false);
const [editEvent, setEditEvent] = useState(null);
const [isEventModalOpen, setIsEventModalOpen] = useState(false);

const handleEditGallery = (gallery) => {
  setEditGallery(gallery);
  setIsGalleryModalOpen(true);
};

const handleSaveGalleryEdit = async () => {
  try {
    const formData = new FormData();
    formData.append("name", editGallery.name);
    formData.append("category", editGallery.category);
    formData.append("description", editGallery.description || "");
    formData.append("tags", JSON.stringify(
      Array.isArray(editGallery.tags) ? editGallery.tags : []
    ));
        formData.append("collaborators", JSON.stringify(editGallery.collaborators?.map(c => c._id) || []));

    // Dacă e imagine base64, convertește-o în Blob
    if (croppedGalleryCover?.startsWith("data:")) {
      const res = await fetch(croppedGalleryCover);
      const blob = await res.blob();
      formData.append("coverPhoto", blob, "cover.jpg");
    }
    

    const response = await fetch(`/api/galleries/${editGallery._id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to update gallery");
    }

    toast({ title: "Gallery updated", status: "success" });
    setIsGalleryModalOpen(false);
    fetchGalleries();
    setCroppedGalleryCover(null);

  } catch (err) {
    toast({ title: err.message, status: "error" });
  }
};


const handleDeleteGallery = async (id) => {
  if (!window.confirm("Are you sure you want to delete this gallery?")) return;

  try {
    const response = await fetch(`/api/galleries/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (!response.ok) throw new Error("Failed to delete gallery");

    toast({ title: "Gallery deleted", status: "success" });
    fetchGalleries();
  } catch (err) {
    toast({ title: err.message, status: "error" });
  }
};

const handleEditEvent = (event) => {
  setEditEvent(event);
  setIsEventModalOpen(true);
};

const handleDeleteEvent = async (id) => {
  if (!window.confirm("Are you sure you want to delete this event?")) return;

  try {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (!response.ok) throw new Error("Failed to delete event");

    toast({ title: "Event deleted", status: "success" });
    fetchEvents();
  } catch (err) {
    toast({ title: err.message, status: "error" });
  }
};

const handleUploadPicture = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const base64 = await convertToBase64(file);
  setRawImage(base64);
  setCropModalOpen(true);
};

const convertToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { credentials: "include" });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      toast({ title: "Error loading products", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setIsProductModalOpen(true);
  };
  
  const handleSaveProductEdit = async () => {
    try {
      const response = await fetch(`/api/products/update/${editProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editProduct),
        credentials: "include"
      });
  
      if (!response.ok) throw new Error("Failed to update product");
  
      toast({ title: "Product updated successfully", status: "success" });
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };
  
  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles", { credentials: "include" });
      const data = await res.json();
      setArticles(data); // ← în loc de `data.articles || []`

    } catch (err) {
      toast({ title: "Error loading articles", status: "error" });
    }
  };
  
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/audit/logs", { credentials: "include" });
      const data = await response.json();
  
      // ✅ Sortare descrescătoare după timestamp
      const sortedLogs = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
      console.log("Fetched logs:", sortedLogs); // ✅ Debugging
      setLogs(sortedLogs);
    } catch (err) {
      toast({ title: "Error fetching logs", status: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchGalleries = async () => {
    try {
      const res = await fetch("/api/galleries", { credentials: "include" });
      const data = await res.json();
      setGalleries(data.galleries || []);
    } catch (err) {
      toast({ title: "Error loading galleries", status: "error" });
    }
  };
  
  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "events") {
      fetchEvents();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "galleries") {
      fetchGalleries();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "articles") {
      fetchArticles();
    }
  }, [activeTab]);
  
  
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
  
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
  
      toast({ title: "Product deleted", status: "success" });
      fetchProducts(); // Refresh
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };
  
  const exportProductsToCSV = () => {
    if (products.length === 0) {
      toast({ title: "No products to export", status: "warning" });
      return;
    }
  
    const csvData = Papa.unparse(products.map(prod => ({
      ID: prod._id,
      Name: prod.name,
      Price: prod.price,
      Category: prod.category,
      Creator: `${prod.user?.firstName} ${prod.user?.lastName}`,
      CreatedAt: new Date(prod.createdAt).toLocaleDateString()
    })));
  
    const csvBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(csvBlob, "products_export.csv");
    toast({ title: "Products exported", status: "success" });
  };

  
  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const handleNavigateToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/me", { credentials: "include" }); // ← aici e corect acum
      const data = await response.json();
      if (!data || !data.role) navigate("/");
      if (data.role !== "admin" && data.role !== "admin") navigate("/");
      setCurrentUser(data);
    } catch (err) {
      navigate("/");
    }
  };
  

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast({ title: "Error fetching users", status: "error" });
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setNewPassword("");
    setNewProfilePicture(null);
    onOpen();
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        bio: editUser.bio,
        age: editUser.age,
        profession: editUser.profession,
        location: editUser.location,
        facebook: editUser.facebook,
        instagram: editUser.instagram,
        webpage: editUser.webpage,
        soundcloud: editUser.soundcloud,
        spotify: editUser.spotify,
        linkedin: editUser.linkedin,
        phone: editUser.phone,
        hobbies: editUser.hobbies,
        gender: editUser.gender,
        pronouns: editUser.pronouns,
        address: editUser.address,
        city: editUser.city,
        country: editUser.country,
        message: editUser.message,
        heart: editUser.heart,
      };
      

      if (newPassword) {
        updateData.password = newPassword;
      }

      if (croppedImage) {
        updateData.profilePicture = croppedImage;
      }
      

      const response = await fetch(`/api/admin/users/${editUser._id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast({ title: "User updated successfully", status: "success" });
      onClose();
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events", { credentials: "include" });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      toast({ title: "Error loading events", status: "error" });
    }
  };

  
  const handleBlockUser = async (user) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update user status");

      if (user._id === currentUser._id) {
        localStorage.removeItem("licenta");
        window.location.href = "/login";
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u))
      );

      toast({ title: `User ${user.isBlocked ? "unblocked" : "blocked"} successfully`, status: "success" });
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error deleting user");
      }

      toast({ title: "User deleted successfully", status: "success" });
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };

  
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole }),
        credentials: "include", // ✅ Asigură-te că este inclus
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating role");
      }
  
      toast({ title: "Role updated successfully", status: "success" });
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };
  
  const exportUsersToCSV = () => {
    if (users.length === 0) {
      toast({ title: "No users to export", status: "warning" });
      return;
    }

    const csvData = Papa.unparse(users.map(user => ({
      ID: user._id,
      Name: `${user.firstName} ${user.lastName}`,
      Email: user.email,
      Role: user.role,
      Status: user.isBlocked ? "Blocked" : "Active"
    })));

    const csvBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(csvBlob, "users_list.csv");
    toast({ title: "Users exported successfully!", status: "success" });
  };
  
  // const filteredUsers = users.filter(user =>
  //   `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   user.role.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  
  const filteredUsers = users
    .filter(user =>
      (roleFilter === "all" || user.role === roleFilter) &&
      (statusFilter === "all" || (statusFilter === "active" ? !user.isBlocked : user.isBlocked)) &&
      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const fieldA = a[sortField]?.toString().toLowerCase() || "";
      const fieldB = b[sortField]?.toString().toLowerCase() || "";
      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const filteredProducts = products
    .filter(product =>
      (categoryFilter === "all" || product.category === categoryFilter) &&
      (saleFilter === "all" || (saleFilter === "forsale" ? product.forSale : !product.forSale)) &&
      (
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearch.toLowerCase()) ||
        `${product.user?.firstName || ""} ${product.user?.lastName || ""}`.toLowerCase().includes(productSearch.toLowerCase())
      )
    )
    .sort((a, b) => {
      const valA = a[productSortField]?.toString().toLowerCase() || "";
      const valB = b[productSortField]?.toString().toLowerCase() || "";
      if (valA < valB) return productSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return productSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
    const filteredArticles = articles
    .filter(article =>
      article.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      `${article.user?.firstName || ""} ${article.user?.lastName || ""}`.toLowerCase().includes(articleSearch.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[articleSortField]?.toString().toLowerCase() || "";
      const valB = b[articleSortField]?.toString().toLowerCase() || "";
      if (valA < valB) return articleSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return articleSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
    const filteredEvents = events
    .filter(event =>
      event.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
      `${event.user?.firstName || ""} ${event.user?.lastName || ""}`.toLowerCase().includes(eventSearch.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[eventSortField]?.toString().toLowerCase() || "";
      const valB = b[eventSortField]?.toString().toLowerCase() || "";
      if (valA < valB) return eventSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return eventSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  

    const filteredGalleries = galleries
  .filter(gallery =>
    gallery.name.toLowerCase().includes(gallerySearch.toLowerCase()) ||
    `${gallery.user?.firstName || ""} ${gallery.user?.lastName || ""}`.toLowerCase().includes(gallerySearch.toLowerCase())
  )
  .sort((a, b) => {
    const valA = a[gallerySortField]?.toString().toLowerCase() || "";
    const valB = b[gallerySortField]?.toString().toLowerCase() || "";
    if (valA < valB) return gallerySortOrder === "asc" ? -1 : 1;
    if (valA > valB) return gallerySortOrder === "asc" ? 1 : -1;
    return 0;
  });

    const totalUsers = users.length;
  const activeUsers = users.filter(user => !user.isBlocked).length;
  const blockedUsers = users.filter(user => user.isBlocked).length;

  const userRegistrationsPerMonth = users.reduce((acc, user) => {
    const month = new Date(user.createdAt).toLocaleString("default", { month: "short" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const registrationData = Object.entries(userRegistrationsPerMonth).map(([month, count]) => ({ month, count }));

  const filteredLogs = logs.filter(log =>
    (actionFilter === "all" || log.action === actionFilter) &&
    (log.performedBy.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.performedBy.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportLogsToCSV = () => {
    if (logs.length === 0) {
      toast({ title: "No logs to export", status: "warning" });
      return;
    }
    const csvData = Papa.unparse(logs.map(log => ({
      Action: log.action,
      PerformedBy: `${log.performedBy.firstName} ${log.performedBy.lastName}`,
      Details: log.details,
      Timestamp: new Date(log.timestamp).toLocaleString()
    })));
    const csvBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(csvBlob, "audit_logs.csv");
    toast({ title: "Logs exported successfully!", status: "success" });
  };
  
  return (
    <Box p={5}>
		  <Heading mb={4} textAlign="center">
			Admin Panel
		  </Heading>      <Box mb={5} display="flex" gap={4}>
        <Button 
          colorScheme={activeTab === "users" ? "blue" : "gray"} 
          onClick={() => setActiveTab("users")}
        >
          Users
        </Button>
        <Button
  colorScheme={activeTab === "products" ? "blue" : "gray"}
  onClick={() => setActiveTab("products")}
>
  Art pieces
</Button>
<Button
  colorScheme={activeTab === "events" ? "blue" : "gray"}
  onClick={() => {
    setActiveTab("events");
    fetchEvents();
  }}
>
  Events
</Button>


<Button onClick={() => {
  setActiveTab("galleries");
  fetchGalleries();
}}>Galleries</Button>
<Button onClick={() => {
  setActiveTab("articles");
  fetchArticles(); // La fel pentru events și galleries
}}>ARTicles</Button>
        <Button 
          colorScheme={activeTab === "logs" ? "blue" : "gray"} 
          onClick={() => {
            setActiveTab("logs");
            fetchLogs(); // ✅ Încarcă logurile doar când e activ tab-ul
          }}
        >
          View Audit Logs
        </Button>
        <Button 
          colorScheme={activeTab === "users" ? "blue" : "gray"} 
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </Button>
        

      </Box>

        {activeTab === "dashboard" && (
                <Box>
                  <h2>📊 Dashboard</h2>
                  <Box display="flex" gap={4} mb={4}>
                    <Box p={4} border="1px solid gray" borderRadius="md">Total Users: {totalUsers}</Box>
                    <Box p={4} border="1px solid gray" borderRadius="md">Active Users: {activeUsers}</Box>
                    <Box p={4} border="1px solid gray" borderRadius="md">Blocked Users: {blockedUsers}</Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={registrationData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3182ce" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
      {activeTab === "users" && (
        <>
            <Heading size="md" mb={4}>😃 Manage users</Heading>

        <Button colorScheme="blue" mb={4} onClick={exportUsersToCSV}>
        Export Users (CSV)
      </Button>
      <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      {/* Search Input */}
      <Flex mt={4} direction="row"  gap={2} >
      
        <Select size="sm" maxWidth="200px" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="admin">admin</option>
        </Select>

        <Select size="sm" maxWidth="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </Select>

        <Select size="sm" maxWidth="200px" value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="firstName">Sort by name</option>
          <option value="username">Sort by username</option>
          <option value="createdAt">Sort by creation date</option>
        </Select>

        <Button size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          {sortOrder === "asc" ? "⬆️ Ascending" : "⬇️ Descending"}
        </Button>
      </Flex>

{/* Tabel cu filtrare activă */}
{loading ? (
  <Spinner />
) : (
  <Table variant="simple">
    <Thead>
      <Tr>
        <Th>Name</Th>
        <Th>Email</Th>
        <Th>Role</Th>
        <Th>Actions</Th>
      </Tr>
    </Thead>
    <Tbody>
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <Tr key={user._id}>
            <Td 
              onClick={() => handleNavigateToProfile(user.username)}
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            >
              {user.firstName} {user.lastName}
            </Td>
            <Td>{user.email}</Td>
            <Td>
              <Select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                size="sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="admin">admin</option>
              </Select>
            </Td>
            <Td>
              <Button colorScheme="blue" onClick={() => handleEditUser(user)}>Edit</Button>
              <Button colorScheme={user.isBlocked ? "green" : "red"} onClick={() => handleBlockUser(user)}>
                {user.isBlocked ? "Unblock" : "Block"}
              </Button>
              <Button colorScheme="red" onClick={() => handleDeleteUser(user._id)} isDisabled={user.role === "admin"}>
                Delete
              </Button>
            </Td>
          </Tr>
        ))
      ) : (
        <Tr>
          <Td colSpan="4">No users found</Td>
        </Tr>
      )}
    </Tbody>
  </Table>
)}



      {editUser && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
  <FormControl mb={3}>
    <FormLabel>First Name</FormLabel>
    <Input value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Last Name</FormLabel>
    <Input value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Email</FormLabel>
    <Input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Bio</FormLabel>
    <Textarea value={editUser.bio} onChange={(e) => setEditUser({ ...editUser, bio: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
  <FormLabel >Gender</FormLabel>
  <Select
    value={editUser.gender || ""}
    onChange={(e) => setEditUser({ ...editUser, gender: e.target.value })}
  >
    <option value="">Select Gender</option>
    <option value="Female">Female</option>
    <option value="Male">Male</option>
    <option value="Nonbinary">Nonbinary</option>
    <option value="More options">More options</option>
  </Select>
</FormControl>

{editUser.gender === "More options" && (
  <FormControl>
    <FormLabel>Custom Gender</FormLabel>
    <Input value={editUser.customGender || ""} onChange={(e) => setEditUser({ ...editUser, customGender: e.target.value })} />
  </FormControl>
)}


  <FormControl mt={1} mb={3}>
    <FormLabel>Pronouns</FormLabel>
    <Input value={editUser.pronouns || ""} onChange={(e) => setEditUser({ ...editUser, pronouns: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Address</FormLabel>
    <Input value={editUser.address || ""} onChange={(e) => setEditUser({ ...editUser, address: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>City</FormLabel>
    <Input value={editUser.city || ""} onChange={(e) => setEditUser({ ...editUser, city: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Country</FormLabel>
    <Input value={editUser.country || ""} onChange={(e) => setEditUser({ ...editUser, country: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Phone</FormLabel>
    <Input value={editUser.phone || ""} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Hobbies</FormLabel>
    <Input value={editUser.hobbies || ""} onChange={(e) => setEditUser({ ...editUser, hobbies: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Profession</FormLabel>
    <Input value={editUser.profession} onChange={(e) => setEditUser({ ...editUser, profession: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Location</FormLabel>
    <Input value={editUser.location} onChange={(e) => setEditUser({ ...editUser, location: e.target.value })} />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>New Password (optional)</FormLabel>
    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
  </FormControl>

  <FormControl mb={3}>
  <FormLabel>Profile Picture</FormLabel>
  <Input type="file" accept="image/*" onChange={handleUploadPicture} />
  {editUser.profilePicture && (
    <Box mt={3}>
      <Image
        src={
          editUser.profilePicture.startsWith("data:")
            ? editUser.profilePicture
            : `http://localhost:5000${editUser.profilePicture}`
        }
        alt="Profile"
        width="100px"
        height="100px"
        objectFit="cover"
        borderRadius="md"
      />
    </Box>
  )}
</FormControl>

</ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={handleSaveEdit}>Save</Button>
              <Button ml={3} onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
        </>
      )}

{activeTab === "events" && (
  <Box>
    <Heading size="md" mb={4}>🎉 Manage Events</Heading>
    <Input
      placeholder="Search events..."
      value={eventSearch}
      onChange={(e) => setEventSearch(e.target.value)}
      mb={4}
    />
    <Flex mb={4} gap={3}>
      <Select size="sm" value={eventSortField} onChange={(e) => setEventSortField(e.target.value)}>
        <option value="name">Sort by name</option>
        <option value="category">Sort by category</option>
        <option value="date">Sort by date</option>
      </Select>
      <Button size="sm" onClick={() => setEventSortOrder(eventSortOrder === "asc" ? "desc" : "asc")}>
        {eventSortOrder === "asc" ? "⬆️ Ascending" : "⬇️ Descending"}
      </Button>
    </Flex>

    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Category</Th>
          <Th>Creator</Th>
          <Th>Date</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {filteredEvents.map(event => (
          <Tr key={event._id}>
            <Td>{event.name}</Td>
            <Td>{event.category}</Td>
            <Td>{event.user?.firstName} {event.user?.lastName}</Td>
            <Td>{new Date(event.date).toLocaleDateString()}</Td>
            <Td>
              <Button size="sm" colorScheme="blue" onClick={() => handleEditEvent(event)}>Edit</Button>
              <Button size="sm" colorScheme="red" onClick={() => handleDeleteEvent(event._id)}>Delete</Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
)}

      {activeTab === "galleries" && (
  <Box>
    <Heading size="md" mb={4}>🖼️ Manage galleries</Heading>
    <Input
      placeholder="Search galleries or creators..."
      value={gallerySearch}
      onChange={(e) => setGallerySearch(e.target.value)}
      mb={4}
    />
    <Flex mb={4} gap={3}>
      <Select size="sm" value={gallerySortField} onChange={(e) => setGallerySortField(e.target.value)}>
        <option value="name">Sort by name</option>
        <option value="createdAt">Sort by creation date</option>
      </Select>
      <Button size="sm" onClick={() => setGallerySortOrder(gallerySortOrder === "asc" ? "desc" : "asc")}>
        {gallerySortOrder === "asc" ? "⬆️ Ascending" : "⬇️ Descending"}
      </Button>
    </Flex>

    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Category</Th>
          <Th>Creator</Th>
          <Th>Date</Th>
          <Th>Actions</Th> {/* 👈 Add this */}
        </Tr>
      </Thead>
      <Tbody>
  {filteredGalleries.map(gallery => (
    <Tr key={gallery._id}>
<Td
  onClick={() => navigate(`/galleries/${gallery.owner?.username}/${gallery._id}`)}
  style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
>
  {gallery.name}
</Td>
      <Td>{gallery.category}</Td> {/* ✅ Category acum este pe poziția corectă */}
      <Td>{gallery.owner?.firstName} {gallery.owner?.lastName}</Td>
      <Td>{new Date(gallery.createdAt).toLocaleDateString()}</Td>
      <Td>
        <Button size="sm" colorScheme="blue" onClick={() => handleEditGallery(gallery)}>Edit</Button>
        <Button size="sm" colorScheme="red" onClick={() => handleDeleteGallery(gallery._id)}>Delete</Button>
      </Td>
    </Tr>
  ))}
</Tbody>


    </Table>
  </Box>
)}

{activeTab === "articles" && (
  <Box>
    <Heading size="md" mb={4}>📰 Manage ARTicles</Heading>
    <Input
      placeholder="Search articles or creators..."
      value={articleSearch}
      onChange={(e) => setArticleSearch(e.target.value)}
      mb={4}
    />
    <Flex mb={4} gap={3}>
      <Select size="sm" value={articleSortField} onChange={(e) => setArticleSortField(e.target.value)}>
        <option value="title">Sort by title</option>
        <option value="category">Sort by category</option>
        <option value="createdAt">Sort by creation date</option>
      </Select>
      <Button size="sm" onClick={() => setArticleSortOrder(articleSortOrder === "asc" ? "desc" : "asc")}>
        {articleSortOrder === "asc" ? "⬆️ Ascending" : "⬇️ Descending"}
      </Button>
    </Flex>

    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>Title</Th>
          <Th>Category</Th>
          <Th>Creator</Th>
          <Th>Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {filteredArticles.map(article => (
          <Tr key={article._id}>
            <Td>{article.title}</Td>
            <Td>{article.category}</Td>
            <Td>{article.user?.firstName} {article.user?.lastName}</Td>
            <Td>{new Date(article.createdAt).toLocaleDateString()}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
)}

 {/* ✅ Secțiunea Audit Logs */}
      {activeTab === "logs" && (
        <>
          {loading ? (
            <Spinner />
          ) : (
  
  <Table variant="simple" size="sm" mt={5}>
    <Thead>
      <Tr>
        <Th>Action</Th>
        <Th>Performed By</Th>
        <Th>Target User</Th>
        <Th>Details</Th>
        <Th>Timestamp</Th>
      </Tr>
    </Thead>
    <Tbody>
      {logs.map((log) => (
        <Tr key={log._id}>
          <Td>{log.action}</Td>
          <Td>{log.performedBy.firstName} {log.performedBy.lastName}</Td>
          <Td>{log.targetUser ? `${log.targetUser.firstName} ${log.targetUser.lastName}` : "N/A"}</Td>
          <Td>{log.details}</Td>
          <Td>{new Date(log.timestamp).toLocaleString()}</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
)}
        </>
      )}

      {activeTab === "products" && (
  <Box>
    <Heading size="md" mb={4}>🛍️ Manage art pieces</Heading>

    <Button colorScheme="blue" mb={4} onClick={exportProductsToCSV}>
      Export art pieces (CSV)
    </Button>

    <Input
  placeholder="Search art pieces..."
  value={productSearch}
  onChange={(e) => setProductSearch(e.target.value)}
  mb={4}
/>

<Flex mb={4} gap={3} wrap="wrap">
  <Select size="sm" maxW="200px" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
    <option value="all">All categories</option>
    {[...new Set(products.map(p => p.category))].map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </Select>

  <Select size="sm" maxW="200px" value={saleFilter} onChange={(e) => setSaleFilter(e.target.value)}>
    <option value="all">All statuses</option>
    <option value="forsale">For sale</option>
    <option value="notforsale">Not for sale</option>
  </Select>

  <Select size="sm" maxW="200px" value={productSortField} onChange={(e) => setProductSortField(e.target.value)}>
    <option value="name">Sort by name</option>
    <option value="category">Sort by category</option>
    <option value="createdAt">Sort by date</option>
  </Select>

  <Button size="sm" onClick={() => setProductSortOrder(productSortOrder === "asc" ? "desc" : "asc")}>
    {productSortOrder === "asc" ? "⬆️ Ascending" : "⬇️ Descending"}
  </Button>
</Flex>

    {loading ? (
      <Spinner />
    ) : (
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Category</Th>
            <Th>Creator</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
        {filteredProducts.length > 0 ? (
  filteredProducts.map((product) => (
              <Tr key={product._id}>
<Td
  onClick={() => navigate(`/products/${product._id}`)}
  style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
>
  {product.name}
</Td>
                <Td>{product.category}</Td>
                <Td>{product.user?.firstName} {product.user?.lastName}</Td>
                <Td>
                <Button size="sm" colorScheme="blue" onClick={() => handleEditProduct(product)}>
  Edit
</Button>

                  <Button size="sm" colorScheme="red" onClick={() => handleDeleteProduct(product._id)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr><Td colSpan="6">No products found</Td></Tr>
          )}
        </Tbody>
      </Table>
    )}
  </Box>
)}
  <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Edit Product</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
  <FormControl mb={3}>
    <FormLabel>Name</FormLabel>
    <Input
      value={editProduct?.name || ""}
      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
    />
  </FormControl>

  <FormControl mb={5}>
  <FormLabel>Description</FormLabel>
  <ReactQuill
    theme="snow"
    value={editProduct?.description || ""}
    onChange={(value) => setEditProduct({ ...editProduct, description: value })}
    style={{ height: "200px", marginBottom: "50px" }} // 👈 important
  />
</FormControl>

<FormControl mb={5}>
  <FormLabel>Writing</FormLabel>
  <ReactQuill
    theme="snow"
    value={editProduct?.writing || ""}
    onChange={(value) => setEditProduct({ ...editProduct, writing: value })}
    style={{ height: "200px", marginBottom: "50px" }} // 👈 important
  />
</FormControl>


<FormControl mb={3}>
  <FormLabel>Category</FormLabel>
  <Select
    value={editProduct?.category || "General"}
    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
  >
    {[
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
    ].map((cat) => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </Select>
</FormControl>


  <FormControl mb={3}>
    <FormLabel>Price</FormLabel>
    <Input
      type="number"
      value={editProduct?.price || ""}
      onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
    />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Quantity</FormLabel>
    <Input
      type="number"
      value={editProduct?.quantity || ""}
      onChange={(e) => setEditProduct({ ...editProduct, quantity: Number(e.target.value) })}
    />
  </FormControl>

  <FormControl display="flex" alignItems="center" mb={3}>
  <FormLabel mb="0">Is for sale</FormLabel>
  <Switch
    isChecked={editProduct?.forSale}
    onChange={(e) => setEditProduct({ ...editProduct, forSale: e.target.checked })}
  />
</FormControl>


<FormControl mb={3}>
  <FormLabel>Images</FormLabel>
  <Input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = [...e.target.files];
      const readerPromises = files.map(file => {
        const reader = new FileReader();
        return new Promise(resolve => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readerPromises).then(base64Files => {
        setEditProduct(prev => ({
          ...prev,
          images: [...(prev.images || []), ...base64Files]
        }));
      });
    }}
  />
  <Flex wrap="wrap" mt={2} gap={2}>
    {(editProduct?.images || []).map((img, idx) => (
      <Box key={idx} position="relative">
        <Image src={img} boxSize="80px" objectFit="cover" borderRadius="md" />
        <Button size="xs" colorScheme="red" position="absolute" top="0" right="0"
          onClick={() => {
            setEditProduct(prev => ({
              ...prev,
              images: prev.images.filter((_, i) => i !== idx)
            }));
          }}
        >✕</Button>
      </Box>
    ))}
  </Flex>
</FormControl>

<FormControl mb={5}>
  <FormLabel>Videos</FormLabel>
  <Input
    type="file"
    accept="video/*"
    multiple
    onChange={(e) => {
      const files = [...e.target.files];
      const readerPromises = files.map(file => {
        const reader = new FileReader();
        return new Promise(resolve => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readerPromises).then(base64Files => {
        setEditProduct(prev => ({
          ...prev,
          videos: [...(prev.videos || []), ...base64Files]
        }));
      });
    }}
  />
  <Flex wrap="wrap" mt={3} gap={4}>
    {(editProduct?.videos || []).map((vid, idx) => (
      <Box key={idx} position="relative">
        <video src={vid} controls width="160" height="90" />
        <Button
          size="xs"
          colorScheme="red"
          mt={1}
          onClick={() => {
            setEditProduct(prev => ({
              ...prev,
              videos: prev.videos.filter((_, i) => i !== idx)
            }));
          }}
        >
          ✕ Remove
        </Button>
      </Box>
    ))}
  </Flex>
</FormControl>


<FormControl mb={5}>
  <FormLabel>Audios</FormLabel>
  <Input
    type="file"
    accept="audio/*"
    multiple
    onChange={(e) => {
      const files = [...e.target.files];
      const readerPromises = files.map(file => {
        const reader = new FileReader();
        return new Promise(resolve => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readerPromises).then(base64Files => {
        setEditProduct(prev => ({
          ...prev,
          audios: [...(prev.audios || []), ...base64Files]
        }));
      });
    }}
  />
  <Flex wrap="wrap" direction="column" mt={3} gap={3}>
    {(editProduct?.audios || []).map((audio, idx) => (
      <Box key={idx}>
        <audio src={audio} controls style={{ marginRight: "10px" }} />
        <Button
          size="xs"
          colorScheme="red"
          onClick={() => {
            setEditProduct(prev => ({
              ...prev,
              audios: prev.audios.filter((_, i) => i !== idx)
            }));
          }}
        >
          ✕ Remove
        </Button>
      </Box>
    ))}
  </Flex>
</FormControl>

</ModalBody>


    <ModalFooter>
      <Button colorScheme="blue" onClick={handleSaveProductEdit}>Save</Button>
      <Button ml={3} onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

<ImageCropModal
  isOpen={cropModalOpen}
  onClose={() => setCropModalOpen(false)}
  imageSrc={rawImage}
  onCropComplete={(croppedBase64) => {
    setCroppedImage(croppedBase64);
    setNewProfilePicture(croppedBase64);
    setEditUser((prev) => ({ ...prev, profilePicture: croppedBase64 }));
  }}
/>
<Modal isOpen={isGalleryModalOpen} onClose={() => setIsGalleryModalOpen(false)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Edit Gallery</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
  <FormControl mb={3}>
    <FormLabel>Name</FormLabel>
    <Input
      value={editGallery?.name || ""}
      onChange={(e) => setEditGallery({ ...editGallery, name: e.target.value })}
    />
  </FormControl>

  <FormControl mb={3}>
    <FormLabel>Category</FormLabel>
    <Select
      value={editGallery?.category || "General"}
      onChange={(e) => setEditGallery({ ...editGallery, category: e.target.value })}
    >
      {[
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
      ].map((cat) => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </Select>
  </FormControl>

  <FormControl mb={3}>
  <FormLabel>Description</FormLabel>
  <ReactQuill
    theme="snow"
    value={editGallery?.description || ""}
    onChange={(value) => setEditGallery({ ...editGallery, description: value })}
    style={{ height: "200px", marginBottom: "30px" }}
  />
</FormControl>

  <FormControl mb={3}>
  <FormLabel>Tags (comma-separated)</FormLabel>
  <Input
    value={editGallery?.tags?.join(", ") || ""}
    onChange={(e) =>
      setEditGallery({ ...editGallery, tags: e.target.value.split(",").map(tag => tag.trim()) })
    }
  />
</FormControl>

{editGallery?.collaborators && editGallery.collaborators.length > 0 && (
  <FormControl mb={3}>
    <FormLabel>Collaborators</FormLabel>
    <Flex wrap="wrap" gap={2}>
      {editGallery.collaborators.map((user) => (
        <HStack key={user._id} bg="gray.100" p={2} borderRadius="md">
          <Text>{user.username}</Text>
          <Button
            size="xs"
            colorScheme="red"
            onClick={() =>
              setEditGallery((prev) => ({
                ...prev,
                collaborators: prev.collaborators.filter((u) => u._id !== user._id),
              }))
            }
          >
            ✕
          </Button>
        </HStack>
      ))}
    </Flex>
  </FormControl>
)}

<FormControl mb={3}>
  <FormLabel>Cover Image</FormLabel>
  <Input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawGalleryCover(reader.result);
      setIsGalleryCropOpen(true);
    };
    reader.readAsDataURL(file);
  }}
/>

{editGallery?.coverPhoto && (
  <Box mt={3} maxW="100%" textAlign="center">
    <Image
      src={editGallery.coverPhoto}
      alt="Cover"
      maxH="300px"
      maxW="100%"
      objectFit="contain"
      borderRadius="md"
      boxShadow="md"
    />
  </Box>
)}


</FormControl>



</ModalBody>

    <ModalFooter>
      <Button colorScheme="blue" onClick={handleSaveGalleryEdit}>Save</Button>
      <Button ml={3} onClick={() => setIsGalleryModalOpen(false)}>Cancel</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
<GalleryImageCropModal
  isOpen={isGalleryCropOpen}
  onClose={() => setIsGalleryCropOpen(false)}
  imageSrc={rawGalleryCover}
  onCropComplete={(cropped) => {
    setCroppedGalleryCover(cropped);
    setEditGallery((prev) => ({ ...prev, coverPhoto: cropped }));
  }}
/>


    </Box>
  );
};

export default AdminPanel;

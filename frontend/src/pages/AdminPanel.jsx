import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  Select,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Switch,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import ImageCropModal from '../components/ImageCropModal';
import GalleryImageCropModal from '../components/GalleryImageCropModal';
import EventImageCropModal from '../components/EventImageCropModal';
import { PieChart, Pie, Cell, Legend } from 'recharts';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [actionFilter, setActionFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saleFilter, setSaleFilter] = useState('all');
  const [productSortField, setProductSortField] = useState('name');
  const [productSortOrder, setProductSortOrder] = useState('asc');
  const [articles, setArticles] = useState([]);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleSortField, setArticleSortField] = useState('title');
  const [articleSortOrder, setArticleSortOrder] = useState('asc');
  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventSortField, setEventSortField] = useState('name');
  const [eventSortOrder, setEventSortOrder] = useState('asc');
  const [galleries, setGalleries] = useState([]);
  const [gallerySearch, setGallerySearch] = useState('');
  const [gallerySortField, setGallerySortField] = useState('name');
  const [gallerySortOrder, setGallerySortOrder] = useState('asc');
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
  const [rawEventCover, setRawEventCover] = useState(null);
  const [croppedEventCover, setCroppedEventCover] = useState(null);
  const [isEventCropOpen, setIsEventCropOpen] = useState(false);
  const [eventGalleryFiles, setEventGalleryFiles] = useState([]);
  const [eventAttachments, setEventAttachments] = useState([]);

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [rawArticleCover, setRawArticleCover] = useState(null);
  const [croppedArticleCover, setCroppedArticleCover] = useState(null);
  const [isArticleCropOpen, setIsArticleCropOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSortField, setOrderSortField] = useState('createdAt');
  const [orderSortOrder, setOrderSortOrder] = useState('desc');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await fetch('/api/report', {
        credentials: 'include',
      });
      const data = await res.json();
      setReports(data || []);
    } catch (err) {
      toast({ title: 'Error loading reports', status: 'error' });
    } finally {
      setReportsLoading(false);
    }
  };

  const handleEditGallery = (gallery) => {
    setEditGallery({
      ...gallery,
      tags: Array.isArray(gallery.tags)
        ? gallery.tags
        : typeof gallery.tags === 'string'
          ? gallery.tags.split(',').map((t) => t.trim())
          : [],
    });

    setIsGalleryModalOpen(true);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      toast({ title: 'Error loading orders', status: 'error' });
    }
  };

  const prettifyDetails = (details) => {
    try {
      const parsed = JSON.parse(details.replace(/^Updated fields:\s*/, ''));
      const { profilePicture, ...rest } = parsed;
      return JSON.stringify(rest, null, 2);
    } catch {
      return details;
    }
  };
  const contributorStats = products.reduce((acc, product) => {
    const key = product.user?._id;
    if (!key) return acc;
    if (!acc[key]) {
      acc[key] = {
        name: `${product.user.firstName} ${product.user.lastName}`,
        artworks: 0,
      };
    }
    acc[key].artworks += 1;
    return acc;
  }, {});

  const topContributors = Object.values(contributorStats)
    .sort((a, b) => b.artworks - a.artworks)
    .slice(0, 5);
  const categoryStats = products.reduce((acc, product) => {
    const cat = product.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryStats).map(([category, value]) => ({
    name: category,
    value,
  }));

  const getTargetInfo = (log) => {
    if (log.targetUser) return ` ${log.targetUser.firstName} ${log.targetUser.lastName}`;
    if (log.targetProduct) return `${log.targetProduct.title}`;
    if (log.targetEvent) return `${log.targetEvent.name}`;
    if (log.targetGallery) return `Gallery: ${log.targetGallery.name}`;
    if (log.targetArticle) return ` ${log.targetArticle.title}`;
    return 'N/A';
  };

  const handleEditArticle = (article) => {
    setEditArticle(article);
    setCroppedArticleCover(article.coverImage || null);
    setIsArticleModalOpen(true);
  };

  const handleSaveArticleEdit = async () => {
    try {
      const res = await fetch(`/api/articles/${editArticle._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...editArticle,
          coverImage: croppedArticleCover || editArticle.coverImage,
        }),
      });

      if (!res.ok) throw new Error('Failed to update article');

      toast({ title: 'Article updated successfully', status: 'success' });
      setIsArticleModalOpen(false);
      fetchArticles();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete article');
      toast({ title: 'Article deleted', status: 'success' });
      fetchArticles();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleSaveEventEdit = async () => {
    try {
      const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });

      const galleryBase64 = await Promise.all(eventGalleryFiles.map(fileToBase64));
      const attachmentsData = await Promise.all(
        eventAttachments.map(async (file) => ({
          fileName: file.name,
          fileData: await fileToBase64(file),
        })),
      );

      const updated = {
        ...editEvent,
        coverImage: croppedEventCover || editEvent.coverImage,
        gallery: [...(editEvent.gallery || []), ...galleryBase64],
        attachments: [...(editEvent.attachments || []), ...attachmentsData],
      };

      const response = await fetch(`/api/events/${editEvent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updated),
      });

      if (!response.ok) throw new Error('Failed to update event');
      toast({ title: 'Event updated', status: 'success' });
      setIsEventModalOpen(false);
      fetchEvents();
      setCroppedEventCover(null);
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleSaveGalleryEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editGallery.name);
      formData.append('category', editGallery.category);
      formData.append('description', editGallery.description || '');
      const normalizedTags = Array.isArray(editGallery.tags)
        ? editGallery.tags.join(',')
        : typeof editGallery.tags === 'string'
          ? editGallery.tags
          : '';

      formData.append(
        'tags',
        Array.isArray(editGallery.tags) ? editGallery.tags.join(',') : editGallery.tags || '',
      );

      formData.append(
        'collaborators',
        JSON.stringify(editGallery.collaborators?.map((c) => c._id) || []),
      );

      if (croppedGalleryCover?.startsWith('data:')) {
        const res = await fetch(croppedGalleryCover);
        const blob = await res.blob();
        formData.append('coverPhoto', blob, 'cover.jpg');
      }

      const response = await fetch(`/api/galleries/${editGallery._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update gallery');
      }

      toast({ title: 'Gallery updated', status: 'success' });
      setIsGalleryModalOpen(false);
      fetchGalleries();
      setCroppedGalleryCover(null);
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const res = await fetch(`/api/report/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete report');

      toast({ title: 'Report deleted', status: 'success' });
      fetchReports();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleResolveReport = async (id) => {
    try {
      const res = await fetch(`/api/report/${id}/resolve`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to resolve report');

      toast({ title: 'Report marked as resolved', status: 'success' });
      fetchReports();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery?')) return;

    try {
      const response = await fetch(`/api/galleries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete gallery');

      toast({ title: 'Gallery deleted', status: 'success' });
      fetchGalleries();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleEditEvent = (event) => {
    setEditEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete event');

      toast({ title: 'Event deleted', status: 'success' });
      fetchEvents();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleUploadPicture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const base64 = await convertToBase64(file);
    setRawImage(base64);
    setCropModalOpen(true);
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products', { credentials: 'include' });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      toast({ title: 'Error loading products', status: 'error' });
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProduct),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update product');

      toast({ title: 'Product updated successfully', status: 'success' });
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles', { credentials: 'include' });
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      toast({ title: 'Error loading articles', status: 'error' });
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/audit/logs', { credentials: 'include' });
      const data = await response.json();

      const sortedLogs = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setLogs(sortedLogs);
    } catch (err) {
      toast({ title: 'Error fetching logs', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleries = async () => {
    try {
      const res = await fetch('/api/galleries', { credentials: 'include' });
      const data = await res.json();
      setGalleries(data.galleries || []);
    } catch (err) {
      toast({ title: 'Error loading galleries', status: 'error' });
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'galleries') {
      fetchGalleries();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'articles') {
      fetchArticles();
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      eventGalleryFiles.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [eventGalleryFiles]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      toast({ title: 'Product deleted', status: 'success' });
      fetchProducts();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const exportProductsToCSV = () => {
    if (products.length === 0) {
      toast({ title: 'No products to export', status: 'warning' });
      return;
    }

    const csvData = Papa.unparse(
      products.map((prod) => ({
        ID: prod._id,
        Title: prod.name,
        Price: prod.price,
        Category: prod.category,
        Creator: `${prod.user?.firstName} ${prod.user?.lastName}`,
        CreatedAt: new Date(prod.createdAt).toLocaleDateString(),
      })),
    );

    const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(csvBlob, 'products_export.csv');
    toast({ title: 'Products exported', status: 'success' });
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
      const response = await fetch('/api/users/me', { credentials: 'include' });
      const data = await response.json();
      if (!data || !data.role) navigate('/');
      if (data.role !== 'admin' && data.role !== 'admin') navigate('/');
      setCurrentUser(data);
    } catch (err) {
      navigate('/');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast({ title: 'Error fetching users', status: 'error' });
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setNewPassword('');
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
        quote: editUser.quote,
      };

      if (newPassword) {
        updateData.password = newPassword;
      }

      if (croppedImage) {
        updateData.profilePicture = croppedImage;
      }

      const response = await fetch(`/api/admin/users/${editUser._id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update user');

      toast({ title: 'User updated successfully', status: 'success' });
      onClose();
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events', { credentials: 'include' });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      toast({ title: 'Error loading events', status: 'error' });
    }
  };

  const handleBlockUser = async (user) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update user status');

      if (user._id === currentUser._id) {
        localStorage.removeItem('art-corner');
        window.location.href = '/login';
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u)),
      );

      toast({
        title: `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`,
        status: 'success',
      });
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting user');
      }

      toast({ title: 'User deleted successfully', status: 'success' });
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating role');
      }

      toast({ title: 'Role updated successfully', status: 'success' });
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const exportUsersToCSV = () => {
    if (users.length === 0) {
      toast({ title: 'No users to export', status: 'warning' });
      return;
    }

    const csvData = Papa.unparse(
      users.map((user) => ({
        ID: user._id,
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Role: user.role,
        Status: user.isBlocked ? 'Blocked' : 'Active',
      })),
    );

    const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(csvBlob, 'users_list.csv');
    toast({ title: 'Users exported successfully!', status: 'success' });
  };

  const filteredOrders = orders
    .filter(
      (order) =>
        order.user?.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order._id.includes(orderSearch),
    )
    .sort((a, b) => {
      const valA = a[orderSortField];
      const valB = b[orderSortField];
      if (valA < valB) return orderSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return orderSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredUsers = users
    .filter(
      (user) =>
        (roleFilter === 'all' || user.role === roleFilter) &&
        (statusFilter === 'all' ||
          (statusFilter === 'active' ? !user.isBlocked : user.isBlocked)) &&
        (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      const fieldA = a[sortField]?.toString().toLowerCase() || '';
      const fieldB = b[sortField]?.toString().toLowerCase() || '';
      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredProducts = products
    .filter(
      (product) =>
        (categoryFilter === 'all' || product.category === categoryFilter) &&
        (saleFilter === 'all' || (saleFilter === 'forsale' ? product.forSale : !product.forSale)) &&
        (product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.category.toLowerCase().includes(productSearch.toLowerCase()) ||
          `${product.user?.firstName || ''} ${product.user?.lastName || ''}`
            .toLowerCase()
            .includes(productSearch.toLowerCase())),
    )
    .sort((a, b) => {
      const valA = a[productSortField]?.toString().toLowerCase() || '';
      const valB = b[productSortField]?.toString().toLowerCase() || '';
      if (valA < valB) return productSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return productSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredArticles = articles
    .filter(
      (article) =>
        article.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
        `${article.user?.firstName || ''} ${article.user?.lastName || ''}`
          .toLowerCase()
          .includes(articleSearch.toLowerCase()),
    )
    .sort((a, b) => {
      const valA = a[articleSortField]?.toString().toLowerCase() || '';
      const valB = b[articleSortField]?.toString().toLowerCase() || '';
      if (valA < valB) return articleSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return articleSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredEvents = events
    .filter(
      (event) =>
        event.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
        `${event.user?.firstName || ''} ${event.user?.lastName || ''}`
          .toLowerCase()
          .includes(eventSearch.toLowerCase()),
    )
    .sort((a, b) => {
      const valA = a[eventSortField]?.toString().toLowerCase() || '';
      const valB = b[eventSortField]?.toString().toLowerCase() || '';
      if (valA < valB) return eventSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return eventSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const filteredGalleries = galleries
    .filter(
      (gallery) =>
        gallery.name.toLowerCase().includes(gallerySearch.toLowerCase()) ||
        `${gallery.user?.firstName || ''} ${gallery.user?.lastName || ''}`
          .toLowerCase()
          .includes(gallerySearch.toLowerCase()),
    )
    .sort((a, b) => {
      const valA = a[gallerySortField]?.toString().toLowerCase() || '';
      const valB = b[gallerySortField]?.toString().toLowerCase() || '';
      if (valA < valB) return gallerySortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return gallerySortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => !user.isBlocked).length;
  const blockedUsers = users.filter((user) => user.isBlocked).length;

  const userRegistrationsPerMonth = users.reduce((acc, user) => {
    const month = new Date(user.createdAt).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const registrationData = Object.entries(userRegistrationsPerMonth).map(([month, count]) => ({
    month,
    count,
  }));

  const filteredLogs = logs.filter(
    (log) =>
      (actionFilter === 'all' || log.action === actionFilter) &&
      (log.performedBy.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedBy.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const exportLogsToCSV = () => {
    if (logs.length === 0) {
      toast({ title: 'No logs to export', status: 'warning' });
      return;
    }
    const csvData = Papa.unparse(
      logs.map((log) => ({
        Action: log.action,
        PerformedBy: `${log.performedBy.firstName} ${log.performedBy.lastName}`,
        Details: log.details,
        Timestamp: new Date(log.timestamp).toLocaleString(),
      })),
    );
    const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(csvBlob, 'audit_logs.csv');
    toast({ title: 'Logs exported successfully!', status: 'success' });
  };

  return (
    <Box width="100%" maxWidth="1200px" mx="auto" p={4}>
      <Flex direction="column" width="100%" align="stretch">
        <Heading mb={4} textAlign="center">
          Admin Panel
        </Heading>{' '}
        <Box mb={5} display="flex" gap={4}>
          <Box width="100%" display="flex" justifyContent="center" mb={5}>
            <Flex justify="center" wrap="wrap" mb={5} gap={4}>
              <Button
                colorScheme={activeTab === 'users' ? 'blue' : 'gray'}
                onClick={() => setActiveTab('users')}
              >
                Users
              </Button>
              <Button
                colorScheme={activeTab === 'products' ? 'blue' : 'gray'}
                onClick={() => setActiveTab('products')}
              >
                Artworks
              </Button>
              <Button
                colorScheme={activeTab === 'events' ? 'blue' : 'gray'}
                onClick={() => {
                  setActiveTab('events');
                  fetchEvents();
                }}
              >
                Events
              </Button>

              <Button
                onClick={() => {
                  setActiveTab('galleries');
                  fetchGalleries();
                }}
              >
                Galleries
              </Button>
              <Button
                onClick={() => {
                  setActiveTab('articles');
                  fetchArticles();
                }}
              >
                ARTicles
              </Button>
              <Button
                colorScheme={activeTab === 'orders' ? 'blue' : 'gray'}
                onClick={() => {
                  setActiveTab('orders');
                  fetchOrders();
                }}
              >
                Orders
              </Button>

              <Button
                colorScheme={activeTab === 'logs' ? 'blue' : 'gray'}
                onClick={() => {
                  setActiveTab('logs');
                  fetchLogs();
                }}
              >
                View audit logs
              </Button>
              <Button
                colorScheme={activeTab === 'dashboard' ? 'blue' : 'gray'}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                colorScheme={activeTab === 'reports' ? 'blue' : 'gray'}
                onClick={() => {
                  setActiveTab('reports');
                  fetchReports();
                }}
              >
                Reports
              </Button>
            </Flex>
          </Box>
        </Box>
        {activeTab === 'dashboard' && (
          <Box>
            {}
            <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={6}>
              <Box p={4} border="1px solid gray" borderRadius="md">
                Total Users: {users.length}
              </Box>
              <Box p={4} border="1px solid gray" borderRadius="md">
                Active Users: {activeUsers}
              </Box>
              <Box p={4} border="1px solid gray" borderRadius="md">
                Blocked Users: {blockedUsers}
              </Box>
              <Box p={4} border="1px solid gray" borderRadius="md">
                Total Articles: {articles.length}
              </Box>
              <Box p={4} border="1px solid gray" borderRadius="md">
                Total Events: {events.length}
              </Box>
              <Box p={4} border="1px solid gray" borderRadius="md">
                Total Galleries: {galleries.length}
              </Box>
              <Box p={4} border="1px solid gray" borderRadius="md">
                Total Artworks: {products.length}
              </Box>
            </SimpleGrid>

            {}
            <SimpleGrid columns={[1, null, 2]} spacing={6}>
              <Box>
                <Heading size="md" mb={4}>
                  User Registrations Per Month
                </Heading>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={registrationData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3182ce" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box>
                <Heading size="md" mb={4}>
                  Artworks by Category
                </Heading>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 47}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </SimpleGrid>

            {}
            <SimpleGrid columns={[1, null, 2]} spacing={6} mt={8}>
              <Box>
                <Heading size="md" mb={2}>
                  Top Contributors
                </Heading>
                <Box maxH="300px" overflowY="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Artworks</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topContributors.map((contrib, index) => (
                        <Tr key={index}>
                          <Td>{contrib.name}</Td>
                          <Td>{contrib.artworks}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>

              <Box>
                <Heading size="md" mb={2}>
                  🕒 Recent Users
                </Heading>
                <Box maxH="300px" overflowY="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Joined</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 10)
                        .map((user) => (
                          <Tr key={user._id}>
                            <Td>
                              {user.firstName} {user.lastName}
                            </Td>
                            <Td>{user.email}</Td>
                            <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </SimpleGrid>
          </Box>
        )}
        {activeTab === 'users' && (
          <>
            <Heading textAlign="center" size="md" mb={4}>
              Manage users
            </Heading>

            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {}
            <Flex mt={4} direction="row" gap={2}>
              <Select
                size="sm"
                maxWidth="200px"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="admin">admin</option>
              </Select>

              <Select
                size="sm"
                maxWidth="200px"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </Select>

              <Select
                size="sm"
                maxWidth="200px"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="firstName">Sort by name</option>
                <option value="username">Sort by username</option>
                <option value="createdAt">Sort by creation date</option>
              </Select>

              <Button size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending'}
              </Button>
              <Button colorScheme="blue" size={'sm'} onClick={exportUsersToCSV}>
                Export Users (CSV)
              </Button>
            </Flex>

            {}
            {loading ? (
              <Spinner />
            ) : (
              <Box width="100%">
                <Table variant="simple" width="100%">
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
                            style={{
                              cursor: 'pointer',
                              color: 'blue',
                              textDecoration: 'underline',
                            }}
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
                            </Select>
                          </Td>
                          <Td display="flex" gap={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              colorScheme={user.isBlocked ? 'green' : 'red'}
                              onClick={() => handleBlockUser(user)}
                            >
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteUser(user._id)}
                              isDisabled={user.role === 'admin'}
                            >
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
              </Box>
            )}

            {editUser && (
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Edit User</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Flex direction="column" align="center" width="100%">
                      <FormControl mb={3}>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          value={editUser.firstName}
                          onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          value={editUser.lastName}
                          onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Email</FormLabel>
                        <Input
                          value={editUser.email}
                          onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Bio</FormLabel>
                        <Textarea
                          value={editUser.bio}
                          onChange={(e) => setEditUser({ ...editUser, bio: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          value={editUser.gender || ''}
                          onChange={(e) => setEditUser({ ...editUser, gender: e.target.value })}
                        >
                          <option value="">Select Gender</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Nonbinary">Nonbinary</option>
                          <option value="More options">More options</option>
                        </Select>
                      </FormControl>

                      {editUser.gender === 'More options' && (
                        <FormControl>
                          <FormLabel>Custom Gender</FormLabel>
                          <Input
                            value={editUser.customGender || ''}
                            onChange={(e) =>
                              setEditUser({ ...editUser, customGender: e.target.value })
                            }
                          />
                        </FormControl>
                      )}

                      <FormControl mt={1} mb={3}>
                        <FormLabel>Pronouns</FormLabel>
                        <Input
                          value={editUser.pronouns || ''}
                          onChange={(e) => setEditUser({ ...editUser, pronouns: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Address</FormLabel>
                        <Input
                          value={editUser.address || ''}
                          onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>City</FormLabel>
                        <Input
                          value={editUser.city || ''}
                          onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Country</FormLabel>
                        <Input
                          value={editUser.country || ''}
                          onChange={(e) => setEditUser({ ...editUser, country: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Phone</FormLabel>
                        <Input
                          value={editUser.phone || ''}
                          onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Hobbies</FormLabel>
                        <Input
                          value={editUser.hobbies || ''}
                          onChange={(e) => setEditUser({ ...editUser, hobbies: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Profession</FormLabel>
                        <Input
                          value={editUser.profession}
                          onChange={(e) => setEditUser({ ...editUser, profession: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Location</FormLabel>
                        <Input
                          value={editUser.location}
                          onChange={(e) => setEditUser({ ...editUser, location: e.target.value })}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>New Password (optional)</FormLabel>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </FormControl>

                      <FormControl mb={3}>
                        <FormLabel>Quote</FormLabel>
                        <Input
                          value={editUser.quote || ''}
                          onChange={(e) => setEditUser({ ...editUser, quote: e.target.value })}
                        />
                      </FormControl>
                      <FormControl mb={3}>
                        <FormLabel>Profile Picture</FormLabel>
                        <Input type="file" accept="image/*" onChange={handleUploadPicture} />
                        {editUser.profilePicture && (
                          <Box mt={3}>
                            <Image
                              src={
                                editUser.profilePicture.startsWith('data:')
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
                    </Flex>
                  </ModalBody>

                  <ModalFooter>
                    <Button colorScheme="blue" onClick={handleSaveEdit}>
                      Save
                    </Button>
                    <Button ml={3} onClick={onClose}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )}
          </>
        )}
        {activeTab === 'events' && (
          <Box>
            <Heading textAlign="center" size="md" mb={4}>
              Manage events
            </Heading>

            {}
            <Input
              placeholder="Search events..."
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              mb={4}
            />

            {}
            <Flex wrap="wrap" gap={3} mb={4}>
              <Select
                size="sm"
                maxW="200px"
                value={eventSortField}
                onChange={(e) => setEventSortField(e.target.value)}
              >
                <option value="name">Sort by name</option>
                <option value="category">Sort by category</option>
                <option value="date">Sort by date</option>
              </Select>

              <Button
                size="sm"
                onClick={() => setEventSortOrder(eventSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {eventSortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending'}
              </Button>

              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => {
                  if (filteredEvents.length === 0) {
                    toast({ title: 'No events to export', status: 'warning' });
                    return;
                  }

                  const csv = Papa.unparse(
                    filteredEvents.map((evt) => ({
                      Name: evt.name,
                      Category: evt.category,
                      Creator: `${evt.user?.firstName || ''} ${evt.user?.lastName || ''}`,
                      Date: new Date(evt.date).toLocaleDateString(),
                    })),
                  );

                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  saveAs(blob, 'events.csv');
                  toast({ title: 'Events exported successfully', status: 'success' });
                }}
              >
                Export Events (CSV)
              </Button>
            </Flex>

            <Box width="100%">
              <Table width="100%" variant="simple">
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
                  {filteredEvents.map((event) => (
                    <Tr key={event._id}>
                      <Td
                        onClick={() => navigate(`/events/${event._id}`)}
                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                      >
                        {event.name}
                      </Td>
                      <Td>{event.category}</Td>
                      <Td>
                        {event.user?.firstName} {event.user?.lastName}
                      </Td>
                      <Td>{new Date(event.date).toLocaleDateString()}</Td>
                      <Td display="flex" gap={2}>
                        <Button size="sm" colorScheme="blue" onClick={() => handleEditEvent(event)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
        {activeTab === 'galleries' && (
          <Box>
            <Heading textAlign="center" size="md" mb={4}>
              Manage Galleries
            </Heading>
            <Input
              placeholder="Search galleries..."
              value={gallerySearch}
              onChange={(e) => setGallerySearch(e.target.value)}
              mb={4}
            />

            <Flex wrap="wrap" gap={3} mb={4}>
              <Select
                size="sm"
                value={gallerySortField}
                onChange={(e) => setGallerySortField(e.target.value)}
                maxW="200px"
              >
                <option value="name">Sort by name</option>
                <option value="category">Sort by category</option>
                <option value="createdAt">Sort by date</option>
              </Select>
              <Button
                size="sm"
                onClick={() => setGallerySortOrder(gallerySortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {gallerySortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending'}
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => {
                  if (filteredGalleries.length === 0) {
                    toast({ title: 'No galleries to export', status: 'warning' });
                    return;
                  }
                  const csvData = Papa.unparse(
                    filteredGalleries.map((g) => ({
                      Name: g.name,
                      Category: g.category,
                      Creator: `${g.owner?.firstName || ''} ${g.owner?.lastName || ''}`,
                      Date: new Date(g.createdAt).toLocaleDateString(),
                    })),
                  );
                  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                  saveAs(blob, 'galleries.csv');
                  toast({ title: 'Galleries exported successfully', status: 'success' });
                }}
              >
                Export Galleries (CSV)
              </Button>
            </Flex>

            <Box width="100%">
              <Table width="100%" variant="simple">
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
                  {filteredGalleries.length > 0 ? (
                    filteredGalleries.map((gallery) => (
                      <Tr key={gallery._id}>
                        <Td
                          onClick={() => navigate(`/galleries/${gallery._id}`)}
                          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                        >
                          {gallery.name}
                        </Td>
                        <Td>{gallery.category}</Td>
                        <Td>
                          {gallery.owner?.firstName} {gallery.owner?.lastName}
                        </Td>
                        <Td>{new Date(gallery.createdAt).toLocaleDateString()}</Td>
                        <Td display="flex" gap={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditGallery(gallery)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteGallery(gallery._id)}
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5}>No galleries found</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
        {activeTab === 'articles' && (
          <Box>
            <Heading textAlign="center" size="md" mb={4}>
              Manage ARTicles
            </Heading>

            <Input
              placeholder="Search articles or creators..."
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              mb={4}
            />

            <Flex wrap="wrap" gap={3} mb={4}>
              <Select
                size="sm"
                value={articleSortField}
                onChange={(e) => setArticleSortField(e.target.value)}
                maxW="200px"
              >
                <option value="title">Sort by title</option>
                <option value="category">Sort by category</option>
                <option value="createdAt">Sort by creation date</option>
              </Select>

              <Button
                size="sm"
                onClick={() => setArticleSortOrder(articleSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {articleSortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending'}
              </Button>

              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => {
                  if (filteredArticles.length === 0) {
                    toast({ title: 'No articles to export', status: 'warning' });
                    return;
                  }

                  const csvData = Papa.unparse(
                    filteredArticles.map((article) => ({
                      Title: article.title,
                      Category: article.category,
                      Creator: `${article.user?.firstName || ''} ${article.user?.lastName || ''}`,
                      Date: new Date(article.createdAt).toLocaleDateString(),
                    })),
                  );

                  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                  saveAs(blob, 'articles.csv');
                  toast({ title: 'Articles exported successfully', status: 'success' });
                }}
              >
                Export Articles (CSV)
              </Button>
            </Flex>

            <Box width="100%">
              <Table width="100%" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Category</Th>
                    <Th>Creator</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                      <Tr key={article._id}>
                        <Td
                          onClick={() => navigate(`/articles/${article._id}`)}
                          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                        >
                          {article.title}
                        </Td>
                        <Td>{article.category}</Td>
                        <Td>
                          {article.user?.firstName} {article.user?.lastName}
                        </Td>
                        <Td>{new Date(article.createdAt).toLocaleDateString()}</Td>
                        <Td display="flex" gap={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditArticle(article)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteArticle(article._id)}
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5}>No articles found</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
        {activeTab === 'orders' && (
          <Box>
            <Heading textAlign="center" size="md" mb={4}>
              Manage Orders
            </Heading>

            <Input
              placeholder="Search by user email or order ID..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              mb={4}
            />

            <Flex gap={3} wrap="wrap" mb={4}>
              <Select
                size="sm"
                value={orderSortField}
                onChange={(e) => setOrderSortField(e.target.value)}
                maxW="200px"
              >
                <option value="createdAt">Sort by date</option>
                <option value="total">Sort by total</option>
              </Select>
              <Button
                size="sm"
                onClick={() => setOrderSortOrder(orderSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {orderSortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending'}
              </Button>
            </Flex>

            <Box width="100%">
              <Table width="100%" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Order ID</Th>
                    <Th>User</Th>
                    <Th>Total</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <Tr key={order._id}>
                        <Td>{order._id}</Td>
                        <Td>
                          {order.user?.firstName} {order.user?.lastName}
                        </Td>
                        <Td>${order.total.toFixed(2)}</Td>
                        <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                        <Td>{order.status}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan="5">No orders found</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
        {}
        {activeTab === 'logs' && (
          <>
            {loading ? (
              <Spinner />
            ) : (
              <Box width="100%">
                <Table width="100%" variant="simple">
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
                        <Td>
                          {log.performedBy.firstName} {log.performedBy.lastName}
                        </Td>
                        <Td>{getTargetInfo(log)}</Td> {}
                        <Td
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxWidth: '400px',
                            fontSize: 'smaller',
                          }}
                        >
                          <pre>{prettifyDetails(log.details)}</pre>
                        </Td>
                        <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </>
        )}
        {activeTab === 'products' && (
          <Box>
            <Heading textAlign="center" size="md" mb={4}>
              Manage artworks
            </Heading>

            <Input
              placeholder="Search artworks..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              mb={4}
            />

            <Flex mb={4} gap={3} wrap="wrap">
              <Select
                size="sm"
                maxW="200px"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                {[...new Set(products.map((p) => p.category))].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select
                size="sm"
                maxW="200px"
                value={saleFilter}
                onChange={(e) => setSaleFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="forsale">For sale</option>
                <option value="notforsale">Not for sale</option>
              </Select>

              <Select
                size="sm"
                maxW="200px"
                value={productSortField}
                onChange={(e) => setProductSortField(e.target.value)}
              >
                <option value="name">Sort by name</option>
                <option value="category">Sort by category</option>
                <option value="createdAt">Sort by date</option>
              </Select>

              <Button
                size="sm"
                onClick={() => setProductSortOrder(productSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {productSortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending'}
              </Button>
              <Button size={'sm'} colorScheme="blue" onClick={exportProductsToCSV}>
                Export artworks (CSV)
              </Button>
            </Flex>

            {loading ? (
              <Spinner />
            ) : (
              <Box width="100%">
                <Table width="100%" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
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
                            style={{
                              cursor: 'pointer',
                              color: 'blue',
                              textDecoration: 'underline',
                            }}
                          >
                            {product.title}
                          </Td>
                          <Td>{product.category}</Td>
                          <Td>
                            {product.user?.firstName} {product.user?.lastName}
                          </Td>
                          <Td display="flex" gap={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan="6">No artworks found</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        )}
        {activeTab === 'reports' && (
          <Box>
            <Heading textAlign="center" size="md" mb={4}>
              User Reports
            </Heading>

            {reportsLoading ? (
              <Spinner />
            ) : (
              <Box overflowX="hidden">
                <Table variant="simple" width="100%" tableLayout="fixed">
                  <Thead>
                    <Tr>
                      <Th>Reporter</Th>
                      <Th>Reported User</Th>
                      <Th>Reason</Th>
                      <Th>Details</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <Tr 
                        key={report._id}
                        opacity={report.resolved ? 0.6 : 1}
                        bg={report.resolved ? 'gray.50' : 'transparent'}
                        >
                          <Td>
                            {report.reporter?.firstName} {report.reporter?.lastName}
                          </Td>
                          <Td>
                            {report.reportedUser?.firstName} {report.reportedUser?.lastName}
                          </Td>
                          <Td>{report.reason}</Td>
                          <Td
                            whiteSpace="pre-wrap"
                            maxWidth="250px"
                            overflowY="auto"
                            overflowX="hidden"
                            style={{
                              maxHeight: '100px',
                              display: 'block',
                            }}
                          >
                            {report.details}
                          </Td>
                          <Td>{new Date(report.date).toLocaleString()}</Td>
                          <Td display="flex" gap={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleResolveReport(report._id)}
                              isDisabled={report.resolved} 
                            >
                              {report.resolved ? 'Resolved' : 'Mark Resolved'}
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteReport(report._id)}
                            >
                              Delete
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan="5">No reports found</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        )}
        <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Product</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Flex direction="column" align="center" width="100%">
                <FormControl mb={3}>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={editProduct?.title || ''}
                    onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={5}>
                  <FormLabel>Description</FormLabel>
                  <ReactQuill
                    theme="snow"
                    value={editProduct?.description || ''}
                    onChange={(value) => setEditProduct({ ...editProduct, description: value })}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </FormControl>

                <FormControl mb={5}>
                  <FormLabel>Writing</FormLabel>
                  <ReactQuill
                    theme="snow"
                    value={editProduct?.writing || ''}
                    onChange={(value) => setEditProduct({ ...editProduct, writing: value })}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={editProduct?.category || 'General'}
                    onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  >
                    {[
                      'General',
                      'Photography',
                      'Painting',
                      'Drawing',
                      'Sketch',
                      'Illustration',
                      'Digital Art',
                      'Pixel Art',
                      '3D Art',
                      'Animation',
                      'Graffiti',
                      'Calligraphy',
                      'Typography',
                      'Collage',
                      'Mixed Media',
                      'Sculpture',
                      'Installation',
                      'Fashion',
                      'Textile',
                      'Architecture',
                      'Interior Design',
                      'Product Design',
                      'Graphic Design',
                      'UI/UX',
                      'Music',
                      'Instrumental',
                      'Vocal',
                      'Rap',
                      'Spoken Word',
                      'Podcast',
                      'Sound Design',
                      'Film',
                      'Short Film',
                      'Documentary',
                      'Cinematography',
                      'Video Art',
                      'Performance',
                      'Dance',
                      'Theatre',
                      'Acting',
                      'Poetry',
                      'Writing',
                      'Essay',
                      'Prose',
                      'Fiction',
                      'Non-fiction',
                      'Journal',
                      'Comics',
                      'Manga',
                      'Zine',
                      'Fantasy Art',
                      'Surrealism',
                      'Realism',
                      'Abstract',
                      'Minimalism',
                      'Expressionism',
                      'Pop Art',
                      'Concept Art',
                      'AI Art',
                      'Experimental',
                      'Political Art',
                      'Activist Art',
                      'Environmental Art',
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Price</FormLabel>
                  <Input
                    type="number"
                    value={editProduct?.price || ''}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: Number(e.target.value) })
                    }
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    type="number"
                    value={editProduct?.quantity || ''}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, quantity: Number(e.target.value) })
                    }
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
                      const readerPromises = files.map((file) => {
                        const reader = new FileReader();
                        return new Promise((resolve) => {
                          reader.onloadend = () => resolve(reader.result);
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readerPromises).then((base64Files) => {
                        setEditProduct((prev) => ({
                          ...prev,
                          images: [...(prev.images || []), ...base64Files],
                        }));
                      });
                    }}
                  />
                  <Flex wrap="wrap" mt={2} gap={2}>
                    {(editProduct?.images || []).map((img, idx) => (
                      <Box key={idx} position="relative">
                        <Image src={img} boxSize="80px" objectFit="cover" borderRadius="md" />
                        <Button
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="0"
                          right="0"
                          onClick={() => {
                            setEditProduct((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }));
                          }}
                        >
                          ✕
                        </Button>
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
                      const readerPromises = files.map((file) => {
                        const reader = new FileReader();
                        return new Promise((resolve) => {
                          reader.onloadend = () => resolve(reader.result);
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readerPromises).then((base64Files) => {
                        setEditProduct((prev) => ({
                          ...prev,
                          videos: [...(prev.videos || []), ...base64Files],
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
                            setEditProduct((prev) => ({
                              ...prev,
                              videos: prev.videos.filter((_, i) => i !== idx),
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
                      const readerPromises = files.map((file) => {
                        const reader = new FileReader();
                        return new Promise((resolve) => {
                          reader.onloadend = () => resolve(reader.result);
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readerPromises).then((base64Files) => {
                        setEditProduct((prev) => ({
                          ...prev,
                          audios: [...(prev.audios || []), ...base64Files],
                        }));
                      });
                    }}
                  />
                  <Flex wrap="wrap" direction="column" mt={3} gap={3}>
                    {(editProduct?.audios || []).map((audio, idx) => (
                      <Box key={idx}>
                        <audio src={audio} controls style={{ marginRight: '10px' }} />
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => {
                            setEditProduct((prev) => ({
                              ...prev,
                              audios: prev.audios.filter((_, i) => i !== idx),
                            }));
                          }}
                        >
                          ✕ Remove
                        </Button>
                      </Box>
                    ))}
                  </Flex>
                </FormControl>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={handleSaveProductEdit}>
                Save
              </Button>
              <Button ml={3} onClick={() => setIsProductModalOpen(false)}>
                Cancel
              </Button>
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
              <Flex direction="column" align="center" width="100%">
                <FormControl mb={3}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={editGallery?.name || ''}
                    onChange={(e) => setEditGallery({ ...editGallery, name: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={editGallery?.category || 'General'}
                    onChange={(e) => setEditGallery({ ...editGallery, category: e.target.value })}
                  >
                    {[
                      'General',
                      'Photography',
                      'Painting',
                      'Drawing',
                      'Sketch',
                      'Illustration',
                      'Digital Art',
                      'Pixel Art',
                      '3D Art',
                      'Animation',
                      'Graffiti',
                      'Calligraphy',
                      'Typography',
                      'Collage',
                      'Mixed Media',
                      'Sculpture',
                      'Installation',
                      'Fashion',
                      'Textile',
                      'Architecture',
                      'Interior Design',
                      'Product Design',
                      'Graphic Design',
                      'UI/UX',
                      'Music',
                      'Instrumental',
                      'Vocal',
                      'Rap',
                      'Spoken Word',
                      'Podcast',
                      'Sound Design',
                      'Film',
                      'Short Film',
                      'Documentary',
                      'Cinematography',
                      'Video Art',
                      'Performance',
                      'Dance',
                      'Theatre',
                      'Acting',
                      'Poetry',
                      'Writing',
                      'Essay',
                      'Prose',
                      'Fiction',
                      'Non-fiction',
                      'Journal',
                      'Comics',
                      'Manga',
                      'Zine',
                      'Fantasy Art',
                      'Surrealism',
                      'Realism',
                      'Abstract',
                      'Minimalism',
                      'Expressionism',
                      'Pop Art',
                      'Concept Art',
                      'AI Art',
                      'Experimental',
                      'Political Art',
                      'Activist Art',
                      'Environmental Art',
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Description</FormLabel>
                  <ReactQuill
                    theme="snow"
                    value={editGallery?.description || ''}
                    onChange={(value) => setEditGallery({ ...editGallery, description: value })}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={editGallery?.tags?.join(', ') || ''}
                    onChange={(e) =>
                      setEditGallery({
                        ...editGallery,
                        tags: e.target.value.split(',').map((tag) => tag.trim()),
                      })
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
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={handleSaveGalleryEdit}>
                Save
              </Button>
              <Button ml={3} onClick={() => setIsGalleryModalOpen(false)}>
                Cancel
              </Button>
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
        <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Event</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" align="center" width="100%">
                <FormControl mb={3}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={editEvent?.name || ''}
                    onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Description</FormLabel>
                  <ReactQuill
                    theme="snow"
                    value={editEvent?.description || ''}
                    onChange={(val) => setEditEvent({ ...editEvent, description: val })}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={editEvent?.date?.substring(0, 10) || ''}
                    onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={editEvent?.time || ''}
                    onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={editEvent?.location || ''}
                    onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={editEvent?.category || ''}
                    onChange={(e) => setEditEvent({ ...editEvent, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {[
                      'Music',
                      'Art',
                      'Tech',
                      'Workshop',
                      'Theatre',
                      'Festival',
                      'Literature',
                      'Exhibition',
                      'Dance',
                      'Film',
                      'Charity',
                      'Community',
                      'Education',
                      'Other',
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Tags</FormLabel>
                  <Input
                    value={editEvent?.tags?.join(', ') || ''}
                    onChange={(e) =>
                      setEditEvent({
                        ...editEvent,
                        tags: e.target.value.split(',').map((t) => t.trim()),
                      })
                    }
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Ticket Type</FormLabel>
                  <Select
                    value={editEvent?.ticketType || 'free'}
                    onChange={(e) => setEditEvent({ ...editEvent, ticketType: e.target.value })}
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="donation">Donation</option>
                  </Select>
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Price</FormLabel>
                  <Input
                    type="number"
                    value={editEvent?.price || ''}
                    onChange={(e) => setEditEvent({ ...editEvent, price: Number(e.target.value) })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Language</FormLabel>
                  <Input
                    value={editEvent?.language || ''}
                    onChange={(e) => setEditEvent({ ...editEvent, language: e.target.value })}
                  />
                </FormControl>

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
                        setRawEventCover(reader.result);
                        setIsEventCropOpen(true);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {croppedEventCover || editEvent?.coverImage ? (
                    <Image
                      src={croppedEventCover || editEvent.coverImage}
                      alt="Cover"
                      mt={3}
                      borderRadius="md"
                    />
                  ) : null}
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Gallery Images</FormLabel>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setEventGalleryFiles([...e.target.files])}
                  />
                </FormControl>
                {(editEvent?.gallery?.length > 0 || eventGalleryFiles.length > 0) && (
                  <Flex wrap="wrap" gap={2} mt={2}>
                    {}
                    {editEvent?.gallery?.map((imgUrl, idx) => (
                      <Box key={`existing-${idx}`} position="relative">
                        <Image
                          src={imgUrl}
                          alt={`Gallery ${idx}`}
                          boxSize="100px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <Button
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="0"
                          right="0"
                          onClick={() =>
                            setEditEvent((prev) => ({
                              ...prev,
                              gallery: prev.gallery.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          ✕
                        </Button>
                      </Box>
                    ))}

                    {}
                    {eventGalleryFiles.map((file, idx) => {
                      const previewUrl = URL.createObjectURL(file);
                      return (
                        <Box key={`new-${idx}`} position="relative">
                          <Image
                            src={previewUrl}
                            alt={`New Gallery ${idx}`}
                            boxSize="100px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <Button
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top="0"
                            right="0"
                            onClick={() =>
                              setEventGalleryFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                          >
                            ✕
                          </Button>
                        </Box>
                      );
                    })}
                  </Flex>
                )}

                <FormControl mb={3}>
                  <FormLabel>Attachments</FormLabel>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => setEventAttachments([...e.target.files])}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            {editEvent?.attachments?.length > 0 && (
              <Box mt={2}>
                {editEvent.attachments.map((att, idx) => (
                  <Flex key={idx} align="center" justify="space-between" mb={1}>
                    <Button
                      size="sm"
                      variant="link"
                      colorScheme="blue"
                      onClick={() => window.open(att.fileUrl, '_blank')}
                    >
                      {att.fileName}
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() =>
                        setEditEvent((prev) => ({
                          ...prev,
                          attachments: prev.attachments.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      ✕
                    </Button>
                  </Flex>
                ))}
              </Box>
            )}

            <ModalFooter>
              <Button colorScheme="blue" onClick={() => handleSaveEventEdit(editEvent)}>
                Save
              </Button>
              <Button ml={3} onClick={() => setIsEventModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <EventImageCropModal
          isOpen={isEventCropOpen}
          onClose={() => setIsEventCropOpen(false)}
          imageSrc={rawEventCover}
          onCropComplete={(cropped) => {
            setCroppedEventCover(cropped);
            setEditEvent((prev) => ({ ...prev, coverImage: cropped }));
          }}
        />
        <Modal isOpen={isArticleModalOpen} onClose={() => setIsArticleModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Article</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" align="center" width="100%">
                <FormControl mb={3}>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={editArticle?.title || ''}
                    onChange={(e) => setEditArticle({ ...editArticle, title: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Subtitle</FormLabel>
                  <Input
                    value={editArticle?.subtitle || ''}
                    onChange={(e) => setEditArticle({ ...editArticle, subtitle: e.target.value })}
                  />
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={editArticle?.category || ''}
                    onChange={(e) => setEditArticle({ ...editArticle, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {[
                      'Personal',
                      'Opinion',
                      'Review',
                      'Tutorial',
                      'Poetry',
                      'Reflection',
                      'News',
                      'Interview',
                      'Tech',
                      'Art',
                      'Photography',
                      'Research',
                      'Journal',
                      'Story',
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </FormControl>

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
                        setRawArticleCover(reader.result);
                        setIsArticleCropOpen(true);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {croppedArticleCover && (
                    <Box mt={3}>
                      <Image src={croppedArticleCover} alt="Cover" maxH="200px" borderRadius="md" />
                    </Box>
                  )}
                </FormControl>

                <FormControl mb={3}>
                  <FormLabel>Content</FormLabel>
                  <ReactQuill
                    theme="snow"
                    value={editArticle?.content || ''}
                    onChange={(value) => setEditArticle({ ...editArticle, content: value })}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleSaveArticleEdit}>
                Save
              </Button>
              <Button ml={3} onClick={() => setIsArticleModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <GalleryImageCropModal
          isOpen={isArticleCropOpen}
          onClose={() => setIsArticleCropOpen(false)}
          imageSrc={rawArticleCover}
          onCropComplete={(cropped) => {
            setCroppedArticleCover(cropped);
            setEditArticle((prev) => ({ ...prev, coverImage: cropped }));
          }}
        />
      </Flex>
    </Box>
  );
};

export default AdminPanel;

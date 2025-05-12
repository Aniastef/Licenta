import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';
import { Box } from '@chakra-ui/react';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import AuthPage from './pages/AuthPage'
import Navbar from './components/Navbar';
import CreateProductPage from './pages/CreateProductPage';
import ProductPage from './pages/ProductPage';
import CreateEventPage from './pages/CreateEventPage';
import EventPage from './pages/EventPage';
import UserArtGallery from './pages/UserArtGallery';
import ProductsPage from './pages/AllProductsPage';
import EventsPage from './pages/AllEventsPage';
import ExploreGalleries from './pages/GalleriesPage';
import CreateGalleryPage from './pages/CreateGallery';
import GalleryPage from './pages/UserArtGallery';
import MessagesPage from './pages/messagesPage';
import { CartProvider } from './components/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminPanel from './pages/AdminPanel';
import FavoriteProductsPage from './pages/FavoriteProductsPage';
import UserAllProductsPage from './pages/UserAllProductsPage';
import UpdateProductPage from './pages/UpdateProductPage';
import BlockedUsersPage from './pages/BlockedUsersPage';
import useLoadGoogleMapsScript from './hooks/useLoadGoogleMapsScript';
import EditEventPage from './pages/EditEventPage';
import EditGalleryPage from './pages/EditGalleryPage';
import NotificationsPage from './pages/NotificationPage';
import UserArticlesPage from './pages/UserArticlesPage';
import ArticlePage from './pages/ArticlePage';
import CalendarPage from './pages/CalendarPage';
import Test from './components/test';
import ContactBar from './components/ContactBar';
import LoginCard from './components/LoginCard';
import UserAllGalleriesPage from './pages/UserAllGalleriesPage';
import UserAllEventsPage from './pages/UserAllEventsPage';
import FavoritesPage from './pages/FavoritesPage';
import CreateOrEditArticlePage from './pages/createArticle';
import AllArticlesPage from './pages/AllArticlesPage';

function App() {
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const apiKey = 'AIzaSyAy0C3aQsACcFAPnO-BK1T4nLpSQ9jmkPs'; // Replace with your real key
  const { isLoaded } = useLoadGoogleMapsScript(apiKey); // Load Google Maps script

  return (
    <CartProvider>
    <Box minH="100vh">
       <Navbar/>
      <Routes>
        <Route path='/home' element={<HomePage/>} />
        <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
        <Route path="/profile/:username" element={<UserPage />} />
        <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />
        <Route path="/create/product" element={<CreateProductPage />} />
        <Route path='/products' element={<ProductsPage/>} />
        <Route path="/products/:id" element={<ProductPage/>} />
        <Route path="/create/event" element={user ? <CreateEventPage /> : <Navigate to="/auth" />} />
        <Route path="/events/:id" element={<EventPage/>} />
        <Route path='/events' element={<EventsPage/>} />
        <Route path='/articles' element={<AllArticlesPage/>} />

        <Route path="/art" element={<UserArtGallery/>} />
        <Route path="*" element={<Navigate to="/home" />} />
        <Route path="/galleries" element={<ExploreGalleries/>}/>
        <Route path="/create/gallery" element={<CreateGalleryPage/>}/>
        <Route path="/galleries/:username/:galleryName" element={<GalleryPage />} />
        <Route path="/messages" element={<MessagesPage />} /> {/* Pagină pentru mesaje */}
        <Route path="/notifications" element={user ? <NotificationsPage /> : <Navigate to="/auth" />} />
        <Route path="/messages/:userId" element={<MessagesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} /> {/* ✅ Adaugă ruta corectă */}
        <Route path="/orders" element={<OrdersPage />} /> {/* ✅ Noua pagină */}
        <Route path='/admin-panel' element={<AdminPanel/>}/>
        <Route path="/:username/favorites" element={<FavoriteProductsPage />} />
        <Route path="/:username/all-products" element={<UserAllProductsPage />} />
        <Route path="/:username/all-galleries" element={<UserAllGalleriesPage />} />
        <Route path="/:username/all-events" element={<UserAllEventsPage />} />
        <Route path="/update/product/:id" element={<UpdateProductPage />} />
        <Route path="/blocked-users" element={<BlockedUsersPage />} /> {/* Pagină pentru utilizatorii blocați */}
        <Route path="/edit/event/:eventId" element={<EditEventPage />} />
        <Route path="/edit-gallery/:galleryId" element={<EditGalleryPage />} />
        <Route path="/:username/articles" element={<UserArticlesPage />} />
        <Route path="/articles/:articleId" element={<ArticlePage />} />

        <Route path="/:username/calendar" element={<CalendarPage />} />
        <Route path="/test" element={<Test />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/favorites/:username" element={<FavoritesPage />} />
        <Route path="/create/article" element={<CreateOrEditArticlePage />} />
        <Route path="/update/article/:id" element={<CreateOrEditArticlePage />} />



      </Routes>
            <ContactBar />
      
    </Box>
    </CartProvider>
   
  );
}
export default App;
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
import Incerc from './components/Incerc';
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


function App() {
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);



  console.log(user); 
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
        <Route path="/incerc" element={<Incerc/>} />
        <Route path="/art" element={<UserArtGallery/>} />
        <Route path="*" element={<Navigate to="/home" />} />
        <Route path="/galleries" element={<ExploreGalleries/>}/>
        <Route path="/create/gallery" element={<CreateGalleryPage/>}/>
        <Route path="/galleries/:username/:galleryName" element={<GalleryPage />} />
        <Route path="/messages" element={<MessagesPage />} /> {/* Pagină pentru mesaje */}
        <Route path="/messages/:userId" element={<MessagesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} /> {/* ✅ Adaugă ruta corectă */}
        <Route path="/orders" element={<OrdersPage />} /> {/* ✅ Noua pagină */}
        <Route path='/admin-panel' element={<AdminPanel/>}/>
        <Route path="/galleries/:username/favorites" element={<FavoriteProductsPage />} />


      </Routes>
    </Box>
    </CartProvider>
   
  );
}
export default App;
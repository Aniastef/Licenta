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
import EventsPage from './pages/UserEventsPage';
import Incerc from './components/Incerc';
import UserEventsPage from './pages/UserEventsPage';
import UserArtGallery from './pages/UserArtGallery';
import ProductsPage from './pages/AllProductsPage';


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
        <Route path="/events/:id" element={<UserEventsPage/>} />
        <Route path="/events" element={<EventsPage/>} />
        <Route path="/incerc" element={<Incerc/>} />
        <Route path="/art" element={<UserArtGallery/>} />


      </Routes>
    </Box>
  );
}
export default App;
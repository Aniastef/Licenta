import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';
import { Box } from '@chakra-ui/react';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import LogoutButton from './components/LogoutButton';
import AuthPage from './pages/AuthPage'
import Navbar from './components/Navbar';
import CreateProductPage from './pages/CreateProductPage';


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
       {user && <Navbar />} 
      <Routes>
        <Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
        <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
        <Route path="/profile/:username" element={<UserPage />} />
        <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />
        <Route path="/create" element={<CreateProductPage />} />
      </Routes>
      {user && <LogoutButton />}
    </Box>
  );
}
export default App;
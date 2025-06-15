import { useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ esențial pentru logout-ul corect
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast('Error', data.error || 'Logout failed', 'error');
        return;
      }

      localStorage.removeItem('art-corner');
      setUser(null);
      showToast('Success', 'Logged out successfully', 'success');
      navigate('/home'); // Redirect to home page after successful logout
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  };

  return handleLogout;
};

export default useLogout;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Checkbox,
  Image,
  Spacer,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import authScreenAtom from '../atoms/authAtom';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import p1 from '../assets/p1.jpg';
import p2 from '../assets/p2.jpg';
import p3 from '../assets/p3.jpg';
import p4 from '../assets/p4.jpg';
import p5 from '../assets/p5.jpg';
import p6 from '../assets/p6.jpg';
import p7 from '../assets/p7.jpg';
import p8 from '../assets/p8.jpg';
import { useNavigate } from 'react-router-dom';

const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom);
  const slideshowImages = [p1, p2, p3, p4, p5, p6, p7, p8];
  const getRandomIndex = () => Math.floor(Math.random() * slideshowImages.length);
  const [currentSlide, setCurrentSlide] = useState(getRandomIndex());
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setInputs((prevInputs) => ({ ...prevInputs, username: rememberedUsername }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        let next;
        do {
          next = getRandomIndex();
        } while (next === prev);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(inputs),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('Error', data.error || 'Login failed', 'error');
        return;
      }
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', inputs.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      localStorage.setItem('art-corner', JSON.stringify(data));
      setUser(data);
      showToast('Success', 'Login successful!', 'success');
      navigate('/');
    } catch (error) {
      showToast('Error', 'Server error. Please try again later.', 'error');
      console.error('Login error:', error);
    }
  };

  useEffect(() => {
    const checkUserSessionStatus = async () => {
      try {
        const res = await fetch('/api/users/profile', {
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok || data.isBlocked) {
          setUser(null);
          if (localStorage.getItem('art-corner')) {
            showToast('Info', 'Your session has expired or your account has been blocked.', 'info');
            localStorage.removeItem('art-corner');
          }
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error('Error checking user status during interval:', error);
        setUser(null);
        if (localStorage.getItem('art-corner')) {
          showToast('Error', 'Lost connection to server. Please log in again.', 'error');
          localStorage.removeItem('art-corner');
        }
      }
    };

    const interval = setInterval(checkUserSessionStatus, 30000);

    return () => clearInterval(interval);
  }, [setUser, showToast]);

  return (
    <Flex minH="80vh" align="center" justify="center">
      <Box
        bg="white"
        boxShadow="xl"
        borderRadius="lg"
        overflow="hidden"
        display="flex"
        maxW="900px"
        w="full"
      >
        <Box flex="1" p={8}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="2xl" fontWeight="bold">
              Great to see you again!
            </Text>
            <FormControl id="username">
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={inputs.username}
                placeholder="Username"
                onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={inputs.password}
                  onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                />
                <InputRightElement>
                  <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <HStack justify="space-between">
              <Checkbox isChecked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                Remember Me
              </Checkbox>
            </HStack>
            <Button colorScheme="orange" w="full" onClick={handleLogin}>
              Login
            </Button>
            <Spacer />
            <Text align="center">
              Don't have an account?{' '}
              <Button
                variant="link"
                color="blue.400"
                onClick={() => {
                  setAuthScreen('signup');
                  navigate('/auth');
                }}
              >
                Sign up
              </Button>
            </Text>
            <Button
              variant="link"
              color="gray.700"
              fontWeight="bold"
              fontSize="md"
              onClick={() => {
                setUser(null);
                localStorage.removeItem('art-corner');
                localStorage.removeItem('rememberedUsername');
                setRememberMe(false);
                navigate('/');
                showToast('Info', 'Continuing as guest.', 'info');
              }}
            >
              Continue as Guest
            </Button>
          </VStack>
        </Box>

        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Box position="relative" w="380px" h="380px">
            <Image
              src={slideshowImages[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              w="100%"
              h="100%"
              objectFit="cover"
              borderRadius="lg"
            />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default LoginCard;

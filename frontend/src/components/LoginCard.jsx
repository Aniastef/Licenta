import React, { useEffect } from 'react';
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

import loginImage from '../assets/login.jpg';
import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import authScreenAtom from '../atoms/authAtom';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';

const LoginCard= () => {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom)
    
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 👈 ADĂUGĂ ASTA
        body: JSON.stringify(inputs),
      });
  
      const data = await res.json();
  
      if (!res.ok) { // ✅ Verifică și afișează eroarea pentru conturi blocate
        showToast("Error", data.error || "Login failed", "error");
        return;
      }
  
      localStorage.setItem("licenta", JSON.stringify(data));
      setUser(data);
      console.log("Login successful", data);
    } catch (error) {
      showToast("Error", "Server error. Please try again later.", "error");
    }
  };
  
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await fetch("/api/users/profile", {
          credentials: "include",
        });
  
        const data = await res.json();
  
        if (!res.ok || data.isBlocked) {
          localStorage.removeItem("licenta");
          window.location.href = "/login"; // ✅ Deconectează user-ul blocat
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };
  
    const interval = setInterval(checkUserStatus, 30000); // ✅ Verifică la fiecare 30 secunde
  
    return () => clearInterval(interval);
  }, []);
  

  return (
    <Flex minH="100vh" bg="gray.100" align="center" justify="center">
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
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <HStack justify="space-between">
              <Checkbox>Remember Me</Checkbox>
              <Button variant="link" color="blue.500">
                Forgot Password?
              </Button>
            </HStack>
            <Button 
              colorScheme="pink"
              w="full"
              onClick={handleLogin}
              >
            
              Login
            </Button>
            <Spacer/>
            <Text align="center">
              Don't have an account?{' '}
              <Button
                variant="link"
                color="blue.400"
                onClick={() => setAuthScreen("signup")}
              >
                Sign up
              </Button>
            </Text>
          </VStack>
        </Box>

        <Box flex="1" >
        
          <Image
            src={loginImage}
            alt="Welcome Illustration"
          />
        </Box>
      </Box>
    </Flex>
  );
};

export default LoginCard;

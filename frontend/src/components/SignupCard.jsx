import React, { useState } from 'react';
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
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useSetRecoilState } from 'recoil';
import signupImage from '../assets/login.jpg';
import authScreenAtom from '../atoms/authAtom';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';

const SignupCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom)
  const showToast = useShowToast();

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setInputs({ ...inputs, confirmPassword: value });
  };
  
  const handleSignup = async () => {
   
    if (inputs.password !== inputs.confirmPassword) {
      showToast("Passwords do not match");
      return;
    }
  
    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
  
      const data = await res.json();
  
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
  
      localStorage.setItem("licenta", JSON.stringify(data));
      setUser(data);
      showToast("User signed up successfully", "", "success"); // Mesaj corect
      //console.log(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };
  
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
        {/* Secțiunea din stânga: Formular de signup */}
        <Box flex="1" p={8}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="2xl" fontWeight="bold">
              Create an account
            </Text>

            <FormControl id="firstName">
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                placeholder="Enter your first name"
                onChange={(e) =>
                  setInputs({ ...inputs, firstName: e.target.value })
                }
                value={inputs.firstName}
              />
            </FormControl>

            <FormControl id="lastName">
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                placeholder="Enter your last name"
                onChange={(e) =>
                  setInputs({ ...inputs, lastName: e.target.value })
                }
                value={inputs.lastName}
              />
            </FormControl>

            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <Input
                type="text"
                placeholder="Enter your email"
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
                value={inputs.email}
              />
            </FormControl>

            <FormControl id="username">
              <FormLabel>Username</FormLabel>
              <Input
                type="username"
                placeholder="Create a username"
                onChange={(e) =>
                  setInputs({ ...inputs, username: e.target.value })
                }
                value={inputs.username}
              />
            </FormControl>

            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                  value={inputs.password}
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

            <FormControl id="confirm-password">
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  onChange={handlePasswordChange}
                  value={inputs.confirmPassword}
                />
                <InputRightElement>
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <HStack justify="space-between">
              <Checkbox>I agree to the Terms and Conditions</Checkbox>
            </HStack>
            <Button 
            colorScheme="pink"
            w="full"
            onClick={handleSignup}>
            Sign Up
            </Button>
            <Text align="center">
              Already have an account?{' '}
              <Button
                variant="link"
                color="blue.400"
                onClick={() => setAuthScreen('login')}
              >
                Login
              </Button>
            </Text>
          </VStack>
        </Box>

        <Box flex="1">
          <Image src={signupImage} alt="poza" />
        </Box>
      </Box>
    </Flex>
  );
};

export default SignupCard;

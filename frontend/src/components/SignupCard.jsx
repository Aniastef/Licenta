import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import signupImage from "../assets/login.jpg";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";

const SignupCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // 📌 Funcție pentru validarea inputurilor
  const validateInputs = () => {
    let newErrors = {};

    if (!inputs.firstName.trim()) newErrors.firstName = "First name is required";
    if (!inputs.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!inputs.username.trim()) newErrors.username = "Username is required";
    
    if (!inputs.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
      newErrors.email = "Invalid email format";
    }

    if (inputs.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (inputs.password !== inputs.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📌 Funcție pentru înregistrare
  const handleSignup = async () => {
    if (!validateInputs()) {
      showToast("Error", "Please fix the errors and try again.", "error");
      return;
    }

    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error", data.error || "Failed to sign up", "error");
        return;
      }

      localStorage.setItem("licenta", JSON.stringify(data));
      setUser(data);
      showToast("Success", "User signed up successfully", "success");
    } catch (error) {
      showToast("Error", "Something went wrong. Please try again.", "error");
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
        {/* Formul de signup */}
        <Box flex="1" p={8}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="2xl" fontWeight="bold">
              Create an account
            </Text>

            {/* First Name */}
            <FormControl id="firstName" isInvalid={errors.firstName}>
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                placeholder="Enter your first name"
                value={inputs.firstName}
                onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })}
              />
              <Text color="red.500">{errors.firstName}</Text>
            </FormControl>

            {/* Last Name */}
            <FormControl id="lastName" isInvalid={errors.lastName}>
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                placeholder="Enter your last name"
                value={inputs.lastName}
                onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })}
              />
              <Text color="red.500">{errors.lastName}</Text>
            </FormControl>

            {/* Email */}
            <FormControl id="email" isInvalid={errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={inputs.email}
                onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              />
              <Text color="red.500">{errors.email}</Text>
            </FormControl>

            {/* Username */}
            <FormControl id="username" isInvalid={errors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                placeholder="Create a username"
                value={inputs.username}
                onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              />
              <Text color="red.500">{errors.username}</Text>
            </FormControl>

            {/* Password */}
            <FormControl id="password" isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={inputs.password}
                  onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                />
                <InputRightElement>
                  <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Text color="red.500">{errors.password}</Text>
            </FormControl>

            {/* Confirm Password */}
            <FormControl id="confirm-password" isInvalid={errors.confirmPassword}>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={inputs.confirmPassword}
                  onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                />
                <InputRightElement>
                  <Button h="1.75rem" size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Text color="red.500">{errors.confirmPassword}</Text>
            </FormControl>

            <HStack justify="space-between">
              <Checkbox>I agree to the Terms and Conditions</Checkbox>
            </HStack>

            <Button colorScheme="pink" w="full" onClick={handleSignup}>
              Sign Up
            </Button>

            <Text align="center">
              Already have an account?{" "}
              <Button variant="link" color="blue.400" onClick={() => setAuthScreen("login")}>
                Login
              </Button>
            </Text>
          </VStack>
        </Box>

        {/* Imagine */}
        <Box flex="1">
          <Image src={signupImage} alt="Signup" />
        </Box>
      </Box>
    </Flex>
  );
};

export default SignupCard;

import React, { useEffect, useState } from "react";
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // ✅ Pentru redirecționare

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // ✅ Stocăm userul logat
  const toast = useToast();
  const navigate = useNavigate(); // ✅ Pentru redirecționare

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/profile", { credentials: "include" });
      const data = await response.json();

      console.log("Fetched current user:", data); // ✅ Debugging

      if (!data || !data.role) {
        console.error("User not found or missing role, redirecting...");
        navigate("/"); // ✅ Redirecționează utilizatorii non-admin
        return;
      }

      if (data.role !== "admin" && data.role !== "superadmin") {
        console.error("User does not have admin privileges, redirecting...");
        navigate("/");
        return;
      }

      setCurrentUser(data);
    } catch (err) {
      console.error("Error fetching user:", err);
      navigate("/"); // ✅ Dacă există eroare, redirecționează la homepage
    }
};

  
  
  
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
  
      console.log("Fetched users:", data); // ✅ Debugging
  
      if (!Array.isArray(data)) { // ✅ Verifică dacă e array
        console.error("Error fetching users: Invalid response format", data);
        toast({ title: "Error fetching users", status: "error" });
        return;
      }
  
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchUsers:", err);
      toast({ title: "Error fetching users", status: "error" });
      setLoading(false);
    }
  };
  
  
  


  if (!currentUser) {
    return <Spinner />;
  }

  return (
    <Box p={5}>
      <h1>Admin Panel - User Management</h1>
      {loading ? (
        <Spinner />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Admin</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
  {Array.isArray(users) && users.length > 0 ? (
    users.map((user) => (
      <Tr key={user._id}>
        <Td>{user.firstName} {user.lastName}</Td>
        <Td>{user.email}</Td>
        <Td>{user.role}</Td> {/* ✅ Afișează rolul utilizatorului */}
      </Tr>
    ))
  ) : (
    <Tr>
      <Td colSpan="3" textAlign="center">No users found</Td>
    </Tr>
  )}
</Tbody>


        </Table>
      )}
    </Box>
  );
};

export default AdminPanel;

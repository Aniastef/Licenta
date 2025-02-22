import React, { useEffect, useState } from "react";
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast,
  Select, Input, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Textarea
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // ✅ Adăugare tab switcher

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/audit/logs", { credentials: "include" });
      const data = await response.json();
  
      // ✅ Sortare descrescătoare după timestamp
      const sortedLogs = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
      console.log("Fetched logs:", sortedLogs); // ✅ Debugging
      setLogs(sortedLogs);
    } catch (err) {
      toast({ title: "Error fetching logs", status: "error" });
    } finally {
      setLoading(false);
    }
  };
  

  
  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const handleNavigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/profile", { credentials: "include" });
      const data = await response.json();
      if (!data || !data.role) navigate("/");
      if (data.role !== "admin" && data.role !== "superadmin") navigate("/");
      setCurrentUser(data);
    } catch (err) {
      navigate("/");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast({ title: "Error fetching users", status: "error" });
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setNewPassword("");
    setNewProfilePicture(null);
    onOpen();
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        bio: editUser.bio,
        age: editUser.age,
        profession: editUser.profession,
        location: editUser.location,
        facebook: editUser.facebook,
        instagram: editUser.instagram,
        webpage: editUser.webpage,
      };

      if (newPassword) {
        updateData.password = newPassword;
      }

      if (newProfilePicture) {
        const formData = new FormData();
        formData.append("file", newProfilePicture);
        const uploadResponse = await fetch(`/api/admin/users/${editUser._id}/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.error || "Failed to upload image");
        updateData.profilePicture = uploadResult.url;
      }

      const response = await fetch(`/api/admin/users/${editUser._id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast({ title: "User updated successfully", status: "success" });
      onClose();
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };

  const handleBlockUser = async (user) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update user status");

      if (user._id === currentUser._id) {
        localStorage.removeItem("licenta");
        window.location.href = "/login";
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u))
      );

      toast({ title: `User ${user.isBlocked ? "unblocked" : "blocked"} successfully`, status: "success" });
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error deleting user");
      }

      toast({ title: "User deleted successfully", status: "success" });
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };

  const handleUploadPicture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("profilePicture", file);
  
    try {
      const response = await fetch(`/api/admin/users/${editUser._id}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to upload picture");
  
      toast({ title: "Profile picture updated successfully", status: "success" });
  
      // ✅ Actualizează imaginea utilizatorului cu URL-ul de pe Cloudinary
      setEditUser((prevUser) => ({ ...prevUser, profilePicture: data.url }));
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };

  
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole }),
        credentials: "include", // ✅ Asigură-te că este inclus
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating role");
      }
  
      toast({ title: "Role updated successfully", status: "success" });
      fetchUsers();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    }
  };
  
  

  return (
    <Box p={5}>
      <h1>Admin Panel</h1>
      <Box mb={5} display="flex" gap={4}>
        <Button 
          colorScheme={activeTab === "users" ? "blue" : "gray"} 
          onClick={() => setActiveTab("users")}
        >
          User Management
        </Button>
        <Button 
          colorScheme={activeTab === "logs" ? "blue" : "gray"} 
          onClick={() => {
            setActiveTab("logs");
            fetchLogs(); // ✅ Încarcă logurile doar când e activ tab-ul
          }}
        >
          View Audit Logs
        </Button>
      </Box>

      {activeTab === "users" && (
        <>
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb={3}
      />
      {loading ? (
        <Spinner />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
  {Array.isArray(users) && users.length > 0 ? (
    users.map((user) => (
      <Tr key={user._id}>
        <Td 
                  onClick={() => handleNavigateToProfile(user._id)}
                  style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                >
                  {user.firstName} {user.lastName}
                </Td>
        <Td>{user.email}</Td>
        <Td>
          <Select
            value={user.role}
            onChange={(e) => handleRoleChange(user._id, e.target.value)}
            size="sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </Select>
        </Td>
        <Td>
          <Button colorScheme="blue" onClick={() => handleEditUser(user)}>Edit</Button>
          <Button colorScheme={user.isBlocked ? "green" : "red"} onClick={() => handleBlockUser(user)}>
            {user.isBlocked ? "Unblock" : "Block"}
          </Button>
          <Button colorScheme="red" onClick={() => handleDeleteUser(user._id)} isDisabled={user.role === "superadmin"}>
            Delete
          </Button>
        </Td>
      </Tr>
    ))
  ) : (
    <Tr>
      <Td colSpan="4">No users found</Td>
    </Tr>
  )}
</Tbody>
</Table>
)}


      {editUser && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input placeholder="First Name" value={editUser.firstName} onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })} mb={3} />
              <Input placeholder="Last Name" value={editUser.lastName} onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })} mb={3} />
              <Input placeholder="Email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} mb={3} />
              <Textarea placeholder="Bio" value={editUser.bio} onChange={(e) => setEditUser({ ...editUser, bio: e.target.value })} mb={3} />
              <Input placeholder="Profession" value={editUser.profession} onChange={(e) => setEditUser({ ...editUser, profession: e.target.value })} mb={3} />
              <Input placeholder="Location" value={editUser.location} onChange={(e) => setEditUser({ ...editUser, location: e.target.value })} mb={3} />
              <Input placeholder="New Password (optional)" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} mb={3} />
              <Input type="file" accept="image/*" onChange={handleUploadPicture} mb={3} />
                {editUser.profilePicture && (
                  <img src={`http://localhost:5000${editUser.profilePicture}`} alt="Profile" width="100" />
                )}

            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleSaveEdit}>Save</Button>
              <Button ml={3} onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
        </>
      )}

 {/* ✅ Secțiunea Audit Logs */}
      {activeTab === "logs" && (
        <>
          {loading ? (
            <Spinner />
          ) : (
  <Table variant="simple" size="sm" mt={5}>
    <Thead>
      <Tr>
        <Th>Action</Th>
        <Th>Performed By</Th>
        <Th>Target User</Th>
        <Th>Details</Th>
        <Th>Timestamp</Th>
      </Tr>
    </Thead>
    <Tbody>
      {logs.map((log) => (
        <Tr key={log._id}>
          <Td>{log.action}</Td>
          <Td>{log.performedBy.firstName} {log.performedBy.lastName}</Td>
          <Td>{log.targetUser ? `${log.targetUser.firstName} ${log.targetUser.lastName}` : "N/A"}</Td>
          <Td>{log.details}</Td>
          <Td>{new Date(log.timestamp).toLocaleString()}</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
)}
        </>
      )}  

    </Box>
  );
};

export default AdminPanel;

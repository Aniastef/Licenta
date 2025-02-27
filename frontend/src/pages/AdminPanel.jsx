import React, { useEffect, useState } from "react";
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast,
  Select, Input, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Textarea, Flex
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver"; // ✅ Pentru descărcare fișiere
import Papa from "papaparse"; // ✅ Pentru generare CSV
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // ✅ Adăugare tab switcher
  const [actionFilter, setActionFilter] = useState("all");

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

  const handleNavigateToProfile = (username) => {
    navigate(`/profile/${username}`);
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
  
  const exportUsersToCSV = () => {
    if (users.length === 0) {
      toast({ title: "No users to export", status: "warning" });
      return;
    }

    const csvData = Papa.unparse(users.map(user => ({
      ID: user._id,
      Name: `${user.firstName} ${user.lastName}`,
      Email: user.email,
      Role: user.role,
      Status: user.isBlocked ? "Blocked" : "Active"
    })));

    const csvBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(csvBlob, "users_list.csv");
    toast({ title: "Users exported successfully!", status: "success" });
  };
  
  // const filteredUsers = users.filter(user =>
  //   `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   user.role.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  
  const filteredUsers = users
    .filter(user =>
      (roleFilter === "all" || user.role === roleFilter) &&
      (statusFilter === "all" || (statusFilter === "active" ? !user.isBlocked : user.isBlocked)) &&
      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const fieldA = a[sortField]?.toString().toLowerCase() || "";
      const fieldB = b[sortField]?.toString().toLowerCase() || "";
      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const totalUsers = users.length;
  const activeUsers = users.filter(user => !user.isBlocked).length;
  const blockedUsers = users.filter(user => user.isBlocked).length;

  const userRegistrationsPerMonth = users.reduce((acc, user) => {
    const month = new Date(user.createdAt).toLocaleString("default", { month: "short" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const registrationData = Object.entries(userRegistrationsPerMonth).map(([month, count]) => ({ month, count }));

  const filteredLogs = logs.filter(log =>
    (actionFilter === "all" || log.action === actionFilter) &&
    (log.performedBy.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.performedBy.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportLogsToCSV = () => {
    if (logs.length === 0) {
      toast({ title: "No logs to export", status: "warning" });
      return;
    }
    const csvData = Papa.unparse(logs.map(log => ({
      Action: log.action,
      PerformedBy: `${log.performedBy.firstName} ${log.performedBy.lastName}`,
      Details: log.details,
      Timestamp: new Date(log.timestamp).toLocaleString()
    })));
    const csvBlob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(csvBlob, "audit_logs.csv");
    toast({ title: "Logs exported successfully!", status: "success" });
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
        <Button 
          colorScheme={activeTab === "users" ? "blue" : "gray"} 
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </Button>
      </Box>

        {activeTab === "dashboard" && (
                <Box>
                  <h2>📊 Dashboard</h2>
                  <Box display="flex" gap={4} mb={4}>
                    <Box p={4} border="1px solid gray" borderRadius="md">Total Users: {totalUsers}</Box>
                    <Box p={4} border="1px solid gray" borderRadius="md">Active Users: {activeUsers}</Box>
                    <Box p={4} border="1px solid gray" borderRadius="md">Blocked Users: {blockedUsers}</Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={registrationData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3182ce" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
      {activeTab === "users" && (
        <>
        <Button colorScheme="blue" mb={4} onClick={exportUsersToCSV}>
        Export Users (CSV)
      </Button>
      <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      {/* Search Input */}
      <Flex mt={4} direction="row"  gap={2} >
      
        <Select size="sm" maxWidth="200px" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </Select>

        <Select size="sm" maxWidth="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </Select>

        <Select size="sm" maxWidth="200px" value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="firstName">Sort by Name</option>
          <option value="username">Sort by Username</option>
          <option value="createdAt">Sort by Date</option>
        </Select>

        <Button size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          {sortOrder === "asc" ? "⬆️ Ascending" : "⬇️ Descending"}
        </Button>
      </Flex>

{/* Tabel cu filtrare activă */}
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
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <Tr key={user._id}>
            <Td 
              onClick={() => handleNavigateToProfile(user.username)}
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

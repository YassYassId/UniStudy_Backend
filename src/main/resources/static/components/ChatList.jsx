import React, { useState, useEffect } from "react";
import axios from "axios";

const ChatList = ({ onSelectUser, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8080/api/auth/usersList",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again later.");
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  if (loading) {
    return <div className="p-3 text-gray-400">Loading users...</div>;
  }

  if (error) {
    return <div className="p-3 text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4 p-3">
      <h3 className="text-lg font-semibold text-orange-400">User List</h3>
      {users.length === 0 ? (
        <p className="text-gray-400 mt-2">No users available</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {users.map((user) => (
            <li
              key={user.id || user.email}
              className="flex items-center px-4 py-2 space-x-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer"
              onClick={() => onSelectUser(user)}
            >
              <img
                className="w-10 h-10 rounded-full"
                src="https://via.placeholder.com/40"
                alt={user.firstName}
              />
              <div className="flex-1">
                <span className="font-semibold text-white">
                  {user.firstName} {user.lastName}
                </span>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
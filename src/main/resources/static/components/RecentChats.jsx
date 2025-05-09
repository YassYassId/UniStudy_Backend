import React, { useState, useEffect } from "react";
import axios from "axios";

const RecentChats = ({ token, userId, onSelectUser }) => {
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This could be enhanced to fetch actual recent chats from the backend
    // For now, we'll use the same user list endpoint but limit the display
    const fetchRecentChats = async () => {
      if (!token || !userId) return;
      
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
        // Take the first 5 users as "recent" chats
        setRecentUsers(response.data.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent chats:", error);
        setLoading(false);
      }
    };

    fetchRecentChats();
  }, [token, userId]);

  if (loading) {
    return <div className="p-3 text-gray-400">Loading recent chats...</div>;
  }

  return (
    <div className="p-3">
      <h3 className="text-lg font-semibold text-orange-400">Recent Chats</h3>
      {recentUsers.length === 0 ? (
        <p className="text-gray-400 mt-2">No recent chats</p>
      ) : (
        <div className="flex space-x-3 mt-2">
          {recentUsers.map((user) => (
            <div 
              key={user.id || user.email} 
              className="relative cursor-pointer"
              onClick={() => onSelectUser(user)}
            >
              <img
                className="w-10 h-10 rounded-full"
                src="https://via.placeholder.com/40"
                alt={user.firstName}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="sr-only">{user.firstName} {user.lastName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentChats;
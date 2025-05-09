import React, { useState, useEffect } from "react";
import axios from "axios";

const GroupChatList = ({ token, userId, onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!token || !userId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/groups/my-groups?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGroups(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to load groups. Please try again later.");
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token, userId]);

  if (loading) {
    return <div className="p-3 text-gray-400">Loading groups...</div>;
  }

  if (error) {
    return <div className="p-3 text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4 p-3">
      <h3 className="text-lg font-semibold text-orange-400">My Groups</h3>
      {groups.length === 0 ? (
        <p className="text-gray-400 mt-2">You are not a member of any groups</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {groups.map((group) => (
            <li
              key={group.id}
              className="flex items-center px-4 py-2 space-x-3 rounded-md bg-gray-800 hover:bg-gray-700 cursor-pointer"
              onClick={() => onSelectGroup(group)}
            >
              <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-white">{group.name}</span>
                <p className="text-sm text-gray-400">{group.subject}</p>
                <p className="text-xs text-gray-500">
                  {group.members.length} members
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupChatList;
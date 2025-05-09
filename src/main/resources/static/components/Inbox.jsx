import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import ChatWindow from "./ChatWindow";
import ChatList from "./ChatList";
import RecentChats from "./RecentChats";
import GroupChatList from "./GroupChatList";
import GroupChatWindow from "./GroupChatWindow";
import CreateGroupModal from "./CreateGroupModal";
import AvailableGroupsList from "./AvailableGroupsList";

const Inbox = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [chatMode, setChatMode] = useState("private"); // "private" or "group"
  const [groupViewMode, setGroupViewMode] = useState("myGroups"); // "myGroups" or "availableGroups"
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = Cookies.get("token");
    const storedUserId = Cookies.get("userId");
    const username = Cookies.get("username");

    if (!storedToken) {
      // Redirect to login if not authenticated
      navigate("/auth");
      return;
    }

    setToken(storedToken);
    setUserId(storedUserId || username); // Fallback to username if userId not available
  }, [navigate]);

  const handleSelectUser = (user) => {
    // Use email as the user identifier since that's what the backend expects
    setSelectedUser(user.email);
    setSelectedGroup(null);
    setChatMode("private");
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setChatMode("group");
  };

  const handleCreateGroup = (newGroup) => {
    // Add the new group to the list (handled by GroupChatList component's useEffect)
    // and select it
    handleSelectGroup(newGroup);
  };

  const handleLogout = () => {
    // Clear cookies and redirect to login
    Cookies.remove("token");
    Cookies.remove("username");
    Cookies.remove("userId");
    Cookies.remove("accessToken");
    Cookies.remove("isAuthenticated");
    Cookies.remove("userRole");
    navigate("/auth");
  };

  if (!token) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-400">UniStudy Chat</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {Cookies.get("username")}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 bg-gray-800 overflow-y-auto">
          {/* Chat mode tabs */}
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 py-3 ${
                chatMode === "private"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setChatMode("private")}
            >
              Private Chats
            </button>
            <button
              className={`flex-1 py-3 ${
                chatMode === "group"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setChatMode("group")}
            >
              Group Chats
            </button>
          </div>

          {chatMode === "private" ? (
            <>
              <RecentChats 
                token={token} 
                userId={userId} 
                onSelectUser={handleSelectUser} 
              />
              <ChatList 
                token={token} 
                onSelectUser={handleSelectUser} 
              />
            </>
          ) : (
            <>
              <div className="p-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-orange-400">Study Groups</h3>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                >
                  Create Group
                </button>
              </div>

              {/* Group view mode tabs */}
              <div className="flex border-b border-gray-700 px-3">
                <button
                  className={`py-2 px-4 mr-2 ${
                    groupViewMode === "myGroups"
                      ? "bg-gray-700 text-orange-400 rounded-t"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setGroupViewMode("myGroups")}
                >
                  My Groups
                </button>
                <button
                  className={`py-2 px-4 ${
                    groupViewMode === "availableGroups"
                      ? "bg-gray-700 text-orange-400 rounded-t"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setGroupViewMode("availableGroups")}
                >
                  Join Groups
                </button>
              </div>

              {groupViewMode === "myGroups" ? (
                <GroupChatList 
                  token={token} 
                  userId={userId} 
                  onSelectGroup={handleSelectGroup} 
                />
              ) : (
                <AvailableGroupsList
                  token={token}
                  userId={userId}
                  onSelectGroup={handleSelectGroup}
                />
              )}
            </>
          )}
        </div>

        {chatMode === "private" ? (
          <ChatWindow 
            selectedUsername={selectedUser} 
            token={token} 
            userId={userId} 
          />
        ) : (
          <GroupChatWindow 
            selectedGroup={selectedGroup} 
            token={token} 
            userId={userId} 
          />
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        token={token}
        userId={userId}
        onGroupCreated={handleCreateGroup}
      />
    </div>
  );
};

export default Inbox;

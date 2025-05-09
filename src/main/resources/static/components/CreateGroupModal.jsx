import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateGroupModal = ({ isOpen, onClose, token, userId, onGroupCreated }) => {
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    subject: "",
    maxCapacity: 10,
    createdBy: userId,
    createdDate: new Date().toISOString(),
    members: [userId] // Creator is automatically a member
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Update userId in groupData when it changes
  useEffect(() => {
    setGroupData(prevData => ({
      ...prevData,
      createdBy: userId,
      members: [userId]
    }));
  }, [userId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData({
      ...groupData,
      [name]: name === "maxCapacity" ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!groupData.name.trim()) {
      setError("Group name is required");
      return;
    }

    if (!groupData.subject.trim()) {
      setError("Subject is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await axios.post(
        "http://localhost:8080/api/groups/create",
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Call the callback with the newly created group
      if (onGroupCreated) {
        onGroupCreated(response.data);
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      setError(error.response?.data?.message || "Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-orange-400">Create New Group</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Group Name*</label>
            <input
              type="text"
              name="name"
              value={groupData.name}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded"
              placeholder="Enter group name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Subject*</label>
            <input
              type="text"
              name="subject"
              value={groupData.subject}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded"
              placeholder="Enter subject (e.g., Math, Physics)"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={groupData.description}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded"
              placeholder="Enter group description"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Max Capacity</label>
            <input
              type="number"
              name="maxCapacity"
              value={groupData.maxCapacity}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded"
              min="2"
              max="100"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;

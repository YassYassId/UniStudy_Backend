import React, { useState, useEffect } from "react";
import axios from "axios";

const AvailableGroupsList = ({ token, userId, onSelectGroup }) => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);

  // Fetch user's groups to filter them out from available groups and get subjects
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !userId) return;

      try {
        console.log("Fetching data for AvailableGroupsList with userId:", userId);

        // Fetch user's groups
        const myGroupsResponse = await axios.get(
          `http://localhost:8080/api/groups/my-groups?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("My groups:", myGroupsResponse.data);
        setMyGroups(myGroupsResponse.data);

        // Fetch all users to get their subjects
        const usersResponse = await axios.get(
          "http://localhost:8080/api/auth/usersList",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Users:", usersResponse.data);

        // Extract unique subjects from all users
        const allSubjects = [];
        usersResponse.data.forEach(user => {
          if (user.subjects && Array.isArray(user.subjects)) {
            console.log(`User ${user.email} has subjects:`, user.subjects);
            allSubjects.push(...user.subjects);
          }
        });

        // Add subjects from existing groups
        myGroupsResponse.data.forEach(group => {
          if (group.subject) {
            console.log(`Group ${group.name} has subject:`, group.subject);
            allSubjects.push(group.subject);
          }
        });

        // Add some default subjects if none are found
        if (allSubjects.length === 0) {
          console.log("No subjects found, adding default subjects");
          allSubjects.push("Mathematics", "Physics", "Computer Science", "Biology", "Chemistry");
        }

        // Remove duplicates and set subjects
        const uniqueSubjects = [...new Set(allSubjects)].filter(Boolean);
        console.log("Unique subjects:", uniqueSubjects);
        setSubjects(uniqueSubjects);

        // Set default selected subject if available
        if (uniqueSubjects.length > 0 && !selectedSubject) {
          console.log("Setting default selected subject:", uniqueSubjects[0]);
          setSelectedSubject(uniqueSubjects[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load subjects. Please try again later.");
      }
    };

    fetchData();
  }, [token, userId]);

  // Fetch available groups by subject
  useEffect(() => {
    const fetchAvailableGroups = async () => {
      if (!token || !selectedSubject) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching groups for subject: ${selectedSubject}`);

        const response = await axios.get(
          `http://localhost:8080/api/groups/by-subject?subject=${selectedSubject}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(`Received ${response.data.length} groups for subject ${selectedSubject}:`, response.data);

        // Filter out groups the user is already a member of
        const myGroupIds = myGroups.map(group => group.id);
        console.log("My group IDs:", myGroupIds);

        const filtered = response.data.filter(group => !myGroupIds.includes(group.id));
        console.log(`After filtering, ${filtered.length} groups available to join:`, filtered);

        // If no groups are available for this subject, create a sample group
        if (filtered.length === 0 && selectedSubject) {
          console.log(`No groups available for subject ${selectedSubject}, creating a sample group`);
          try {
            const sampleGroup = {
              name: `${selectedSubject} Study Group`,
              description: `A study group for ${selectedSubject}`,
              subject: selectedSubject,
              maxCapacity: 20,
              createdBy: userId,
              members: [userId]
            };

            const createResponse = await axios.post(
              "http://localhost:8080/api/groups/create",
              sampleGroup,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            console.log("Created sample group:", createResponse.data);

            // Add the created group to myGroups
            setMyGroups(prev => [...prev, createResponse.data]);

            // No need to add to availableGroups since the user is already a member
          } catch (createError) {
            console.error("Error creating sample group:", createError);
          }
        }

        setAvailableGroups(filtered);
        setFilteredGroups(filtered); // Initialize filtered groups with all available groups
        setLoading(false);

        // Clear any previous errors
        setError(null);
      } catch (error) {
        console.error("Error fetching available groups:", error);
        setError(`Failed to load groups for subject "${selectedSubject}". ${error.response?.data?.message || error.message}`);
        setAvailableGroups([]);
        setFilteredGroups([]);
        setLoading(false);
      }
    };

    fetchAvailableGroups();
  }, [token, selectedSubject, myGroups, userId]);

  // Filter groups based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGroups(availableGroups);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = availableGroups.filter(group => 
      group.name.toLowerCase().includes(term) || 
      group.subject.toLowerCase().includes(term) ||
      (group.description && group.description.toLowerCase().includes(term))
    );

    setFilteredGroups(filtered);
  }, [searchTerm, availableGroups]);

  const handleJoinGroup = async (groupId) => {
    if (!token || !userId) return;

    try {
      await axios.post(
        `http://localhost:8080/api/groups/${groupId}/members?userId=${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the lists after joining
      const response = await axios.get(
        `http://localhost:8080/api/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add the joined group to myGroups
      setMyGroups(prev => [...prev, response.data]);

      // Remove the joined group from availableGroups
      setAvailableGroups(prev => prev.filter(group => group.id !== groupId));

      // Select the joined group
      onSelectGroup(response.data);
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join group. " + (error.response?.data?.error || "Please try again."));
    }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading && !availableGroups.length) {
    return <div className="p-3 text-gray-400">Loading available groups...</div>;
  }

  if (error) {
    return <div className="p-3 text-red-500">{error}</div>;
  }

  return (
    <div className="mt-4 p-3">
      <h3 className="text-lg font-semibold text-orange-400">Available Groups</h3>

      {/* Search and filter controls */}
      <div className="mt-2 mb-4 space-y-3">
        {/* Subject selector */}
        <div>
          <label className="block text-gray-300 mb-1">Filter by Subject:</label>
          <select
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <div>
          <label className="block text-gray-300 mb-1">Search Groups:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 bg-gray-700 text-white rounded"
            placeholder="Search by name, subject, or description"
          />
        </div>
      </div>

      {!selectedSubject ? (
        <p className="text-gray-400">Please select a subject to see available groups</p>
      ) : availableGroups.length === 0 ? (
        <div>
          <p className="text-gray-400 mb-4">No available groups for this subject</p>
          <button
            onClick={() => {
              const newGroup = {
                name: `${selectedSubject} Study Group`,
                description: `A study group for ${selectedSubject}`,
                subject: selectedSubject,
                maxCapacity: 20,
                createdBy: userId,
                members: [userId]
              };

              axios.post(
                "http://localhost:8080/api/groups/create",
                newGroup,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                }
              )
              .then(response => {
                console.log("Created new group:", response.data);
                setMyGroups(prev => [...prev, response.data]);
                alert(`Created new group: ${response.data.name}`);
              })
              .catch(error => {
                console.error("Error creating new group:", error);
                alert("Failed to create group. Please try again.");
              });
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Create a New Group for {selectedSubject}
          </button>
        </div>
      ) : filteredGroups.length === 0 && searchTerm ? (
        <div>
          <p className="text-gray-400 mb-4">No groups match your search criteria</p>
          <button
            onClick={() => setSearchTerm("")}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400">
              Showing {filteredGroups.length} of {availableGroups.length} groups
            </p>
            <button
              onClick={() => {
                const newGroup = {
                  name: `${selectedSubject} Study Group`,
                  description: `A study group for ${selectedSubject}`,
                  subject: selectedSubject,
                  maxCapacity: 20,
                  createdBy: userId,
                  members: [userId]
                };

                axios.post(
                  "http://localhost:8080/api/groups/create",
                  newGroup,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json"
                    }
                  }
                )
                .then(response => {
                  console.log("Created new group:", response.data);
                  setMyGroups(prev => [...prev, response.data]);
                  alert(`Created new group: ${response.data.name}`);
                })
                .catch(error => {
                  console.error("Error creating new group:", error);
                  alert("Failed to create group. Please try again.");
                });
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
            >
              Create New Group
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            {filteredGroups.map((group) => (
              <li
                key={group.id}
                className="flex items-center px-4 py-2 space-x-3 rounded-md bg-gray-800 hover:bg-gray-700"
              >
                <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-white">{group.name}</span>
                  <p className="text-sm text-gray-400">{group.subject}</p>
                  {group.description && (
                    <p className="text-xs text-gray-300 mt-1">{group.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {group.members.length} / {group.maxCapacity} members
                  </p>
                </div>
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AvailableGroupsList;

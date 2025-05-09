import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { Picker } from "emoji-mart";

const GroupChatWindow = ({ selectedGroup, token, userId }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch group messages when a group is selected
  useEffect(() => {
    const fetchGroupMessages = async () => {
      if (selectedGroup?.id) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/groups/${selectedGroup.id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching group messages:", error);
        }
      }
    };

    // Fetch group details to get members
    const fetchGroupDetails = async () => {
      if (selectedGroup?.id) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/groups/${selectedGroup.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setGroupMembers(response.data.members || []);
        } catch (error) {
          console.error("Error fetching group details:", error);
        }
      }
    };

    fetchGroupMessages();
    fetchGroupDetails();
  }, [selectedGroup, token]);

  // Set up WebSocket connection
  useEffect(() => {
    if (!token || !selectedGroup?.id) return;

    // Create a socket with token in URL for authentication
    const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("DEBUG ", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
    });

    // Add error handler
    client.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    client.onConnect = () => {
      console.log("Connected to WebSocket");
      
      // Subscribe to group topic
      client.subscribe(`/topic/group/${selectedGroup.id}`, (message) => {
        const notification = JSON.parse(message.body);
        
        // If it's a new message notification, add it to the messages
        if (notification.content) {
          const chatMessage = {
            id: notification.id,
            senderId: notification.senderId,
            groupId: notification.groupId,
            content: notification.content,
            timestamp: new Date().toISOString()
          };
          
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
        }
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [selectedGroup, token, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!stompClient) {
      console.error("WebSocket connection not established");
      return;
    }

    if (newMessage.trim() === "" || !selectedGroup?.id) {
      return;
    }

    try {
      const chatMessage = {
        senderId: userId,
        groupId: selectedGroup.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      // Check if client is connected before publishing
      if (stompClient.connected) {
        stompClient.publish({
          destination: "/app/group-chat",
          body: JSON.stringify(chatMessage),
          headers: { Authorization: `Bearer ${token}` }
        });

        // Add the message to the local state
        setMessages((prevMessages) => [...prevMessages, chatMessage]);
        setNewMessage("");
      } else {
        console.error("STOMP client is not connected");
        alert("Connection to chat server lost. Please refresh the page.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(newMessage + emoji.native);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const leaveGroup = async () => {
    if (!selectedGroup?.id) return;
    
    try {
      await axios.delete(
        `http://localhost:8080/api/groups/${selectedGroup.id}/members/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`You have left the group "${selectedGroup.name}"`);
      // The parent component should handle updating the UI
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Failed to leave the group. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full w-1/2">
      {selectedGroup ? (
        <>
          <div className="bg-gray-700 p-3 rounded-tr-md flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedGroup.name}
              </h3>
              <p className="text-sm text-gray-300">{selectedGroup.subject} • {groupMembers.length} members</p>
            </div>
            <button
              onClick={leaveGroup}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Leave Group
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.senderId === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${
                    message.senderId === userId
                      ? "bg-[#f9b172] text-white"
                      : "bg-[#676f9d] text-white"
                  }`}
                >
                  {message.senderId !== userId && (
                    <p className="text-xs font-bold">{message.senderId}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <small className="text-xs text-gray-200">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex items-center mt-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="flex-1 p-2 bg-gray-700 text-white rounded-bl-md mr-1"
            />
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-2 bg-gray-700 text-xl"
            >
              😀
            </button>

            {showEmojiPicker && <Picker onSelect={handleEmojiSelect} />}
            <button
              onClick={handleSendMessage}
              className="bg-[#f9b172] text-white px-4 py-2 rounded-br-md hover:bg-orange-500"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-800">
          <p className="text-gray-500">Select a group to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default GroupChatWindow;
import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { Picker } from "emoji-mart";

const ChatWindow = ({ selectedUsername, token, userId }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUsername) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/messages/${userId}/${selectedUsername}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedUsername, token, userId]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("DEBUG ", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    client.onConnect = () => {
      console.log("Connected to WebSocket");
      client.subscribe(`/user/${userId}/queue/messages`, (message) => {
        const chatMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, chatMessage]);
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (stompClient && newMessage.trim() !== "" && selectedUsername) {
      const chatMessage = {
        senderId: userId,
        recipientId: selectedUsername,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(chatMessage),
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add the message to the local state
      setMessages((prevMessages) => [...prevMessages, chatMessage]);
      setNewMessage("");
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

  return (
    <div className="flex flex-col h-full w-1/2">
      {selectedUsername ? (
        <>
          <h3 className="text-xl font-bold text-gray-700 mb-1 rounded-tr-md border-[2px] border-gray-800">
            Chat with {selectedUsername}
          </h3>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
            {messages.map((message, index) => (
              <div
                key={index}
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
        <p className="text-gray-500">Select a user to start a chat</p>
      )}
    </div>
  );
};

export default ChatWindow;
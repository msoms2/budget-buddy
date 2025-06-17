// NotificationList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/notifications");
      setNotifications(response.data);
    } catch (error) {
      // Handle error
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await axios.post(`/api/notifications/${id}/read`);
    fetchNotifications();
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notification-list">
      <h3>Notifications</h3>
      {notifications.length === 0 && <div>No notifications.</div>}
      <ul>
        {notifications.map((n) => (
          <li key={n.id} className={n.read_at ? "read" : "unread"}>
            <div>
              <strong>{n.title}</strong>
              <p>{n.content}</p>
              <small>{new Date(n.created_at).toLocaleString()}</small>
            </div>
            {!n.read_at && (
              <button onClick={() => markAsRead(n.id)}>Mark as read</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;

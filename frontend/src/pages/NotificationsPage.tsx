import { useEffect, useState } from 'react';
import api from '../api/client';
import type { AppNotification } from '../types';

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);

  async function load() {
    const res = await api.get<AppNotification[]>('/notifications');
    setItems(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: number) {
    await api.put(`/notifications/${id}/read`);
    load();
  }

  async function markAllRead() {
    await api.put('/notifications/read-all');
    load();
  }

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="row-between">
        <h2>Notifications {unreadCount > 0 && <span className="muted">({unreadCount} unread)</span>}</h2>
        {unreadCount > 0 && <button className="btn btn-light" onClick={markAllRead}>Mark all read</button>}
      </div>

      <div className="card">
        {items.length === 0 && <p className="muted">No notifications yet.</p>}

        {items.map((n) => (
          <div key={n.id} className="row-between" style={{ padding: '0.6rem 0', borderBottom: '1px solid #eee' }}>
            <div>
              <div className={n.isRead ? '' : 'unread'}>{n.message}</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>
                {n.type} · {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
            {!n.isRead && (
              <button className="btn btn-light btn-sm" onClick={() => markRead(n.id)}>Mark read</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

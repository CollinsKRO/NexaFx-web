"use client";

import { useState, useEffect } from "react";
import { Plus, Search, X, Loader2 } from "lucide-react";
import {
  getPushNotifications,
  createPushNotification,
  type PushNotification,
} from "@/lib/api/admin";

export default function PushNotificationsPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchList() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPushNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(title: string, message: string) {
    const created = await createPushNotification(title, message);
    setNotifications((prev) => [created, ...prev]);
    setToast("Notification sent");
  }

  const filtered = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white w-full max-w-xs">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm w-full bg-transparent"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#FFD552] text-black text-sm font-semibold hover:bg-[#f0c840] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create notification
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold mb-1">Error loading notifications</p>
          <p>{error}</p>
          <button
            onClick={fetchList}
            className="mt-2 underline text-xs font-semibold hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : (
        <NotificationTable data={filtered} />
      )}

      {modalOpen && (
        <CreateModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function NotificationTable({ data }: { data: PushNotification[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-12">
        No notifications found.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
            <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
              Message
            </th>
            <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((n) => (
            <tr key={n.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{n.title}</td>
              <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-xs truncate">
                {n.message}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={n.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">{n.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, message: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      await onCreate(title.trim(), message.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="font-bold text-base">
            New Push Notification
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notif-title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="notif-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition"
            />
          </div>

          <div>
            <label htmlFor="notif-message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="notif-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you want to say"
              required
              rows={4}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !message.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[#FFD552] text-black font-semibold hover:bg-[#f0c840] disabled:opacity-50 disabled:pointer-events-none transition"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/actions/notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const [notifsRes, countRes] = await Promise.all([
      getNotifications(),
      getUnreadCount(),
    ]);

    if (notifsRes.success) setNotifications(notifsRes.data);
    if (countRes.success) setUnreadCount(countRes.data);
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchNotifications();
    };
    load();

    // Polling every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-zinc-400 hover:text-white hover:bg-white/10 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white border-2 border-black animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-black/90 border-white/10 backdrop-blur-xl shadow-2xl z-60"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-white transition-colors"
              onClick={handleMarkAllRead}
            >
              Marcar lidas
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => handleMarkAsRead(notification.id)}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-zinc-500 text-sm">
                Nenhuma notificação por enquanto.
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-white/10 text-center">
            <Link
              href="/dashboard/fotografo/notificacoes"
              className="text-xs text-zinc-400 hover:text-white transition-colors py-2 block"
              onClick={() => setIsOpen(false)}
            >
              Ver todas
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notification, onRead, onClose }) {
  const Icon =
    {
      SUCCESS: Check,
      INFO: Info,
      WARNING: AlertTriangle,
      ERROR: AlertCircle,
    }[notification.type] || Info;

  const iconColor =
    {
      SUCCESS: "text-green-500",
      INFO: "text-blue-500",
      WARNING: "text-yellow-500",
      ERROR: "text-red-500",
    }[notification.type] || "text-zinc-500";

  return (
    <div
      className={cn(
        "p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group relative",
        !notification.read && "bg-white/5",
      )}
      onClick={() => {
        if (!notification.read) onRead();
      }}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "mt-1 p-1 rounded-full bg-zinc-900 shrink-0",
            iconColor,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "text-sm font-medium leading-none",
                notification.read ? "text-zinc-400" : "text-white",
              )}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-zinc-600">
              {formatTimeAgo(notification.createdAt)}
            </span>
            {notification.link && (
              <Link
                href={notification.link}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRead();
                  onClose();
                }}
              >
                Detalhes <ExternalLink className="h-2 w-2" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

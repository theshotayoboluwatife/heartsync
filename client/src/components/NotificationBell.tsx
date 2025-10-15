// src/components/notifications/NotificationBell.tsx
import { useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Notification {
  id: number;
  type: string;
  content: string;
  userId: number;
  createdAt: Date;
  isRead: boolean;
  relatedId: number | null;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Unread count
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread/count"],
    queryFn: async () => {
      if (!user) return { count: 0 };
      const res = await apiRequest("GET", "/api/notifications/unread/count");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // All notifications (only when popover is open)
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest("GET", "/api/notifications");
      return res.json();
    },
    enabled: !!user && open,
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/notifications/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread/count"],
      });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/all/read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread/count"],
      });
    },
  });

  // Handle click on a notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    switch (notification.type) {
      case "friend_request":
        navigate("/find-friends?tab=requests");
        break;
      case "friend_request_accepted":
        navigate("/find-friends?tab=friends");
        break;
      case "message":
        navigate("/messages");
        break;
      default:
        navigate("/notifications");
    }
  };

  const unreadCount = unreadCountData?.count || 0;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      markAllAsReadMutation.mutate(); // optional: mark all read when opened
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs min-w-[18px] h-[18px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>
              {unreadCount
                ? `You have ${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You have no new notifications"}
            </CardDescription>
          </CardHeader>

          <CardContent className="max-h-[300px] overflow-auto">
            {notifications && notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      !n.isRead ? "bg-muted font-medium" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={!n.isRead ? "font-semibold" : "font-normal"}
                      >
                        {n.content}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                No notifications to display
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-3 flex flex-col space-y-2">
            {notifications && notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
                markAllAsReadMutation.mutate();
              }}
            >
              View all notifications
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

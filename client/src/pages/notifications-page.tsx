import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth, authenticatedFetch } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/Navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatUTCTimestamp } from "@/lib/dateUtils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface Notification {
  id: number;
  type: string;
  content: string;
  userId: number;
  createdAt: Date;
  isRead: boolean;
  relatedId: number | null;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for all notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest("GET", "/api/notifications");
      return res.json();
    },
    enabled: !!user,
  });

  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/notifications/${notificationId}/read`,
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread/count"],
      });
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/all/read");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notifications cleared",
        description: "All notifications have been marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/notifications/unread/count"],
      });
    },
  });

  function renderInvite(n: Notification & { payload?: any }) {
    const { dateReference, gameTimestamptz } = n.payload || {};
    const time = gameTimestamptz ? formatUTCTimestamp(gameTimestamptz) : "";

    return (
      <>
        {n.content} {dateReference} at {time}.
        {n.relatedId && ` (Game ID: ${n.relatedId})`}
      </>
    );
  }

  function renderReminder(n: Notification & { payload?: any }) {
    const { dateReference, gameTimestamptz, location } = n.payload || {};
    const time = gameTimestamptz
      ? formatUTCTimestamp(gameTimestamptz) // Shows in viewer's timezone
      : "";
    return (
      <>
        {n.content} at {time}. Location: {location}.
        {n.relatedId && ` Game ID: ${n.relatedId}`}
      </>
    );
  }

  function renderThreeHourReminder(n: Notification & { payload?: any }) {
    const { timeReference, gameTimestamptz, location } = n.payload || {};
    const time = gameTimestamptz ? formatUTCTimestamp(gameTimestamptz) : "";
    return (
      <>
        Game starting soon: "{n.payload?.gameTitle}" is happening{" "}
        {timeReference} at {time} (in about 3 hours). Location: {location}. Game
        ID: {n.relatedId}.
      </>
    );
  }

  function renderNotification(notification: Notification & { payload?: any }) {
    switch (notification.type) {
      case "game_invite":
        return renderInvite(notification);
      case "game_reminder_day_before":
        return renderReminder(notification);
      case "game_reminder_three_hour":
        return renderThreeHourReminder(notification);
      default:
        return notification.content;
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Handle different notification types
    if (notification.type === "friend_request") {
      navigate("/find-friends?tab=requests");
    } else if (notification.type === "friend_request_accepted") {
      navigate("/find-friends?tab=friends");
    } else if (notification.type === "message") {
      navigate("/messages");
    } else if (
      notification.type === "games" ||
      notification.type === "game_invite"
    ) {
      navigate(`/games/${notification.relatedId}`);
    } else if (
      notification.type === "game_reminder_day_before" ||
      notification.type === "game_reminder_three_hour"
    ) {
      navigate(`/games/${notification.relatedId}`);
    }
  };

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const readNotifications = notifications?.filter((n) => n.isRead) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-gray-500 mt-1">
              Manage your notifications and updates
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadNotifications.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                    {unreadNotifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>
                      {notifications?.length
                        ? ``
                        : "No notifications to display"}
                    </CardDescription>
                  </div>
                  {notifications && notifications.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={
                        markAllAsReadMutation.isPending ||
                        unreadNotifications.length === 0
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark all as read
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 mx-auto animate-pulse text-gray-400" />
                      <p className="mt-2 text-gray-500">
                        Loading notifications...
                      </p>
                    </div>
                  ) : notifications && notifications.length > 0 ? (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            !notification.isRead
                              ? "bg-muted font-medium"
                              : "hover:bg-muted/50"
                          }`}
                          //   onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between">
                            <span
                              className={
                                !notification.isRead
                                  ? "font-semibold"
                                  : "font-normal"
                              }
                            >
                              {renderNotification(notification)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">
                        No notifications to display
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unread">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Unread Notifications</CardTitle>
                    <CardDescription>
                      {unreadNotifications.length
                        ? ``
                        : "No unread notifications"}
                    </CardDescription>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={markAllAsReadMutation.isPending}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark all as read
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 mx-auto animate-pulse text-gray-400" />
                      <p className="mt-2 text-gray-500">
                        Loading notifications...
                      </p>
                    </div>
                  ) : unreadNotifications.length > 0 ? (
                    <div className="space-y-2">
                      {unreadNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 rounded-md cursor-pointer transition-colors bg-muted font-medium"
                          //onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between">
                            <span className="font-semibold">
                              {renderNotification(notification)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto text-green-300" />
                      <p className="mt-2 text-gray-500">
                        You're all caught up!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="read">
              <Card>
                <CardHeader>
                  <CardTitle>Read Notifications</CardTitle>
                  <CardDescription>
                    {readNotifications.length
                      ? ``
                      : "No read notifications"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 mx-auto animate-pulse text-gray-400" />
                      <p className="mt-2 text-gray-500">
                        Loading notifications...
                      </p>
                    </div>
                  ) : readNotifications.length > 0 ? (
                    <div className="space-y-2">
                      {readNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 rounded-md cursor-pointer transition-colors hover:bg-muted/50"
                          // onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between">
                            <span>{renderNotification(notification)}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">
                        No read notifications to display
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Navigation/>
        </div>
      </main>
    </div>
  );
}

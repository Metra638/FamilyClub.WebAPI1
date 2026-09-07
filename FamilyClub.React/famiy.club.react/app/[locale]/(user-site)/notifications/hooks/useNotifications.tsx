// "use client";

// import { useCallback, useEffect, useState } from "react";
// import type { NotificationDTO } from "@/lib/api/generated/models";
// import { notificationService } from "@/lib/api/services";


// export default function useNotifications(clubMemberId?: string) {
//     const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
//     const [loadingNotifications, setLoadingNotifications] = useState(true);

//     const fetchNotifications = useCallback(async () => {
//         setLoadingNotifications(true);
//         try {
//             const data = await notificationService.apiNotificationsGet();
//             const filtered = clubMemberId
//                 ? data.filter((n) => n.clubMemberId === clubMemberId)
//                 : data;
//             setNotifications(filtered);
//         } catch (err) {
//             console.error("useNotifications failed:", err);
//         } finally {
//             setLoadingNotifications(false);
//         }
//     }, [clubMemberId]);

//     useEffect(() => {
//         fetchNotifications();
//     }, [fetchNotifications]);

//     const markAllAsRead = useCallback(async () => {
//         const unread = notifications.filter((n) => !n.isRead);
//         if (unread.length === 0) return;

//         setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

//         try {
//             await Promise.all(
//                 unread.map((n) =>
//                     notificationService.apiNotificationsIdPut({
//                         id: n.id as number,
//                         notificationDTO: { ...n, isRead: true },
//                     })
//                 )
//             );
//             window.dispatchEvent(new Event("notifications-updated"));
//         } catch (err) {
//             console.error("markAllAsRead failed:", err);
//             fetchNotifications();
//         }
//     }, [notifications, fetchNotifications]);

//     // threadOwnerId — id користувача, якому належить тред (ClubMemberId),
//     // senderId — id того, хто зараз пише (свій id для юзера, свій же для адміна)
//     const sendMessage = useCallback(
//         async (text: string, threadOwnerId: string, senderId: string) => {
//             const trimmed = text.trim();
//             if (!trimmed) return;

//             try {
//                 await notificationService.apiNotificationsPost({
//                     createNotificationDTO: {
//                         text: trimmed,
//                         clubMemberId: threadOwnerId,
//                         senderId,
//                     },
//                 });
//                 await fetchNotifications();
//                 window.dispatchEvent(new Event("notifications-updated"));
//             } catch (err) {
//                 console.error("sendMessage failed:", err);
//             }
//         },
//         [fetchNotifications]
//     );

//     return {
//         notifications,
//         loadingNotifications,
//         refetch: fetchNotifications,
//         markAllAsRead,
//         sendMessage,
//     };
// }
"use client";

import { useCallback, useEffect, useState } from "react";
import type { NotificationDTO } from "@/lib/api/generated/models";
import { notificationService } from "@/lib/api/services";

export default function useNotifications(clubMemberId?: string) {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!clubMemberId) {
            setNotifications([]);
            setLoadingNotifications(false);
            return;
        }

        setLoadingNotifications(true);

        try {
            const data = await notificationService.apiNotificationsGet();

            const filtered = data.filter(
                (n) => n.clubMemberId === clubMemberId
            );

            setNotifications(filtered);
        } catch (err) {
            console.error("useNotifications failed:", err);
        } finally {
            setLoadingNotifications(false);
        }
    }, [clubMemberId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        const unread = notifications.filter((n) => !n.isRead);

        if (unread.length === 0) return;

        setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true }))
        );

        try {
            await Promise.all(
                unread.map((n) =>
                    notificationService.apiNotificationsIdPut({
                        id: n.id as number,
                        notificationDTO: {
                            ...n,
                            isRead: true,
                        },
                    })
                )
            );

            window.dispatchEvent(
                new Event("notifications-updated")
            );
        } catch (err) {
            console.error("markAllAsRead failed:", err);
            await fetchNotifications();
        }
    }, [notifications, fetchNotifications]);

    const sendMessage = useCallback(
        async (
            text: string,
            threadOwnerId: string,
            senderId: string
        ) => {
            const trimmed = text.trim();

            if (!trimmed || !threadOwnerId || !senderId) {
                return;
            }

            try {
                await notificationService.apiNotificationsPost({
                    createNotificationDTO: {
                        text: trimmed,
                        clubMemberId: threadOwnerId,
                        senderId,
                    },
                });

                await fetchNotifications();

                window.dispatchEvent(
                    new Event("notifications-updated")
                );
            } catch (err) {
                console.error("sendMessage failed:", err);
            }
        },
        [fetchNotifications]
    );

    return {
        notifications,
        loadingNotifications,
        refetch: fetchNotifications,
        markAllAsRead,
        sendMessage,
    };
}
import { apiClient } from "../api-client";

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

// DTO shapes returned by the backend (defensive)
interface PushNotificationDto {
  id?: string | number;
  _id?: string | number;
  title?: string | null;
  message?: string | null;
  status?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
}

function mapNotification(dto: PushNotificationDto): PushNotification {
  const rawDate = dto.createdAt ?? dto.created_at;
  return {
    id: String(dto.id ?? dto._id ?? ""),
    title: String(dto.title ?? ""),
    message: String(dto.message ?? ""),
    status:
      dto.status === "Active" || dto.status === "active" ? "Active" : "Inactive",
    createdAt: rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A",
  };
}

export async function getPushNotifications(): Promise<PushNotification[]> {
  const res = await apiClient<
    { data?: PushNotificationDto[] } | PushNotificationDto[]
  >("/admin/push-notifications");
  const list = Array.isArray(res) ? res : (res?.data ?? []);
  return list.map(mapNotification);
}

export async function createPushNotification(
  title: string,
  message: string
): Promise<PushNotification> {
  const res = await apiClient<
    { data?: PushNotificationDto } | PushNotificationDto
  >("/admin/push-notifications", {
    method: "POST",
    body: JSON.stringify({ title, message }),
  });
  const dto =
    "data" in res && res.data ? res.data : (res as PushNotificationDto);
  return mapNotification(dto);
}

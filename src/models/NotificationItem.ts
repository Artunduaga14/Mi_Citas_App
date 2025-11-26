export interface NotificationItem {
  // Campos heredados de BaseModel
  id: number;
  isDeleted: boolean;
  registrationDate: string; // DateTime en C# → string en TS

  // Campos específicos de NotificationListDto
  title: string;
  citationId: number | null;
  message: string;
  statustypesId: number;
  statustypesName: string | null;
  typeNotification: TypeNotification;
  timeBlock: string | null; // TimeSpan en C# → string en TS (formato "HH:mm:ss")
  appointmentDate: string; // DateTime en C# → string en TS
  reltedPersonId: number | null;
  redirectUrl: string | null;
  userId: number;
}

export enum TypeNotification {
  System = 1,
  Reminder = 2,
  Warning = 3,
  Info = 4
}


// Helper para formatear fechas en español
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper para obtener información visual según el tipo
export const getNotificationTypeInfo = (type: TypeNotification) => {
  switch (type) {
    case TypeNotification.System:
      return {
        icon: "info",
        color: "#3B82F6",
        bgColor: "#EFF6FF"
      };
    case TypeNotification.Reminder:
      return {
        icon: "notifications-active",
        color: "#F59E0B",
        bgColor: "#FEF3C7"
      };
    case TypeNotification.Warning:
      return {
        icon: "warning",
        color: "#EF4444",
        bgColor: "#FEE2E2"
      };
    case TypeNotification.Info:
      return {
        icon: "info-outline",
        color: "#10B981",
        bgColor: "#D1FAE5"
      };
    default:
      return {
        icon: "notifications",
        color: "#6B7280",
        bgColor: "#F3F4F6"
      };
  }
};
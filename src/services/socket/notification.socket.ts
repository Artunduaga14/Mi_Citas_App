import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environment/environment.dev";
import { NotificationItem } from "../../models/NotificationItem";

class NotificationSocketService {
  private connection?: HubConnection;
  private items$ = new BehaviorSubject<NotificationItem[]>([]);
  readonly notifications$ = this.items$.asObservable();

  async connect(token: string) {
    if (this.connection) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace("/api", "")}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on("ReceiveNotification", (notification) => {
      console.log("📨 Nueva Notificación:", notification);
      const old = this.items$.value;
      this.items$.next([notification, ...old]);
    });

    await this.connection.start();
    console.log("📡 Socket de notificaciones conectado");
  }
}

export const notificationSocket = new NotificationSocketService();
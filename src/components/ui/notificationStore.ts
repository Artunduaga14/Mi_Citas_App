import { BehaviorSubject, map } from "rxjs";
import { NotificationItem } from "../../models/NotificationItem";

class NotificationStore {
  private _list$ = new BehaviorSubject<NotificationItem[]>([]);
  list$ = this._list$.asObservable();

  setNotifications(list: NotificationItem[]) {
    this._list$.next(list);
  }

  addNotification(item: NotificationItem) {
    const current = this._list$.value;
    this._list$.next([item, ...current]);
  }

  get unreadCount() {
    return this._list$.value.length; // si manejas "read" luego lo ajustamos
  }

  unreadCount$ = this.list$.pipe(
    map((items) => items.length)
  );
}

export const notificationStore = new NotificationStore();
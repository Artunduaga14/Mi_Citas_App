// src/components/ui/__tests__/notificationStore.test.ts
import { notificationStore } from "../notificationStore";

describe("notificationStore", () => {
  beforeEach(() => {
    // Dejamos el store limpio antes de cada test
    notificationStore.setNotifications([]);
  });

  it("debe iniciar sin notificaciones (unreadCount = 0)", () => {
    expect(notificationStore.unreadCount).toBe(0);
  });

  it("setNotifications debe reemplazar la lista y actualizar unreadCount", (done) => {
    const mockList = [
      { id: 1, title: "Noti 1" } as any,
      { id: 2, title: "Noti 2" } as any,
    ];

    const values: number[] = [];
    const sub = notificationStore.unreadCount$.subscribe((v) => {
      values.push(v);
      // Cuando tengamos 2 valores (0 inicial y 2 actualizado), validamos
      if (values.length === 2) {
        try {
          expect(values[0]).toBe(0); // valor inicial
          expect(values[1]).toBe(2); // luego de setNotifications
          expect(notificationStore.unreadCount).toBe(2);
          done();
        } finally {
          sub.unsubscribe();
        }
      }
    });

    notificationStore.setNotifications(mockList);
  });

  it("addNotification debe agregar una notificación al inicio y actualizar unreadCount", () => {
    const inicial = [{ id: 1, title: "Vieja" } as any];
    notificationStore.setNotifications(inicial);

    const nueva = { id: 2, title: "Nueva" } as any;
    notificationStore.addNotification(nueva);

    expect(notificationStore.unreadCount).toBe(2);

    // Para comprobar el orden, nos suscribimos a list$
    const recibido: any[] = [];
    const sub = (notificationStore as any).list$.subscribe((list: any[]) => {
      recibido.splice(0, recibido.length, ...list);
    });

    expect(recibido[0]).toEqual(nueva);
    expect(recibido[1]).toEqual(inicial[0]);

    sub.unsubscribe();
  });

  it("unreadCount$ debe emitir el número de notificaciones en cada cambio", (done) => {
    const valores: number[] = [];
    const sub = notificationStore.unreadCount$.subscribe((v) => {
      valores.push(v);
      if (valores.length === 3) {
        try {
          // 0: inicial
          // 1: después de agregar una
          // 2: después de agregar otra
          expect(valores).toEqual([0, 1, 2]);
          done();
        } finally {
          sub.unsubscribe();
        }
      }
    });

    const n1 = { id: 1, title: "N1" } as any;
    const n2 = { id: 2, title: "N2" } as any;

    notificationStore.addNotification(n1);
    notificationStore.addNotification(n2);
  });
});

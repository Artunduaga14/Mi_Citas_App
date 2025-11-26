import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environment/environment.dev";

export interface Horario {
  hora: string;
  estaDisponible: boolean;
  bookedCitationId?: number | null;
  lockedBy?: number | null;
  lockedUntil?: string | null;
  scheduleHourId: number;
}

export interface SlotKey {
  scheduleHourId: number;
  date: string;
  timeBlock: string;
}

export interface SlotLockRequest extends SlotKey {}
export interface SlotUnlockRequest extends SlotKey {}

export class SocketService {
  private hubUrl = `${environment.apiUrl.replace('/api', '')}${environment.hubs.appointments}`;
  private connection?: HubConnection;
  private scheduleHourId!: number;
  private dateISO!: string;

  private blocksMap = new Map<string, Horario>();
  private blocks$ = new BehaviorSubject<Horario[]>([]);
  readonly blocksChanges$ = this.blocks$.asObservable();

  async connect(token: string) {
    if (this.connection) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on('SlotLocked', (evt) => this.applyLocked(evt));
    this.connection.on('SlotUnlocked', (evt) => this.applyUnlocked(evt));
    this.connection.on('SlotBooked', (evt) => this.applyBooked(evt));

    await this.connection.start();
    console.log('✅ Conectado al hub de citas');
  }

  async joinDay(scheduleHourId: number, date: string) {
    this.scheduleHourId = scheduleHourId;
    this.dateISO = date;
    await this.connection?.invoke('JoinDay', scheduleHourId, new Date(date));
  }

  async leaveDay() {
    if (!this.connection) return;
    await this.connection.invoke('LeaveDay', this.scheduleHourId, new Date(this.dateISO));
  }

  setBlocks(list: Horario[]) {
    this.blocksMap.clear();
    for (const h of list) this.blocksMap.set(h.hora, { ...h });
    this.emitBlocks();
  }

  async lock(time: string) {
    const req: SlotLockRequest = { scheduleHourId: this.scheduleHourId, date: this.dateISO, timeBlock: time };
    return await this.connection?.invoke('LockSlot', req);
  }

  async unlock(time: string) {
    const req: SlotUnlockRequest = { scheduleHourId: this.scheduleHourId, date: this.dateISO, timeBlock: time };
    return await this.connection?.invoke('UnlockSlot', req);
  }

  async confirm(time: string,relatedPersonId?: number) {
    const slot: SlotKey = { scheduleHourId: this.scheduleHourId, date: this.dateISO, timeBlock: time };
    return await this.connection?.invoke('ConfirmSlot', slot,  relatedPersonId ?? null );
  }

  private applyLocked(evt: any) {
    if (!this.matchContext(evt.slot)) return;
    const it = this.blocksMap.get(evt.slot.timeBlock);
    if (!it) return;
    this.blocksMap.set(evt.slot.timeBlock, {
      ...it,
      estaDisponible: false,
      lockedBy: evt.lockOwnerUserId,
      lockedUntil: evt.lockedUntil,
    });
    this.emitBlocks();
  }

  private applyUnlocked(evt: any) {
    if (!this.matchContext(evt.slot)) return;
    const it = this.blocksMap.get(evt.slot.timeBlock);
    if (!it) return;
    this.blocksMap.set(evt.slot.timeBlock, {
      ...it,
      estaDisponible: !it.bookedCitationId,
      lockedBy: null,
      lockedUntil: null,
    });
    this.emitBlocks();
  }

  private applyBooked(evt: any) {
    if (!this.matchContext(evt.slot)) return;
    const it = this.blocksMap.get(evt.slot.timeBlock);
    if (!it) return;
    this.blocksMap.set(evt.slot.timeBlock, {
      ...it,
      estaDisponible: false,
      bookedCitationId: evt.citationId,
    });
    this.emitBlocks();
  }

  private matchContext(slot: SlotKey): boolean {
    return (
      slot.scheduleHourId === this.scheduleHourId &&
      slot.date.slice(0, 10) === this.dateISO.slice(0, 10)
    );
  }

  private emitBlocks() {
    this.blocks$.next(
      Array.from(this.blocksMap.values()).sort((a, b) => a.hora.localeCompare(b.hora))
    );
  }
}

export const socketService = new SocketService();
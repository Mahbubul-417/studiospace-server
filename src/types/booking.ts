export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface Booking {
  _id?: string;
  studioId: string;
  studioTitle: string;
  studioImage: string;
  hostId: string;
  hostEmail: string;
  userId: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
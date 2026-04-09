// types/index.ts

export type UserRole = "customer" | "driver" | "admin";

export type OrderStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface AddressWithCoords {
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
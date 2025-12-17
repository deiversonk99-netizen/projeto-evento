
export const EventStatus = {
  PROPOSAL: 'PROPOSTA',
  CONFIRMED: 'CONFIRMADO',
  COMPLETED: 'REALIZADO',
  CANCELLED: 'CANCELADO',
  CLOSED: 'FECHADO'
} as const;

export type EventStatusType = typeof EventStatus[keyof typeof EventStatus];

export interface Product {
  id: string;
  name: string;
  unitCost: number;
  factor: number;
}

export interface ExtraCost {
  id: string;
  name: string;
  cost: number;
}

export interface Package {
  id: string;
  name: string;
  productIds: string[];
}

export interface EventItem {
  productId: string;
  qtyPlanned: number;
  qtyReal?: number;
}

export interface EventExtra {
  extraId: string;
  cost: number;
}

export interface AppEvent {
  id: string;
  clientName: string;
  clientDoc: string;
  date: string;
  time: string;
  duration: number;
  pax: number;
  items: EventItem[];
  extras: EventExtra[];
  desiredMargin: number;
  status: EventStatusType;
  plannedCost: number;
  plannedPrice: number;
  realCost?: number;
  realRevenue?: number;
  notes?: string;
  paymentTerms?: string;
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalPlannedRevenue: number;
  totalRealProfit: number;
}

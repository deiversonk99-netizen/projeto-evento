
export enum EventStatus {
  PROPOSAL = 'PROPOSTA',
  CONFIRMED = 'CONFIRMADO',
  COMPLETED = 'REALIZADO',
  CANCELLED = 'CANCELADO',
  CLOSED = 'FECHADO'
}

export interface Product {
  id: string;
  name: string;
  unitCost: number;
  factor: number; // Consumption coefficient (e.g. 0.85 per person)
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
  clientDoc: string; // CPF or CNPJ
  date: string;
  time: string;
  duration: number; // hours
  pax: number;
  items: EventItem[];
  extras: EventExtra[];
  desiredMargin: number; // percentage
  status: EventStatus;
  
  // Financial fields
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

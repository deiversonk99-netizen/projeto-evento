
import { createClient } from '@supabase/supabase-js';
import { AppEvent, Product, ExtraCost, Package, EventStatusType } from './types';

const SUPABASE_URL = 'https://glgpmpngxiyxlwjavzgl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_A1ds8HCH_hTP0t7T7SLXow_E-QXTiBC';

let supabase: any;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Cliente Supabase inicializado.");
} catch (e) {
  console.error("Falha ao inicializar cliente Supabase:", e);
}

export const ApiService = {
  // EVENTOS
  getEvents: async (): Promise<AppEvent[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(e => ({
        id: e.id,
        clientName: e.client_name,
        clientDoc: e.client_doc,
        date: e.date,
        time: e.time || '',
        duration: e.duration,
        pax: e.pax,
        desiredMargin: e.desired_margin,
        status: e.status as EventStatusType,
        plannedCost: e.planned_cost,
        plannedPrice: e.planned_price,
        realCost: e.real_cost,
        realRevenue: e.real_revenue,
        paymentTerms: e.payment_terms,
        items: e.items || [],
        extras: e.extras_list || []
      })) as AppEvent[];
    } catch (error: any) {
      console.error('Erro ao buscar eventos:', error.message);
      return [];
    }
  },

  saveEvent: async (event: AppEvent): Promise<void> => {
    if (!supabase) return;
    
    // Tratamento para evitar erro de sintaxe "TIME" no Postgres
    const eventPayload = {
      id: event.id,
      client_name: event.clientName,
      client_doc: event.clientDoc,
      date: event.date || null,
      time: event.time || null, // Corrigido: envia NULL se estiver vazio
      duration: event.duration,
      pax: event.pax,
      desired_margin: event.desiredMargin,
      status: event.status,
      planned_cost: event.plannedCost,
      planned_price: event.plannedPrice,
      real_cost: event.realCost || null,
      real_revenue: event.realRevenue || null,
      payment_terms: event.paymentTerms,
      items: event.items,
      extras_list: event.extras
    };

    const { error } = await supabase
      .from('events')
      .upsert(eventPayload);

    if (error) {
      console.error('Erro ao salvar evento no Supabase:', error.message);
      throw new Error(`Erro no Supabase: ${error.message}`);
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // PRODUTOS
  getProducts: async (): Promise<Product[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        unitCost: Number(p.unit_cost),
        factor: Number(p.factor)
      })) as Product[];
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error.message);
      return [];
    }
  },

  saveProduct: async (product: Product): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase
      .from('products')
      .upsert({
        id: product.id,
        name: product.name,
        unit_cost: product.unitCost,
        factor: product.factor
      });
    
    if (error) {
      throw new Error(error.message);
    }
  },

  // EXTRAS
  getExtras: async (): Promise<ExtraCost[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('extras').select('*');
      if (error) throw error;
      return data.map(ex => ({
        id: ex.id,
        name: ex.name,
        cost: Number(ex.cost)
      })) as ExtraCost[];
    } catch (e) {
      return [];
    }
  },

  saveExtra: async (extra: ExtraCost): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('extras').upsert({
      id: extra.id,
      name: extra.name,
      cost: extra.cost
    });
    if (error) throw error;
  },

  // PACOTES
  getPackages: async (): Promise<Package[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('packages').select('*');
      if (error) throw error;
      return (data || []).map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          productIds: pkg.product_ids
      }));
    } catch (e) {
      return [];
    }
  },

  savePackage: async (pkg: Package): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('packages').upsert({
        id: pkg.id,
        name: pkg.name,
        product_ids: pkg.productIds
    });
    if (error) throw error;
  }
};


import React, { useEffect, useState } from 'react';
import { AppEvent, EventStatus } from '../../types';
import { ApiService } from '../../api';
import { 
  Search, 
  Filter, 
  FileText, 
  Trash2,
  CalendarCheck
} from 'lucide-react';

interface EventListProps {
  onNavigate: (view: any, id?: string) => void;
}

export const EventList: React.FC<EventListProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    ApiService.getEvents().then(data => {
      setEvents(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este evento do banco SQL?')) {
      await ApiService.deleteEvent(id);
      fetchEvents();
    }
  };

  const filteredEvents = events.filter(e => 
    e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.clientDoc.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={18} /> Filtros
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente / Doc</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data & Hora</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nº Pessoas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-sm text-slate-800">
                    {event.clientName}<br/><span className="text-xs font-normal text-slate-500">{event.clientDoc}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}<br/>{event.time}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{event.pax} pax</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">R$ {Number(event.plannedPrice).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      event.status === EventStatus.CONFIRMED ? 'bg-emerald-100 text-emerald-700' :
                      event.status === EventStatus.PROPOSAL ? 'bg-blue-100 text-blue-700' :
                      event.status === EventStatus.CLOSED ? 'bg-slate-100 text-slate-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{event.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onNavigate('edit-event', event.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><FileText size={18} /></button>
                      <button onClick={() => onNavigate('closing', event.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CalendarCheck size={18} /></button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Banco SQL vazio.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

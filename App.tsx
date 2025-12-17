
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { EventList } from './components/Events/EventList';
import { EventForm } from './components/Events/EventForm';
import { EventClosing } from './components/Events/EventClosing';
import { ProductList } from './components/Backoffice/ProductList';
import { ExtraCostList } from './components/Backoffice/ExtraCostList';
import { PackageList } from './components/Backoffice/PackageList';
import { ReportView } from './components/Reports/ReportView';

type View = 'dashboard' | 'events' | 'new-event' | 'edit-event' | 'closing' | 'products' | 'extras' | 'packages' | 'reports';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Componente App montado com sucesso.");
  }, []);

  const navigateTo = (view: View, id: string | null = null) => {
    setCurrentView(view);
    setSelectedEventId(id);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={navigateTo} />;
      case 'events': return <EventList onNavigate={navigateTo} />;
      case 'new-event': return <EventForm onNavigate={navigateTo} />;
      case 'edit-event': return <EventForm onNavigate={navigateTo} eventId={selectedEventId} />;
      case 'closing': return <EventClosing onNavigate={navigateTo} eventId={selectedEventId!} />;
      case 'products': return <ProductList />;
      case 'extras': return <ExtraCostList />;
      case 'packages': return <PackageList />;
      case 'reports': return <ReportView />;
      default: return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={navigateTo}>
      {renderView()}
    </Layout>
  );
}

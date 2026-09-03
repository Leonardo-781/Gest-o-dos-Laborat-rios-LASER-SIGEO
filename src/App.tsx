import React, { useState } from 'react';
import { LabProvider } from './context/LabContext';
import { Navbar } from './components/Navbar';
import { ScheduleView } from './components/ScheduleView';
import { BookingModal } from './components/BookingModal';
import { EventDetailModal } from './components/EventDetailModal';
import { RequestTracker } from './components/RequestTracker';
import { AdminPanel } from './components/AdminPanel';
import { EquipmentManager } from './components/EquipmentManager';
import { StatsView } from './components/StatsView';
import { LabRulesModal } from './components/LabRulesModal';
import { AuthModal } from './components/AuthModal';
import { PdfScheduleImporter } from './components/PdfScheduleImporter';
import { AuditLogView } from './components/AuditLogView';
import { ClassEditModal } from './components/ClassEditModal';
import { MaintenanceRequestView } from './components/MaintenanceRequestView';
import { SoftwareRequestView } from './components/SoftwareRequestView';
import { MaintenanceManagementView } from './components/MaintenanceManagementView';
import { EmailNotificationsModal } from './components/EmailNotificationsModal';
import { ActiveTab } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('grade');

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Barra Superior */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'grade' && (
          <div className="space-y-4">
            <ScheduleView />
          </div>
        )}

        {activeTab === 'solicitar_manutencao' && (
          <div>
            <MaintenanceRequestView />
          </div>
        )}

        {activeTab === 'solicitar_software' && (
          <div>
            <SoftwareRequestView />
          </div>
        )}

        {activeTab === 'rastrear' && (
          <div>
            <RequestTracker />
          </div>
        )}

        {activeTab === 'gestao_manutencao' && (
          <div>
            <MaintenanceManagementView />
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <AdminPanel />
          </div>
        )}

        {activeTab === 'importar_pdf' && (
          <div>
            <PdfScheduleImporter />
          </div>
        )}

        {activeTab === 'auditoria' && (
          <div>
            <AuditLogView />
          </div>
        )}

        {activeTab === 'equipamentos' && (
          <div>
            <EquipmentManager />
          </div>
        )}

        {activeTab === 'indicadores' && (
          <div>
            <StatsView />
          </div>
        )}
      </main>

      {/* Modais Globais */}
      <BookingModal />
      <EventDetailModal />
      <ClassEditModal />
      <LabRulesModal />
      <AuthModal />
      <EmailNotificationsModal />

      {/* Rodapé Institucional */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-6 mt-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">Departamento de Engenharia de Agrimensura e Cartografia</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Laboratório de Sensoriamento Remoto - LASER (Sala 1B209) • Laboratório de SIG e Geoprocessamento - SIGEO (Sala 1B307) • Sala dos Técnicos (Sala 1B308)
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Horário de atendimento: Segunda a Sexta das 07h10 às 18h30
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <LabProvider>
      <AppContent />
    </LabProvider>
  );
}

export default App;

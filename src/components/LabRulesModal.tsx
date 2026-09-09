import React from 'react';
import { 
  X, 
  BookOpen, 
  ShieldAlert, 
  Compass, 
  Globe, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useLab } from '../context/LabContext';

export const LabRulesModal: React.FC = () => {
  const { isRulesOpen, setIsRulesOpen, labs } = useLab();

  if (!isRulesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden transition-all my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <button
            onClick={() => setIsRulesOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/30 text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Normas de Uso e Segurança dos Laboratórios</h3>
              <p className="text-xs text-slate-400 mt-0.5">Departamento de Engenharia de Agrimensura e Cartografia</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
          
          {/* Normas LASER */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>Regulamento do Laboratório de Sensoriamento Remoto - LASER (Sala 1B309)</span>
            </div>
            
            <ul className="space-y-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              {labs.laser.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Normas SIGEO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Regulamento do Laboratório de SIG e Geoprocessamento - SIGEO (Sala 1B307)</span>
            </div>
            
            <ul className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              {labs.sigeo.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advertência de Responsabilidade */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-amber-900 leading-relaxed">
              <strong>Importante:</strong> Danos materiais causados por negligência ou uso indevido de equipamentos de alta precisão (Laser Scanner, Receptores GNSS, Estações Totais ou Workstations) serão apurados pela coordenação do curso.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsRulesOpen(false)}
            className="px-6 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};

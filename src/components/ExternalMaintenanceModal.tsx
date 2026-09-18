import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Truck, 
  Check, 
  X, 
  Building2, 
  FileText, 
  Calendar, 
  Sparkles, 
  Cpu, 
  ShieldCheck,
  Package
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { Equipment } from '../types';

interface ExternalMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

const QUICK_COMPANIES = [
  'DIMAN - Diretoria de Manutenção (UFU)',
  'DTI - Diretoria de Tecnologia da Informação (UFU)',
  'Leica Geosystems Brasil',
  'Trimble / Santiago & Cintra',
  'Topcon / Embratop Geotecnologias',
  'Laboratório de Calibração Especializada'
];

const COMMON_ACCESSORIES = [
  'Gabinete Completo com Lacre',
  'Fonte de Alimentação ATX',
  'Disco Rígido (HDD/SSD)',
  'Placa de Vídeo Dedicada',
  'Cabo de Força',
  'Estojo Rígido de Transporte',
  '2x Baterias Recarregáveis',
  'Carregador de Baterias',
  'Cabo de Transferência / USB',
  'Certificado de Garantia / NFe'
];

export const ExternalMaintenanceModal: React.FC<ExternalMaintenanceModalProps> = ({
  isOpen,
  onClose,
  equipment
}) => {
  const { sendEquipmentToExternalMaintenance, currentUser } = useLab();

  const [companyName, setCompanyName] = useState('');
  const [serviceOrder, setServiceOrder] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [accessories, setAccessories] = useState('');
  const [responsibleTech, setResponsibleTech] = useState(currentUser?.name || 'Leonardo Cardoso');

  useEffect(() => {
    if (equipment) {
      setDefectDescription(equipment.maintenanceReason || '');
      const isDiman = (equipment.externalCompany && equipment.externalCompany.includes('DIMAN')) ||
                      (equipment.maintenanceReason && equipment.maintenanceReason.includes('DIMAN'));
      setCompanyName(equipment.externalCompany || (isDiman ? 'DIMAN - Diretoria de Manutenção (UFU)' : ''));
      setServiceOrder(equipment.externalServiceOrder || (isDiman && equipment.patrimonio ? `OS-DIMAN-2026/${equipment.patrimonio}` : ''));
      setExpectedReturnDate(equipment.externalExpectedReturn || '');
      setAccessories(isDiman ? 'Gabinete completo, fonte de alimentação ATX e cabo de força' : '');
      setResponsibleTech(currentUser?.name || 'Leonardo Cardoso');
    }
  }, [equipment, currentUser]);

  if (!isOpen || !equipment) return null;

  const handleAddAccessory = (acc: string) => {
    if (!accessories) {
      setAccessories(acc);
    } else if (!accessories.includes(acc)) {
      setAccessories(prev => `${prev}, ${acc}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      alert('Informe a empresa ou assistência técnica autorizada de destino.');
      return;
    }

    if (!defectDescription.trim()) {
      alert('Descreva o defeito identificado na máquina.');
      return;
    }

    const res = sendEquipmentToExternalMaintenance({
      equipmentId: equipment.id,
      companyName: companyName.trim(),
      serviceOrder: serviceOrder.trim() || undefined,
      defectDescription: defectDescription.trim(),
      expectedReturnDate: expectedReturnDate || undefined,
      accessories: accessories.trim() || undefined,
      responsibleTechnician: responsibleTech.trim() || currentUser?.name || 'Técnico Responsável'
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 md:p-6 flex items-start sm:items-center justify-center min-h-screen">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl sm:max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-scale-up">
        
        {/* Header com tema púrpura de Manutenção Externa */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl border border-white/20">
              <Truck className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Guia de Envio para Manutenção Externa
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                  Uso Interno
                </span>
              </div>
              <p className="text-xs text-purple-200/90 mt-0.5">
                Gera a movimentação e bloqueia o equipamento no laboratório com rastreio de O.S.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com corpo rolável interno e rodapé fixo */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Informações Fixas do Equipamento */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    equipment.labId === 'laser' 
                      ? 'bg-blue-100 text-blue-800' 
                      : equipment.labId === 'sigeo' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    LAB {equipment.labId.toUpperCase()}
                  </span>
                  <span className="font-bold text-slate-900">{equipment.name}</span>
                </div>
                <span className="text-slate-500 text-[11px] mt-0.5 block">
                  Código: <strong className="font-mono text-slate-700">{equipment.code}</strong> • 
                  Sala de Origem: <strong>{equipment.labId === 'ltgeo' ? 'LTGEO (1B210)' : equipment.labId === 'laser' ? 'LASER (1B309)' : 'SIGEO (1B307)'}</strong>
                </span>
              </div>

              {equipment.patrimonio && (
                <span className="font-mono font-bold text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0">
                  Pat. {equipment.patrimonio}
                </span>
              )}
            </div>

            {/* 1. Defeito Apresentado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Defeito Identificado / Motivo do Envio *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Ex: Compensador eletrônico descalibrado, acusando erro constante no eixo vertical ao nivelar..."
                value={defectDescription}
                onChange={(e) => setDefectDescription(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900 resize-none"
              />
            </div>

            {/* 2. Empresa / Assistência Técnica */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Empresa / Assistência Técnica Autorizada de Destino *
                </label>
                <span className="text-[10px] text-purple-700 font-semibold">Atalhos rápidos:</span>
              </div>
              <input
                type="text"
                required
                placeholder="Ex: Leica Geosystems Brasil - São Paulo / SP"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {QUICK_COMPANIES.map(comp => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setCompanyName(comp)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-md transition cursor-pointer"
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Número da O.S. e Previsão de Retorno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nº da Ordem de Serviço (O.S.) / Guia de Remessa
                </label>
                <input
                  type="text"
                  placeholder="Ex: OS-2026/1089 ou NF-e 4452"
                  value={serviceOrder}
                  onChange={(e) => setServiceOrder(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Previsão Estimada de Retorno
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
                />
              </div>
            </div>

            {/* 4. Acessórios Enviados com o Equipamento */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Acessórios Acompanhantes Enviados para a Assistência
                </label>
                <span className="text-[10px] text-slate-400">Clique para adicionar:</span>
              </div>
              <input
                type="text"
                placeholder="Ex: Estojo rígido, 2 baterias recarregáveis, carregador de tomada..."
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {COMMON_ACCESSORIES.map(acc => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => handleAddAccessory(acc)}
                    className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                  >
                    + {acc}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Técnico Responsável pelo Envio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Técnico Responsável pela Autorização do Envio *
              </label>
              <input
                type="text"
                required
                value={responsibleTech}
                onChange={(e) => setResponsibleTech(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Rodapé e Ações Fixo */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Confirmar Envio p/ Manutenção Externa</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

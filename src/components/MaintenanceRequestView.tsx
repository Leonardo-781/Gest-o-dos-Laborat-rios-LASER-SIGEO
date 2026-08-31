import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  HelpCircle, 
  Clock, 
  Cpu, 
  Send,
  Compass,
  Globe,
  Sparkles,
  Info
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabId, MaintenanceUrgency } from '../types';

export const MaintenanceRequestView: React.FC = () => {
  const { 
    labs, 
    equipments, 
    currentUser, 
    createMaintenanceRequest,
    setIsAuthModalOpen
  } = useLab();

  const [labId, setLabId] = useState<LabId>('sigeo');
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [urgency, setUrgency] = useState<MaintenanceUrgency>('media');
  const [problemDescription, setProblemDescription] = useState<string>('');
  
  // Applicant details
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [applicantId, setApplicantId] = useState<string>('');

  const [generatedProtocol, setGeneratedProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill from logged-in user
  useEffect(() => {
    if (currentUser) {
      setApplicantName(currentUser.name);
      setApplicantEmail(currentUser.email);
      setApplicantId(currentUser.documentId);
    }
  }, [currentUser]);

  const labEquipments = equipments.filter(eq => eq.labId === labId);

  const handleCopyProtocol = () => {
    if (generatedProtocol) {
      navigator.clipboard.writeText(generatedProtocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalEquipmentName = customItemName;
    if (equipmentId) {
      const selectedEq = equipments.find(e => e.id === equipmentId);
      if (selectedEq) {
        finalEquipmentName = `${selectedEq.name} (${selectedEq.code})`;
      }
    }

    if (!finalEquipmentName.trim()) {
      alert('Informe qual computador, bancada ou equipamento necessita de manutenção.');
      return;
    }

    const res = createMaintenanceRequest({
      labId,
      equipmentId: equipmentId || undefined,
      equipmentName: finalEquipmentName,
      urgency,
      problemDescription,
      applicantName: applicantName || currentUser?.name || 'Solicitante Anônimo',
      applicantEmail: applicantEmail || currentUser?.email || 'email@universidade.edu.br',
      applicantPhone,
      applicantRole: currentUser?.role || 'aluno',
      applicantId: applicantId || currentUser?.documentId || 'Não informado'
    });

    if (res.success && res.protocol) {
      setGeneratedProtocol(res.protocol);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header com Identidade Visual */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-xs">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Solicitar Manutenção & Averiguação de Máquinas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reporte computadores travando, periféricos danificados ou instrumentos com erro de leitura nos laboratórios Laser e Sigeo.
            </p>
          </div>
        </div>

        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>A equipe técnica na <strong>Sala 1B308</strong> recebe e analisa todos os chamados.</span>
        </div>
      </div>

      {/* Tela de Confirmação com Protocolo */}
      {generatedProtocol ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-5 animate-scale-up">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-slate-900">Chamado de Manutenção Aberto com Sucesso!</h4>
            <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto">
              Sua solicitação no <strong>{labs[labId].fullName}</strong> foi enviada diretamente para a fila de atendimento do corpo técnico.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Protocolo de Manutenção</span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="font-mono text-xl font-black text-amber-700">
                {generatedProtocol}
              </span>
              <button
                onClick={handleCopyProtocol}
                className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer border border-amber-200"
                title="Copiar código do chamado"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Você pode acompanhar o diagnóstico e a resolução do chamado na aba <strong>"Rastrear Pedido"</strong> a qualquer momento.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setGeneratedProtocol(null);
                setProblemDescription('');
                setCustomItemName('');
                setEquipmentId('');
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Abrir Outro Chamado
            </button>
          </div>
        </div>
      ) : (
        /* Formulário de Manutenção */
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          
          {/* 1. Escolha do Laboratório */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Em qual laboratório está o equipamento?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setLabId('sigeo')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                  labId === 'sigeo'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs text-emerald-950 block">LABORATÓRIO SIGEO</span>
                    <span className="text-[11px] text-slate-500">Sala 1B307 • 24 Workstations & Plotter</span>
                  </div>
                </div>
                {labId === 'sigeo' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>

              <div
                onClick={() => setLabId('laser')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                  labId === 'laser'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-bold text-xs text-blue-950 block">LABORATÓRIO LASER</span>
                    <span className="text-[11px] text-slate-500">Sala 1B209 • Sensores, GNSS & Scanners</span>
                  </div>
                </div>
                {labId === 'laser' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
            </div>
          </div>

          {/* 2. Seleção ou Especificação da Máquina */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              2. Identificação da Máquina / Equipamento:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Selecione da lista de patrimônio (Opcional):
                </label>
                <select
                  value={equipmentId}
                  onChange={(e) => {
                    setEquipmentId(e.target.value);
                    if (e.target.value) setCustomItemName('');
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="">-- Selecionar item cadastrado --</option>
                  {labEquipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.code}) {eq.status === 'manutencao' ? '[Já em Manutenção]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Ou digite a identificação (Ex: Bancada 07, Mouse, Teclado, Tripé):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Workstation 07, Monitor da Bancada 14, Plotter A0..."
                  value={customItemName}
                  disabled={Boolean(equipmentId)}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* 3. Nível de Urgência */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              3. Nível de Gravidade / Urgência:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setUrgency('baixa')}
                className={`p-2.5 rounded-xl border font-bold transition cursor-pointer text-center ${
                  urgency === 'baixa'
                    ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>Baixa</div>
                <span className="text-[10px] font-normal text-slate-400">Pequeno ajuste</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('media')}
                className={`p-2.5 rounded-xl border font-bold transition cursor-pointer text-center ${
                  urgency === 'media'
                    ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>Média</div>
                <span className="text-[10px] font-normal text-slate-500">Uso parcial afetado</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('alta')}
                className={`p-2.5 rounded-xl border font-bold transition cursor-pointer text-center ${
                  urgency === 'alta'
                    ? 'bg-orange-100 border-orange-400 text-orange-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>Alta</div>
                <span className="text-[10px] font-normal text-slate-500">Máquina inoperante</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('critica')}
                className={`p-2.5 rounded-xl border font-bold transition cursor-pointer text-center ${
                  urgency === 'critica'
                    ? 'bg-rose-100 border-rose-400 text-rose-950 shadow-xs ring-1 ring-rose-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div>Crítica ⚠️</div>
                <span className="text-[10px] font-normal text-slate-500">Risco / Prejudica aula</span>
              </button>
            </div>
          </div>

          {/* 4. Descrição Detalhada do Problema */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              4. Relato e Sintomas do Defeito:
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o que está acontecendo. Ex: A máquina emite bips e desliga ao abrir o Metashape; O prumo a laser não acende; Cabo com mau contato..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 leading-relaxed font-medium"
            />
          </div>

          {/* 5. Dados do Solicitante */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              5. Seus Dados de Contato:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Seu Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Nome de quem está reportando"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">E-mail Institucional:</label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@universidade.edu.br"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Matrícula / SIAPE:</label>
                <input
                  type="text"
                  placeholder="Ex: 20240192"
                  value={applicantId}
                  onChange={(e) => setApplicantId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Chamado para a Equipe Técnica</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

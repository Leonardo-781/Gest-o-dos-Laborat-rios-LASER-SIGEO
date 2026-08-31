import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  CheckCircle2, 
  Copy, 
  Check, 
  Send, 
  Globe, 
  Compass, 
  Code, 
  FileCode, 
  Sparkles, 
  Calendar, 
  Info,
  Layers,
  Terminal
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabId, SoftwareScope, SoftwareLicenseType } from '../types';

export const SoftwareRequestView: React.FC = () => {
  const { labs, currentUser, createSoftwareRequest } = useLab();

  const [labId, setLabId] = useState<LabId>('sigeo');
  const [softwareName, setSoftwareName] = useState('');
  const [softwareVersion, setSoftwareVersion] = useState('');
  const [targetScope, setTargetScope] = useState<SoftwareScope>('todas_maquinas');
  const [specificWorkstations, setSpecificWorkstations] = useState('');
  const [licenseType, setLicenseType] = useState<SoftwareLicenseType>('open_source_gratuito');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [justification, setJustification] = useState('');
  const [courseOrProject, setCourseOrProject] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');

  // Applicant details
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantId, setApplicantId] = useState('');

  const [generatedProtocol, setGeneratedProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setApplicantName(currentUser.name);
      setApplicantEmail(currentUser.email);
      setApplicantId(currentUser.documentId);
    }
  }, [currentUser]);

  const handleCopyProtocol = () => {
    if (generatedProtocol) {
      navigator.clipboard.writeText(generatedProtocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = createSoftwareRequest({
      labId,
      softwareName,
      softwareVersion: softwareVersion || undefined,
      targetScope,
      specificWorkstations: targetScope === 'maquinas_especificas' ? specificWorkstations : undefined,
      licenseType,
      downloadUrl: downloadUrl || undefined,
      justification,
      courseOrProject: courseOrProject || undefined,
      deadlineDate: deadlineDate || undefined,
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
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-xs">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Solicitação de Instalação & Atualização de Softwares
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Peça a inclusão de novos programas, bibliotecas Python, plugins QGIS/Metashape ou atualizações para aulas práticas e pesquisas.
            </p>
          </div>
        </div>

        <div className="text-xs bg-purple-50 border border-purple-200 text-purple-900 p-2.5 rounded-xl font-medium flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>Instalações são homologadas e testadas previamente na <strong>Sala 1B308</strong>.</span>
        </div>
      </div>

      {/* Confirmação com Protocolo */}
      {generatedProtocol ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-5 animate-scale-up">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-slate-900">Pedido de Software Registrado com Sucesso!</h4>
            <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto">
              O pedido de instalação de <strong>{softwareName}</strong> no {labs[labId].fullName} foi encaminhado para a equipe técnica de TI/Laboratórios.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Protocolo do Pedido de Software</span>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="font-mono text-xl font-black text-purple-700">
                {generatedProtocol}
              </span>
              <button
                onClick={handleCopyProtocol}
                className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition cursor-pointer border border-purple-200"
                title="Copiar código"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Você pode acompanhar o andamento da instalação na aba <strong>"Rastrear Pedido"</strong> com seu código de protocolo.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setGeneratedProtocol(null);
                setSoftwareName('');
                setSoftwareVersion('');
                setJustification('');
                setDownloadUrl('');
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Fazer Outra Solicitação
            </button>
          </div>
        </div>
      ) : (
        /* Formulário de Software */
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          
          {/* 1. Laboratório Alvo */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Laboratório onde o software deve ser instalado:
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
                    <span className="font-bold text-xs text-emerald-950 block">LABORATÓRIO SIGEO (Recomendado)</span>
                    <span className="text-[11px] text-slate-500">Sala 1B307 • 24 Workstations RTX com QGIS/Metashape</span>
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
                    <span className="text-[11px] text-slate-500">Sala 1B209 • 6 Bancadas de Processamento de Campo</span>
                  </div>
                </div>
                {labId === 'laser' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
            </div>
          </div>

          {/* 2. Informações do Software */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              2. Dados do Software / Pacote / Plugin:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nome do Software / Plugin:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CloudCompare, Agisoft Metashape, SCP Plugin para QGIS, Blender GIS..."
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Versão Desejada (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: v2.13, Última estável"
                  value={softwareVersion}
                  onChange={(e) => setSoftwareVersion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Escopo de Instalação:</label>
                <select
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value as SoftwareScope)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium cursor-pointer focus:ring-2 focus:ring-purple-500"
                >
                  <option value="todas_maquinas">Todas as 24 Workstations (Turma inteira)</option>
                  <option value="maquinas_especificas">Bancadas específicas (Grupo de pesquisa / TCC)</option>
                  <option value="servidor">Apenas no Servidor de Processamento</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tipo de Licenciamento:</label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value as SoftwareLicenseType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium cursor-pointer focus:ring-2 focus:ring-purple-500"
                >
                  <option value="open_source_gratuito">Gratuito / Código Aberto (Open Source / GNU)</option>
                  <option value="institucional">Licença Acadêmica Institucional da Universidade</option>
                  <option value="licenca_propria">Licença Própria do Projeto / Pesquisa</option>
                  <option value="trial">Versão de Avaliação / Demonstração (Trial)</option>
                </select>
              </div>
            </div>

            {targetScope === 'maquinas_especificas' && (
              <div className="animate-fade-in text-xs">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Quais bancadas / máquinas?</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bancadas 01, 02, 03 e 04"
                  value={specificWorkstations}
                  onChange={(e) => setSpecificWorkstations(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <div className="text-xs">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Link Oficial para Download ou Documentação:</label>
              <input
                type="url"
                placeholder="https://exemplo.org/download/..."
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* 3. Justificativa e Prazos */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              3. Justificativa Acadêmica & Prazos:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Disciplina / Projeto Demandante:</label>
                <input
                  type="text"
                  placeholder="Ex: AGR-PDI, TCC Fotogrametria, Projeto de Extensão"
                  value={courseOrProject}
                  onChange={(e) => setCourseOrProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Data Limite Necessária (Prazo da Aula/Pesquisa):</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Justificativa e Finalidade de Uso:</label>
              <textarea
                required
                rows={2}
                placeholder="Explique porque este software é necessário e como será utilizado pelos alunos/pesquisadores..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 leading-relaxed font-medium"
              />
            </div>
          </div>

          {/* 4. Dados do Solicitante */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              4. Seus Dados de Contato:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Seu Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do solicitante"
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
                  placeholder="email@universidade.edu.br"
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
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Pedido de Instalação de Software</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

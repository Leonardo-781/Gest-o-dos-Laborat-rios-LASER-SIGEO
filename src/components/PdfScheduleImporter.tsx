import React, { useState } from 'react';
import { 
  FileUp, 
  FileText, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Clock, 
  User, 
  Trash2, 
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Compass,
  Globe
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { ParsedPdfClass, LabId } from '../types';
import { extractTextFromPdfFile, parseTimetableText, SAMPLE_PDF_TEXT } from '../services/pdfParser';

export const PdfScheduleImporter: React.FC = () => {
  const { bulkImportPdfClasses, currentUser } = useLab();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedClasses, setParsedClasses] = useState<ParsedPdfClass[]>([]);
  const [semester, setSemester] = useState('2026/1');
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setSuccessMessage(null);

    try {
      const text = await extractTextFromPdfFile(file);
      const results = parseTimetableText(text, semester);
      setParsedClasses(results);
    } catch (err: any) {
      alert(`Erro ao processar PDF: ${err.message || err}. Você também pode colar o texto da grade diretamente.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    setFileName('oferta_horarios_agrimensura_2026_1.pdf');
    setIsProcessing(true);
    setSuccessMessage(null);

    setTimeout(() => {
      const results = parseTimetableText(SAMPLE_PDF_TEXT, semester);
      setParsedClasses(results);
      setIsProcessing(false);
    }, 400);
  };

  const handleProcessManualText = () => {
    if (!manualText.trim()) return;
    setIsProcessing(true);
    setFileName('Texto da Grade Colado');
    const results = parseTimetableText(manualText, semester);
    setParsedClasses(results);
    setIsProcessing(false);
  };

  const toggleSelectAll = (checked: boolean) => {
    setParsedClasses(prev => prev.map(c => ({ ...c, selected: checked })));
  };

  const toggleSelectClass = (id: string) => {
    setParsedClasses(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const updateClassLab = (id: string, newLab: LabId) => {
    setParsedClasses(prev => prev.map(c => c.id === id ? { ...c, suggestedLab: newLab } : c));
  };

  const handleImportSelected = () => {
    const selected = parsedClasses.filter(c => c.selected);
    if (selected.length === 0) {
      alert('Nenhuma disciplina selecionada para importação.');
      return;
    }

    bulkImportPdfClasses(selected, fileName || 'Documento PDF');
    setSuccessMessage(`${selected.length} disciplinas foram importadas com sucesso para a grade semestral!`);
    setParsedClasses([]);
    setFileName(null);
  };

  const selectedCount = parsedClasses.filter(c => c.selected).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <FileUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Importador Inteligente de Horários via PDF
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Envie o documento PDF oficial da grade semestral da Agrimensura para extrair e cadastrar automaticamente todas as disciplinas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1.5 border border-blue-200"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Testar com Exemplo da Agrimensura</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mensagem de Sucesso */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Área de Upload e Entrada */}
      {parsedClasses.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Caixa de Upload do Arquivo PDF */}
          <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <FileUp className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">Selecione o arquivo PDF da grade</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Formatos compatíveis: PDF com texto de oferta de horários e turmas do departamento.
              </p>
            </div>

            <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Escolher Arquivo PDF</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
            </label>

            {isProcessing && (
              <div className="text-xs text-blue-600 font-semibold animate-pulse flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Extraindo dados e classificando disciplinas...
              </div>
            )}
          </div>

          {/* Opção Alternativa: Colar Texto da Grade */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Ou cole o texto da grade:</h4>
              <button
                onClick={() => setManualText(SAMPLE_PDF_TEXT)}
                className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Colar modelo padrão
              </button>
            </div>

            <textarea
              rows={5}
              placeholder="Cole aqui o texto copiado do SIGA ou PDF com as disciplinas e horários..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleProcessManualText}
              disabled={!manualText.trim() || isProcessing}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Processar Texto Copiado
            </button>
          </div>

        </div>
      )}

      {/* Tabela de Revisão dos Dados Extraídos */}
      {parsedClasses.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Disciplinas Identificadas no Documento</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  {selectedCount} de {parsedClasses.length} selecionadas
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Revise os horários e o laboratório sugerido antes de confirmar a gravação na grade oficial.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setParsedClasses([])}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportSelected}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Inserir na Grade ({selectedCount})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedCount === parsedClasses.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Disciplina Extraída</th>
                  <th className="p-3">Docente</th>
                  <th className="p-3">Dia & Horário</th>
                  <th className="p-3">Laboratório Sugerido</th>
                  <th className="p-3">Confiança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {parsedClasses.map(item => (
                  <tr key={item.id} className={`hover:bg-slate-50 transition ${item.selected ? 'bg-blue-50/20' : 'opacity-60'}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelectClass(item.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{item.courseCode}</td>
                    <td className="p-3 font-bold text-slate-900">{item.courseName}</td>
                    <td className="p-3 text-slate-600">{item.professor}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{item.dayName}</span>
                      <span className="block font-mono text-[11px] text-slate-500">{item.startTime} - {item.endTime}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={item.suggestedLab}
                        onChange={(e) => updateClassLab(item.id, e.target.value as LabId)}
                        className={`text-xs font-bold rounded-lg p-1.5 border cursor-pointer ${
                          item.suggestedLab === 'laser'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <option value="laser">LAB LASER (Sensores)</option>
                        <option value="sigeo">LAB SIGEO (Geoprocessamento)</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};

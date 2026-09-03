import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Clock, 
  BookOpen, 
  User, 
  Layers, 
  AlertTriangle,
  Compass,
  Globe,
  Sparkles
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabId, FixedClass } from '../types';

export const ClassEditModal: React.FC = () => {
  const { 
    isClassModalOpen, 
    setIsClassModalOpen, 
    editingClass, 
    addFixedClass, 
    editFixedClass, 
    deleteFixedClass,
    currentUser
  } = useLab();

  const [labId, setLabId] = useState<LabId>('sigeo');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('08:50');
  const [endTime, setEndTime] = useState<string>('12:20');
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [professor, setProfessor] = useState<string>('');
  const [semester, setSemester] = useState<string>('2026/1');
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const isEditing = Boolean(editingClass?.id);

  useEffect(() => {
    if (isClassModalOpen && editingClass) {
      setLabId(editingClass.labId);
      setDayOfWeek(editingClass.dayOfWeek);
      setStartTime(editingClass.startTime);
      setEndTime(editingClass.endTime);
      setCourseCode(editingClass.courseCode);
      setCourseName(editingClass.courseName);
      setProfessor(editingClass.professor);
      setSemester(editingClass.semester || '2026/1');
      setIsHighlighted(Boolean(editingClass.highlightColor));
      setNotes(editingClass.notes || '');
    }
  }, [isClassModalOpen, editingClass]);

  if (!isClassModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const highlightColor = isHighlighted 
      ? 'bg-rose-100 text-rose-950 border-rose-300' 
      : undefined;

    if (isEditing && editingClass) {
      editFixedClass(editingClass.id, {
        labId,
        dayOfWeek,
        startTime,
        endTime,
        courseCode,
        courseName,
        professor,
        semester,
        highlightColor,
        notes
      });
    } else {
      addFixedClass({
        labId,
        dayOfWeek,
        startTime,
        endTime,
        courseCode,
        courseName,
        professor,
        semester,
        highlightColor,
        notes
      });
    }

    setIsClassModalOpen(false);
  };

  const handleDelete = () => {
    if (editingClass?.id && confirm(`Deseja realmente remover a disciplina "${courseName}" da grade semestral?`)) {
      deleteFixedClass(editingClass.id);
      setIsClassModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <button
            onClick={() => setIsClassModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isEditing ? 'Editar Disciplina da Grade' : 'Cadastrar Nova Disciplina na Grade'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Modificação de horários oficiais dos laboratórios Laser e Sigeo
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Seletor de Laboratório */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Laboratório Designado:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLabId('laser')}
                className={`p-3 rounded-xl border-2 transition text-left cursor-pointer flex items-center gap-2.5 ${
                  labId === 'laser'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <div>LAB LASER</div>
                  <span className="text-[10px] font-normal text-slate-500">Sensores / Topografia</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLabId('sigeo')}
                className={`p-3 rounded-xl border-2 transition text-left cursor-pointer flex items-center gap-2.5 ${
                  labId === 'sigeo'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div>LAB SIGEO</div>
                  <span className="text-[10px] font-normal text-slate-500">Geoprocessamento / SIG</span>
                </div>
              </button>
            </div>
          </div>

          {/* Nome e Código */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Código da Turma:</label>
              <input
                type="text"
                required
                placeholder="Ex: AGR-SIG"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nome da Disciplina:</label>
              <input
                type="text"
                required
                placeholder="Ex: SIG (Sistemas de Informação Geográfica)"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Professor e Semestre */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Docente / Professor (Opcional):</label>
              <input
                type="text"
                placeholder="Nome do docente (opcional)"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Semestre:</label>
              <input
                type="text"
                required
                placeholder="2026/1"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-center font-bold text-slate-700 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dia da Semana e Horários */}
          <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Dia da Semana:</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>Segunda-feira</option>
                <option value={2}>Terça-feira</option>
                <option value={3}>Quarta-feira</option>
                <option value={4}>Quinta-feira</option>
                <option value={5}>Sexta-feira</option>
                <option value={6}>Sábado</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Horário Início:</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs font-bold focus:ring-1 focus:ring-blue-500 text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Horário Término:</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs font-bold focus:ring-1 focus:ring-blue-500 text-center"
              />
            </div>
          </div>

          {/* Destaque Visual (ex: Florestal / Agronomia em vermelho) */}
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-rose-950 block">Destacar na Grade com Cor Diferenciada (Vermelho/Laranja)</span>
                <span className="text-[10px] text-rose-700 block mt-0.5">
                  Recomendado para turmas externas (ex: Engenharia Florestal no SIGEO ou Agronomia no LASER).
                </span>
              </div>
            </label>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Observações da Turma:</label>
            <input
              type="text"
              placeholder="Ex: 4 tempos práticos no laboratório"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Aula</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Salvar Modificações' : 'Cadastrar Aula na Grade'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

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
  Sparkles,
  Palette,
  Lock
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
    canUserManageLab,
    currentUser,
    showToast
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
  const [isExternal, setIsExternal] = useState<boolean>(false);
  const [customColor, setCustomColor] = useState<'padrao' | 'azul' | 'verde' | 'laranja' | 'vermelho'>('padrao');
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
      
      const ext = editingClass.isExternal !== undefined
        ? Boolean(editingClass.isExternal)
        : Boolean(editingClass.highlightColor?.includes('rose') || editingClass.customColor === 'vermelho');
      setIsHighlighted(ext);
      setIsExternal(ext);
      const defaultLabColor = editingClass.labId === 'laser' ? 'azul' : (editingClass.labId === 'ltgeo' ? 'laranja' : 'verde');
      setCustomColor(ext ? 'vermelho' : (editingClass.customColor && editingClass.customColor !== 'vermelho' ? editingClass.customColor : defaultLabColor));
      setNotes(editingClass.notes || '');
    } else if (isClassModalOpen && !editingClass) {
      setIsExternal(false);
      setCustomColor('padrao');
      if (currentUser?.role === 'tecnico') {
        const myLabs = currentUser.assignedLabs ?? ['laser', 'sigeo'];
        if (myLabs.length > 0 && !myLabs.includes(labId)) {
          setLabId(myLabs[0]);
        }
      }
    }
  }, [isClassModalOpen, editingClass]);

  if (!isClassModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUserManageLab(labId)) {
      alert(`Você não tem permissão técnica para gerenciar horários do laboratório ${labId.toUpperCase()}.`);
      return;
    }

    const defaultLabColor: 'azul' | 'verde' | 'laranja' = labId === 'laser' ? 'azul' : (labId === 'ltgeo' ? 'laranja' : 'verde');
    const effectiveColor: 'padrao' | 'azul' | 'verde' | 'laranja' | 'vermelho' = isExternal 
      ? 'vermelho' 
      : (customColor !== 'padrao' && customColor !== 'vermelho' ? customColor : defaultLabColor);

    const highlightColor = isExternal
      ? 'bg-rose-100 text-rose-950 border-rose-300'
      : (effectiveColor === 'azul'
        ? 'bg-blue-50 text-blue-950 border-blue-200'
        : (effectiveColor === 'laranja'
          ? 'bg-orange-50 text-orange-950 border-orange-200'
          : 'bg-emerald-50 text-emerald-950 border-emerald-200'));

    const payload = {
      labId,
      dayOfWeek,
      startTime,
      endTime,
      courseCode,
      courseName,
      professor,
      semester,
      isExternal,
      customColor: effectiveColor,
      highlightColor,
      notes: notes || undefined
    };

    if (isEditing && editingClass) {
      editFixedClass(editingClass.id, payload);
    } else {
      addFixedClass(payload);
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-auto animate-scale-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {isEditing ? 'Editar Aula da Grade Semestral' : 'Nova Aula na Grade Semestral'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Grade de horários do curso de Engenharia de Agrimensura e Cartografia
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsClassModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Seletor de Laboratório */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              1. Laboratório da Aula:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'laser' as LabId, name: 'LAB LASER', room: 'Sala 1B309', icon: Compass, color: 'blue' },
                { id: 'sigeo' as LabId, name: 'LAB SIGEO', room: 'Sala 1B307', icon: Globe, color: 'emerald' },
                { id: 'ltgeo' as LabId, name: 'LAB LTGEO', room: 'Sala 1B210', icon: Compass, color: 'orange' },
              ].map(item => {
                const isAllowed = canUserManageLab(item.id);
                const isSelected = labId === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!isAllowed) {
                        showToast(`Você não possui autorização técnica para o laboratório ${item.name}.`);
                        return;
                      }
                      setLabId(item.id);
                    }}
                    className={`p-2.5 rounded-xl border-2 transition text-left flex items-center justify-between ${
                      isSelected
                        ? item.color === 'blue'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                          : item.color === 'emerald'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                          : 'border-orange-600 bg-orange-50/70 text-orange-950 font-bold shadow-xs'
                        : isAllowed
                        ? 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                        : 'border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${
                        item.color === 'blue' ? 'text-blue-600' : item.color === 'emerald' ? 'text-emerald-600' : 'text-orange-600'
                      } flex-shrink-0`} />
                      <div>
                        <div className="text-xs">{item.name}</div>
                        <span className="text-[10px] font-normal text-slate-500">{item.room}</span>
                      </div>
                    </div>
                    {!isAllowed && (
                      <span className="text-[9px] text-amber-700 font-bold flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </button>
                );
              })}
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

          {/* Destaque Visual e Cor da Aula */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-600" />
                <span>Aula Externa / Outro Curso?</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Cor na Grade
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsExternal(false);
                  setIsHighlighted(false);
                  setCustomColor(labId === 'laser' ? 'azul' : (labId === 'ltgeo' ? 'laranja' : 'verde'));
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isExternal
                    ? 'bg-white border-slate-300 text-slate-800 shadow-xs ring-2 ring-slate-400/20'
                    : 'bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span>Não (Turma Interna)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExternal(true);
                  setIsHighlighted(true);
                  setCustomColor('vermelho');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isExternal
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs ring-2 ring-rose-500/30'
                    : 'bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Sim (Aula Externa / Vermelho)</span>
              </button>
            </div>

            {/* Seletor de cores da disciplina */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-600 block">
                Cor da Disciplina na Grade:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomColor('azul');
                    setIsExternal(false);
                    setIsHighlighted(false);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    customColor === 'azul'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50/50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                  <span>Azul (LASER)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomColor('verde');
                    setIsExternal(false);
                    setIsHighlighted(false);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    customColor === 'verde'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50/50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span>Verde (SIGEO)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomColor('laranja');
                    setIsExternal(false);
                    setIsHighlighted(false);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    customColor === 'laranja'
                      ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50/50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span>Laranja (LTGEO)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomColor('vermelho');
                    setIsExternal(true);
                    setIsHighlighted(true);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    customColor === 'vermelho' || isExternal
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50/50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 flex-shrink-0" />
                  <span>Vermelho (Externa)</span>
                </button>
              </div>
            </div>
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

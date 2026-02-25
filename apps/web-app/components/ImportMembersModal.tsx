
import React from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2, AlertTriangle, ChevronRight, FileSpreadsheet, Loader2 } from 'lucide-react';
import { MemberImportService, ImportValidationResult } from '../services/memberImportService';
import { Member } from '../types';
import { DataRepository } from '../services/dataRepository';

interface ImportMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: Member[];
  onImportComplete: () => void;
}

const ImportMembersModal: React.FC<ImportMembersModalProps> = ({ isOpen, onClose, existingMembers, onImportComplete }) => {
  const [step, setStep] = React.useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [validationResults, setValidationResults] = React.useState<ImportValidationResult[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [summary, setSummary] = React.useState({ success: 0, failed: 0, error: '' });

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const results = await MemberImportService.parseAndValidate(file, existingMembers);
      setValidationResults(results);
      setStep('preview');
    } catch (err) {
      alert('Error al procesar el archivo. Verifique que sea un Excel válido.');
    }
  };

  const handleConfirmImport = async () => {
    const validMembers = validationResults
      .filter(r => r.status !== 'error')
      .map(r => ({
        ...r.data,
        id: crypto.randomUUID()
      })) as Member[];

    if (validMembers.length === 0) {
      alert('No hay registros válidos para importar.');
      return;
    }

    setStep('importing');
    setIsImporting(true);

    const result = await DataRepository.bulkCreateMembers(validMembers);

    setIsImporting(false);
    if (result.success) {
      setSummary({
        success: validMembers.length,
        failed: validationResults.length - validMembers.length,
        error: ''
      });
      setStep('results');
      onImportComplete();
    } else {
      setSummary(prev => ({ ...prev, error: result.error || 'Error desconocido' }));
      setStep('results');
    }
  };

  const errorsCount = validationResults.filter(r => r.status === 'error').length;
  const warningsCount = validationResults.filter(r => r.status === 'warning').length;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-white rounded-t-[2.5rem] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Importar Socios</h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Carga masiva desde Excel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">

          {step === 'upload' && (
            <div className="space-y-8 py-4">
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-[2rem] p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <FileSpreadsheet size={40} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-emerald-950">Selecciona tu archivo Excel</h4>
                  <p className="text-sm text-emerald-700 max-w-xs mx-auto mt-2">
                    Asegúrate de usar nuestra plantilla para que el mapeo de datos sea perfecto.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <label className="cursor-pointer bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 hover:-translate-y-1 transition-all active:scale-95">
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileSelect} />
                    Explorar Archivos
                  </label>
                  <button
                    onClick={() => MemberImportService.downloadTemplate()}
                    className="flex items-center gap-2 text-emerald-700 font-bold text-sm hover:underline"
                  >
                    <Download size={16} /> Descargar Plantilla de Ejemplo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">Reglas de Importación</h5>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-xs text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>El <strong>Número de Socio</strong> debe ser único.</span>
                    </li>
                    <li className="flex gap-3 text-xs text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>Si falta el DNI, el registro se importa con una advertencia.</span>
                    </li>
                    <li className="flex gap-3 text-xs text-slate-600">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>Categorías válidas: "General" o "Grupo Familiar".</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-4">¿Qué pasa con los duplicados?</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nuestra herramienta detectará si un DNI o Número de Socio ya existe en la base de datos.
                    En la siguiente pantalla, podrás revisar qué filas tienen conflictos para corregirlas antes de guardar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-6 rounded-3xl border">
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Filas</p>
                    <p className="text-2xl font-black text-slate-900">{validationResults.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">Errores</p>
                    <p className="text-2xl font-black text-red-600">{errorsCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Advertencias</p>
                    <p className="text-2xl font-black text-amber-600">{warningsCount}</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setStep('upload')}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm"
                  >
                    Volver
                  </button>
                  <button
                    disabled={errorsCount === validationResults.length}
                    onClick={handleConfirmImport}
                    className="flex-1 sm:flex-none px-8 py-3 bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-800 disabled:opacity-50 transition-all"
                  >
                    Importar {validationResults.length - errorsCount} Socios
                  </button>
                </div>
              </div>

              <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                    <tr>
                      <th className="px-6 py-4">Fila</th>
                      <th className="px-6 py-4">Socio</th>
                      <th className="px-6 py-4">DNI</th>
                      <th className="px-6 py-4">Estado / Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {validationResults.map((res) => (
                      <tr key={res.row} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">#{res.row}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">{res.data.first_name} {res.data.last_name}</span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">N° {res.data.member_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{res.data.dni || '---'}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {res.status === 'valid' && (
                              <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase">
                                <CheckCircle2 size={14} /> Listo para importar
                              </div>
                            )}
                            {res.errors.map((err, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-red-600 text-[10px] font-black uppercase">
                                <AlertCircle size={14} /> {err}
                              </div>
                            ))}
                            {res.warnings.map((warn, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-amber-600 text-[10px] font-black uppercase">
                                <AlertTriangle size={14} /> {warn}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-20 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center shadow-lg border-2 border-emerald-50">
                  <Loader2 size={48} className="text-emerald-600 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">Sincronizando con la nube...</h4>
                <p className="text-slate-500 font-medium mt-2">Estamos guardando los nuevos socios en Supabase.</p>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="py-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                <CheckCircle2 size={56} />
              </div>
              <div>
                <h4 className="text-3xl font-black text-slate-900">Proceso Finalizado</h4>
                <p className="text-slate-500 font-medium mt-2">Se han procesado todos los registros del archivo.</p>
              </div>

              {summary.error ? (
                <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-100 rounded-3xl text-left">
                  <p className="text-xs font-black uppercase text-red-400 tracking-widest mb-2">Error Crítico</p>
                  <p className="text-sm font-bold text-red-700">{summary.error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Importados</p>
                    <p className="text-3xl font-black text-emerald-950">{summary.success}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Omitidos</p>
                    <p className="text-3xl font-black text-slate-900">{summary.failed}</p>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="px-12 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl hover:-translate-y-1 transition-all"
              >
                Finalizar
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ImportMembersModal;


import React from 'react';
import { Member, MemberPayment, MembershipRate } from '../types';
import { MONTHS } from '../constants';
import { Check, Clock, AlertCircle, FileText, Printer, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface PaymentsManagementProps {
  socio: Member;
  pagos: MemberPayment[];
  config: MembershipRate[];
  onRegister: (meses: number[]) => MemberPayment[];
  onClose: () => void;
}

const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ socio, pagos, config, onRegister, onClose }) => {
  const [selectedMeses, setSelectedMeses] = React.useState<number[]>([]);
  const [lastRegisteredPagos, setLastRegisteredPagos] = React.useState<MemberPayment[]>([]);
  const [showConfirmPayment, setShowConfirmPayment] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const añoActual = new Date().getFullYear();

  const toggleMes = (mes: number) => {
    if (selectedMeses.includes(mes)) {
      setSelectedMeses(selectedMeses.filter(m => m !== mes));
    } else {
      setSelectedMeses([...selectedMeses, mes].sort((a, b) => a - b));
    }
  };

  const isPagado = (mes: number) => pagos.some(p => p.mes === mes && p.año === añoActual && !p.anulado);

  const getCuotaValor = (mes: number) => {
    const c = config.find(cf => cf.mes === mes && cf.año === añoActual && cf.categoria === socio.categoria);
    return c ? c.valor : 2500;
  };

  const totalSeleccionado = selectedMeses.reduce((acc, mes) => acc + getCuotaValor(mes), 0);

  const handleRegister = () => {
    const createdPagos = onRegister(selectedMeses);
    setLastRegisteredPagos(createdPagos);
    setSelectedMeses([]);
    setShowConfirmPayment(false);
    setShowSuccessModal(true); // Mostrar el prompt de impresión inmediatamente
  };

  const generateReceiptHTML = (pago: MemberPayment) => `
    <div class="receipt-box" style="border: 2px solid #064e3b; padding: 30px; border-radius: 20px; max-width: 600px; margin: 0 auto 40px auto; page-break-after: always;">
      <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #f0fdf4; padding-bottom: 20px; margin-bottom: 20px;">
        <div>
          <h1 class="club-name" style="color: #064e3b; font-size: 24px; font-weight: 900; margin: 0;">C.D. 1° DE MAYO</h1>
          <p style="margin:0; font-size: 10px; color: #666;">Chajarí, Entre Ríos - CUIT: 30-67086212-3</p>
        </div>
        <div style="text-align: right;">
          <p class="receipt-num" style="color: #666; font-size: 14px;">RECIBO N° <strong>${pago.recibo_numero}</strong></p>
          <p style="font-size: 12px;">Fecha: ${new Date(pago.fecha_pago).toLocaleDateString()}</p>
        </div>
      </div>
      <div class="info-grid" style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div>
          <p class="label" style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #059669;">Socio</p>
          <p class="value" style="font-size: 16px; font-weight: bold;">${socio.nombre} ${socio.apellido} (#${socio.numero_socio})</p>
        </div>
        <div>
          <p class="label" style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #059669;">Concepto</p>
          <p class="value" style="font-size: 16px; font-weight: bold;">Cuota Social ${MONTHS[pago.mes - 1]} / ${pago.año}</p>
        </div>
      </div>
      <div class="total" style="background: #f0fdf4; padding: 20px; border-radius: 15px; text-align: right;">
        <p class="label" style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #059669;">Monto Abonado</p>
        <p class="total-val" style="font-size: 28px; font-weight: 900; color: #064e3b;">$${pago.monto.toLocaleString()}</p>
      </div>
      <div class="footer" style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="font-size: 10px; color: #999;">Original para el interesado</div>
        <div class="signature" style="border-top: 1px solid #ccc; width: 200px; text-align: center; font-size: 12px; padding-top: 5px;">Firma y Sello Club</div>
      </div>
    </div>
  `;

  const printReceipt = (pago: MemberPayment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Recibo ${pago.recibo_numero}</title><style>body { font-family: sans-serif; padding: 40px; color: #333; }</style></head><body>${generateReceiptHTML(pago)}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const printAllReceipts = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Recibos de Pago</title><style>body { font-family: sans-serif; padding: 40px; color: #333; }</style></head><body>${lastRegisteredPagos.map(p => generateReceiptHTML(p)).join('')}</body></html>`);
    printWindow.document.close();
    printWindow.print();
    setShowSuccessModal(false);
  };

  const emitAccountStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const yearlyPagos = pagos.filter(p => p.año === añoActual && !p.anulado);
    const totalYearly = yearlyPagos.reduce((acc, p) => acc + p.monto, 0);
    let rowsHTML = '';
    MONTHS.forEach((month, idx) => {
      const mesIndex = idx + 1;
      const pago = yearlyPagos.find(p => p.mes === mesIndex);
      rowsHTML += `<tr><td>${month}</td><td>${pago ? 'PAGADO' : 'PENDIENTE'}</td><td>${pago ? new Date(pago.fecha_pago).toLocaleDateString() : '---'}</td><td>${pago ? pago.recibo_numero : '---'}</td><td style="text-align: right;">$ ${pago ? pago.monto.toLocaleString() : '0'}</td></tr>`;
    });
    printWindow.document.write(`<html><head><title>Estado de Cuenta - ${socio.apellido}</title><style>body { font-family: sans-serif; padding: 40px; } .header { border-bottom: 2px solid #064e3b; padding-bottom: 10px; margin-bottom: 30px; } h1 { color: #064e3b; margin: 0; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #eee; padding: 12px; text-align: left; } th { background: #f0fdf4; font-size: 10px; text-transform: uppercase; font-weight: 900; } .summary { margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; text-align: right; } .total-box { font-size: 20px; font-weight: 900; color: #064e3b; }</style></head><body><div class="header"><h1>ESTADO DE CUENTA ANUAL - ${añoActual}</h1><p><strong>Socio:</strong> ${socio.nombre} ${socio.apellido} | <strong>N° Socio:</strong> ${socio.numero_socio}</p></div><table><thead><tr><th>Mes</th><th>Estado</th><th>Fecha de Pago</th><th>Recibo</th><th style="text-align: right;">Monto</th></tr></thead><tbody>${rowsHTML}</tbody></table><div class="summary"><p>Total Abonado en el Periodo:</p><p class="total-box">$ ${totalYearly.toLocaleString()}</p><p style="font-size: 10px; color: #666; margin-top: 50px;">Documento de uso interno e informativo para el socio.</p></div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-emerald-100 max-w-2xl w-full mx-auto animate-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-emerald-950">Registro de Cuotas {añoActual}</h2>
          <p className="text-emerald-700 font-medium italic">Socio: {socio.nombre} {socio.apellido} (#{socio.numero_socio})</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-emerald-50 rounded-full text-slate-400 hover:text-emerald-600 transition-colors">✕</button>
      </div>

      <div className="flex gap-4 mb-6">
          <button
            onClick={emitAccountStatement}
            className="flex-1 py-3 bg-white border-2 border-emerald-100 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-sm"
          >
            <FileSpreadsheet size={18} />
            Estado de Cuenta
          </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {MONTHS.map((month, index) => {
          const mesIndex = index + 1;
          const pagado = isPagado(mesIndex);
          const seleccionado = selectedMeses.includes(mesIndex);
          const valor = getCuotaValor(mesIndex);

          return (
            <button
              key={month}
              disabled={pagado}
              onClick={() => toggleMes(mesIndex)}
              className={`
                p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shadow-sm
                ${pagado ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-80 cursor-default' : 
                  seleccionado ? 'bg-emerald-700 border-emerald-800 text-white transform scale-105 z-10' : 
                  'bg-white border-emerald-50 hover:border-emerald-300 hover:bg-emerald-50/30'}
              `}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{month}</span>
              <span className={`text-sm font-bold ${seleccionado ? 'text-emerald-100' : 'text-slate-900'}`}>${valor}</span>
              {pagado ? <Check size={16} /> : seleccionado ? <Clock size={16} /> : <div className="h-4" />}
            </button>
          );
        })}
      </div>

      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between mb-6 shadow-inner">
        <div>
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Total a Pagar ({selectedMeses.length} meses)</p>
          <p className="text-3xl font-black text-emerald-950">${totalSeleccionado.toLocaleString()}</p>
        </div>
        <button
          disabled={selectedMeses.length === 0}
          onClick={() => setShowConfirmPayment(true)}
          className={`
            px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all
            ${selectedMeses.length > 0 ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-900/40 hover:-translate-y-1' : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'}
          `}
        >
          <FileText size={20} />
          Confirmar Pago
        </button>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showConfirmPayment}
        title="Confirmar Cobro"
        message={`¿Está seguro de registrar el cobro de ${selectedMeses.length} cuota(s) por un valor de $${totalSeleccionado.toLocaleString()}?`}
        confirmLabel="Sí, Cobrar"
        onConfirm={handleRegister}
        onCancel={() => setShowConfirmPayment(false)}
        type="info"
      />

      {/* Success / Print Prompt Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <div className="relative bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">¡Pago Exitoso!</h3>
            <p className="text-slate-500 font-medium mb-8">El ingreso se registró correctamente. ¿Desea imprimir los recibos en este momento?</p>

            <div className="space-y-3">
              <button
                onClick={printAllReceipts}
                className="w-full py-4 bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
              >
                <Printer size={20} /> Imprimir Todo el Lote
              </button>

              <div className="flex flex-wrap justify-center gap-2 py-2">
                {lastRegisteredPagos.map(p => (
                   <button key={p.id} onClick={() => printReceipt(p)} className="px-3 py-1.5 bg-slate-50 text-[10px] font-black uppercase rounded-lg border hover:bg-emerald-50 text-emerald-800 transition-colors">
                      {MONTHS[p.mes-1]}
                   </button>
                ))}
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cerrar, después lo imprimo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 text-[10px] text-emerald-800/60 font-bold uppercase tracking-widest">
        <AlertCircle size={14} className="text-emerald-500" />
        <p>Los recibos se numeran automáticamente por año fiscal.</p>
      </div>
    </div>
  );
};

export default PaymentsManagement;

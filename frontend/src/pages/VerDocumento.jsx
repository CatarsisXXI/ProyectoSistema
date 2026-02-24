import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, User, Package, DollarSign, FileText, Download, Eye, Printer, Receipt } from 'lucide-react';

const TIPOS_LABEL = {
  factura:             'Factura',
  factura_electronica: 'Factura Electrónica',
  boleta:              'Boleta',
  nota_credito:        'Nota de Crédito',
};
const TIPOS_COLOR = {
  factura:             'bg-blue-100 text-blue-800',
  factura_electronica: 'bg-purple-100 text-purple-800',
  boleta:              'bg-emerald-100 text-emerald-800',
  nota_credito:        'bg-orange-100 text-orange-800',
};

function VerDocumento() {
  const { id } = useParams();
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchDocumento(); }, [id]);

  const fetchDocumento = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/documentos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setDocumento(res.data);
    } catch (err) {
      setError('Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo) => ({ farmaceutico: 'Farmacéutico', dispositivo_medico: 'Dispositivo Médico', biologico: 'Biológico' }[tipo] || tipo);

  const formatearFecha = (f) => {
    if (!f) return '-';
    return new Date(f).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatearFechaHora = (f) => {
    if (!f) return '-';
    return new Date(f).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Subtotal de costos ingresados en el documento (sin monto_orden)
  const calcularSubtotalDocumento = () => {
    if (!documento) return 0;
    let total = 0;
    const sumar = (chk, val) => { if (chk && val) total += parseFloat(val) || 0; };
    sumar(documento.cambio_mayor, documento.cambio_mayor_costo);
    sumar(documento.cambio_menor, documento.cambio_menor_costo);
    sumar(documento.inscripcion,  documento.inscripcion_costo);
    sumar(documento.renovacion,   documento.renovacion_costo);
    sumar(documento.clase1, documento.clase1_costo);
    sumar(documento.clase2, documento.clase2_costo);
    sumar(documento.clase3, documento.clase3_costo);
    sumar(documento.clase4, documento.clase4_costo);
    sumar(documento.vaccines_inmunologicos, documento.vaccines_inmunologicos_costo);
    sumar(documento.otros_biologicos,       documento.otros_biologicos_costo);
    sumar(documento.bioequivalente,         documento.bioequivalente_costo);
    sumar(documento.biotecnologico,         documento.biotecnologico_costo);
    sumar(documento.traduccion,             documento.traduccion_costo);
    if (documento.derecho_tramite_monto) total += parseFloat(documento.derecho_tramite_monto) || 0;
    return total;
  };

  const calcularTotalFinal = () => {
    const montoOrden = parseFloat(documento?.monto_orden) || 0;
    return (montoOrden + calcularSubtotalDocumento()).toFixed(2);
  };

  const handleImprimir = () => {
    const ventana = window.open('', '_blank');
    ventana.document.write(generarHTMLImpresion());
    ventana.document.close();
    ventana.onload = () => ventana.print();
  };

  const generarHTMLImpresion = () => {
    if (!documento) return '';
    const montoOrden = parseFloat(documento.monto_orden) || 0;
    const subtotalDoc = calcularSubtotalDocumento();
    const totalFinal = (montoOrden + subtotalDoc).toFixed(2);

    const estilos = `
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: white; color: #1e293b; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { font-size: 22px; font-weight: bold; margin: 0; }
        .badge { display:inline-block; padding:4px 12px; border-radius:9999px; font-size:13px; font-weight:600; background:#dbeafe; color:#1e40af; }
        .numero { font-size:20px; font-weight:bold; color:#2563eb; margin-top:6px; }
        .section { margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .section-title { background: #f1f5f9; padding: 10px 15px; font-weight: 600; border-bottom: 1px solid #cbd5e1; }
        .section-body { padding: 15px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
        .campo-label { font-size: 12px; color: #64748b; }
        .campo-valor { font-weight: 500; margin-top: 2px; }
        .service-row { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 6px; }
        .total-section { background: linear-gradient(135deg, #1e40af, #4f46e5); color: white; border-radius: 10px; padding: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; opacity: 0.85; }
        .total-final { display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.4); padding-top: 12px; margin-top: 8px; }
        .total-label { font-size: 20px; font-weight: bold; }
        .total-valor { font-size: 28px; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px; }
      </style>
    `;

    const serviciosHTML = () => {
      const fmt = (chk, val, mon, label) => {
        if (!chk) return '';
        const moneda = mon === 'soles' ? 'S/' : '$';
        return `<div class="service-row"><span>${label}</span><span><strong>${moneda} ${parseFloat(val || 0).toFixed(2)}</strong></span></div>`;
      };
      if (documento.tipo_producto === 'farmaceutico') {
        return [
          fmt(documento.cambio_mayor, documento.cambio_mayor_costo, documento.cambio_mayor_moneda, 'Cambio Mayor'),
          fmt(documento.cambio_menor, documento.cambio_menor_costo, documento.cambio_menor_moneda, 'Cambio Menor'),
          fmt(documento.inscripcion,  documento.inscripcion_costo,  documento.inscripcion_moneda,  'Inscripción'),
          fmt(documento.renovacion,   documento.renovacion_costo,   documento.renovacion_moneda,   'Renovación'),
          fmt(documento.traduccion,   documento.traduccion_costo,   documento.traduccion_moneda,   'Traducción'),
        ].join('');
      } else if (documento.tipo_producto === 'dispositivo_medico') {
        return [1,2,3,4].map(n =>
          fmt(documento[`clase${n}`], documento[`clase${n}_costo`], documento[`clase${n}_moneda`], `Clase ${n}`)
        ).join('') + fmt(documento.traduccion, documento.traduccion_costo, documento.traduccion_moneda, 'Traducción');
      } else {
        return [
          ['vaccines_inmunologicos','Vacunas e Inmunológicos'],
          ['otros_biologicos','Otros Biológicos'],
          ['bioequivalente','Bioequivalente'],
          ['biotecnologico','Biotecnológico'],
          ['traduccion','Traducción'],
        ].map(([k,l]) => fmt(documento[k], documento[`${k}_costo`], documento[`${k}_moneda`], l)).join('');
      }
    };

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Doc #${documento.id}</title>${estilos}</head>
      <body><div class="container">
        <div class="header">
          <div>
            <div class="badge">${TIPOS_LABEL[documento.tipo_documento] || 'Documento'}</div>
            <h1 style="margin-top:8px;">Documento Contable #${documento.id}</h1>
            <div class="numero">${documento.numero_documento || '-'}</div>
          </div>
          <div style="text-align:right;font-size:14px;color:#475569;"><strong>SGR</strong><br>Sistema de Gestión de Reportes<br>${formatearFechaHora(documento.created_at)}</div>
        </div>
        <div class="section"><div class="section-title">Cliente</div><div class="section-body"><div class="grid-2">
          <div><div class="campo-label">Razón Social</div><div class="campo-valor">${documento.cliente_nombre || '-'}</div></div>
          <div><div class="campo-label">RUC</div><div class="campo-valor">${documento.cliente_ruc || '-'}</div></div>
        </div></div></div>
        <div class="section"><div class="section-title">Producto</div><div class="section-body"><div class="grid-2">
          <div><div class="campo-label">Nombre</div><div class="campo-valor">${documento.producto_nombre || '-'}</div></div>
          <div><div class="campo-label">Registro Sanitario</div><div class="campo-valor">${documento.producto_registro || '-'}</div></div>
        </div></div></div>
        <div class="section"><div class="section-title">Servicios y Costos</div><div class="section-body">
          ${serviciosHTML()}
          ${documento.derecho_tramite_monto ? `<div class="service-row" style="margin-top:8px;border-top:1px dashed #e2e8f0;"><span>Derecho de Trámite ${documento.derecho_tramite_cpb ? `(CPB: ${documento.derecho_tramite_cpb})` : ''}</span><span><strong>S/ ${parseFloat(documento.derecho_tramite_monto).toFixed(2)}</strong></span></div>` : ''}
        </div></div>
        <div class="total-section">
          ${montoOrden > 0 ? `<div class="total-row"><span>Subtotal Orden #${documento.orden_id}</span><span>S/ ${montoOrden.toFixed(2)}</span></div>` : ''}
          <div class="total-row"><span>Subtotal Servicios</span><span>S/ ${subtotalDoc.toFixed(2)}</span></div>
          <div class="total-final">
            <span class="total-label">TOTAL</span>
            <span class="total-valor">S/ ${totalFinal}</span>
          </div>
        </div>
        <div class="footer">Documento generado por SGR · ${documento.numero_documento || ''}</div>
      </div></body></html>`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando documento...</p>
      </div>
    </div>
  );

  if (error || !documento) return (
    <div className="text-center py-12">
      <p className="text-rose-600">{error || 'Documento no encontrado'}</p>
      <Link to="/documentos" className="text-blue-600 hover:underline mt-2 inline-block">Volver a documentos</Link>
    </div>
  );

  const montoOrden = parseFloat(documento.monto_orden) || 0;
  const subtotalDoc = calcularSubtotalDocumento();
  const totalFinal = calcularTotalFinal();

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/documentos" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-800">Documento Contable #{documento.id}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${TIPOS_COLOR[documento.tipo_documento] || 'bg-slate-100 text-slate-700'}`}>
                {TIPOS_LABEL[documento.tipo_documento] || 'Documento'}
              </span>
            </div>
            <p className="text-blue-600 font-bold text-lg">{documento.numero_documento || 'Sin número'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleImprimir}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
            <Printer size={18} /><span>Imprimir</span>
          </button>
          <Link to={`/documentos/editar/${documento.id}`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
            <Package size={18} /><span>Editar</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">DOCUMENTO CONTABLE</h2>
                <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {TIPOS_LABEL[documento.tipo_documento] || 'Documento'}
                </span>
              </div>
              <p className="text-blue-100 text-sm mt-1">{formatearFechaHora(documento.created_at)}</p>
              {documento.numero_documento && (
                <p className="text-white font-bold text-lg mt-1">{documento.numero_documento}</p>
              )}
              {documento.orden_id && (
                <p className="text-blue-200 text-sm">Orden de origen: #{documento.orden_id}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">SGR</p>
              <p className="text-xs opacity-75">Sistema de Gestión de Reportes</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cliente */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-500" />Cliente
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Razón Social</p><p className="font-medium">{documento.cliente_nombre || '-'}</p></div>
              <div><p className="text-xs text-slate-500">RUC</p><p className="font-medium">{documento.cliente_ruc || '-'}</p></div>
            </div>
          </div>

          {/* Producto */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Package size={16} className="text-blue-500" />Producto
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Nombre</p><p className="font-medium">{documento.producto_nombre || '-'}</p></div>
              <div><p className="text-xs text-slate-500">Registro Sanitario</p><p className="font-medium font-mono">{documento.producto_registro || '-'}</p></div>
            </div>
          </div>

          {/* Monto de la Orden (si aplica) */}
          {montoOrden > 0 && (
            <div className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50">
              <div className="bg-amber-100 px-4 py-2 border-b border-amber-200 font-semibold text-amber-800 flex items-center gap-2">
                <Receipt size={16} className="text-amber-600" />
                Monto de Orden de Servicio #{documento.orden_id}
              </div>
              <div className="p-4 flex justify-between items-center">
                <p className="text-sm text-slate-600">Total registrado en la orden de origen</p>
                <span className="text-xl font-bold text-amber-700">S/ {montoOrden.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Servicios y costos */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <DollarSign size={16} className="text-blue-500" />Servicios y Costos
            </div>
            <div className="p-4">
              {documento.tipo_producto === 'farmaceutico' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-500">Categoría 1</p><p>{documento.categoria1 ? 'Sí' : 'No'}</p></div>
                    <div><p className="text-xs text-slate-500">Categoría 2</p><p>{documento.categoria2 ? 'Sí' : 'No'}</p></div>
                  </div>
                  <div className="space-y-2">
                    {[{key:'cambio_mayor',label:'Cambio Mayor'},{key:'cambio_menor',label:'Cambio Menor'},{key:'inscripcion',label:'Inscripción'},{key:'renovacion',label:'Renovación'},{key:'traduccion',label:'Traducción'}].map(item => {
                      if (!documento[item.key]) return null;
                      return (
                        <div key={item.key} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-semibold text-blue-700">{documento[`${item.key}_costo`] ? `${documento[`${item.key}_moneda`] === 'soles' ? 'S/' : '$'} ${parseFloat(documento[`${item.key}_costo`]).toFixed(2)}` : '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {documento.tipo_producto === 'dispositivo_medico' && (
                <div className="space-y-2">
                  {[1,2,3,4].map(num => {
                    if (!documento[`clase${num}`]) return null;
                    return (
                      <div key={num} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                        <span className="font-medium">Clase {num}</span>
                        <span className="font-semibold text-blue-700">{documento[`clase${num}_costo`] ? `${documento[`clase${num}_moneda`] === 'soles' ? 'S/' : '$'} ${parseFloat(documento[`clase${num}_costo`]).toFixed(2)}` : '-'}</span>
                      </div>
                    );
                  })}
                  {documento.traduccion && (
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                      <span className="font-medium">Traducción</span>
                      <span className="font-semibold text-blue-700">{documento.traduccion_costo ? `${documento.traduccion_moneda === 'soles' ? 'S/' : '$'} ${parseFloat(documento.traduccion_costo).toFixed(2)}` : '-'}</span>
                    </div>
                  )}
                </div>
              )}
              {documento.tipo_producto === 'biologico' && (
                <div className="space-y-2">
                  {[{key:'vaccines_inmunologicos',label:'Vacunas e Inmunológicos'},{key:'otros_biologicos',label:'Otros Biológicos'},{key:'bioequivalente',label:'Bioequivalente'},{key:'biotecnologico',label:'Biotecnológico'},{key:'traduccion',label:'Traducción'}].map(item => {
                    if (!documento[item.key]) return null;
                    return (
                      <div key={item.key} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                        <span className="font-medium">{item.label}</span>
                        <span className="font-semibold text-blue-700">{documento[`${item.key}_costo`] ? `${documento[`${item.key}_moneda`] === 'soles' ? 'S/' : '$'} ${parseFloat(documento[`${item.key}_costo`]).toFixed(2)}` : '-'}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {(documento.derecho_tramite_cpb || documento.derecho_tramite_monto) && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-medium">Derecho de Trámite {documento.derecho_tramite_cpb ? `(CPB N°: ${documento.derecho_tramite_cpb})` : ''}</span>
                  <span className="font-semibold text-blue-700">{documento.derecho_tramite_monto ? `S/ ${parseFloat(documento.derecho_tramite_monto).toFixed(2)}` : '-'}</span>
                </div>
              )}

              {/* Resumen total */}
              <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white space-y-2">
                {montoOrden > 0 && (
                  <div className="flex justify-between text-sm opacity-85">
                    <span>Subtotal Orden #{documento.orden_id}</span>
                    <span>S/ {montoOrden.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm opacity-85">
                  <span>Subtotal Servicios</span>
                  <span>S/ {subtotalDoc.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/30 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold">TOTAL</span>
                  <span className="text-3xl font-bold">S/ {totalFinal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Adjunto */}
          {documento.pdf_adjunto && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />Documento Adjunto
              </div>
              <div className="p-4">
                <a href={`/uploads/documentos/${documento.pdf_adjunto}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                  <Eye size={18} /><span>Ver PDF adjunto</span><Download size={16} className="ml-2" />
                </a>
                <p className="text-xs text-slate-500 mt-1">{documento.pdf_adjunto}</p>
              </div>
            </div>
          )}

          {/* Información de registro */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />Información del Registro
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Fecha de creación</p><p className="font-medium">{formatearFechaHora(documento.created_at)}</p></div>
              <div><p className="text-xs text-slate-500">Registrado por</p><p className="font-medium">{documento.usuario_nombre || 'Usuario'}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerDocumento;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Calendar, User, Package, DollarSign,
  FileText, Download, Eye, Printer, Receipt, Building
} from 'lucide-react';

const TIPOS_DOCUMENTO_LABEL = {
  factura:             'Factura',
  factura_electronica: 'Factura Electrónica',
  boleta:              'Boleta',
  nota_credito:        'Nota de Crédito',
};
const TIPOS_DOCUMENTO_COLOR = {
  factura:             'bg-blue-100 text-blue-800 border-blue-200',
  factura_electronica: 'bg-purple-100 text-purple-800 border-purple-200',
  boleta:              'bg-emerald-100 text-emerald-800 border-emerald-200',
  nota_credito:        'bg-orange-100 text-orange-800 border-orange-200',
};
const TIPO_PRODUCTO_LABEL = {
  farmaceutico:       'Farmacéutico',
  dispositivo_medico: 'Dispositivo Médico',
  biologico:          'Producto Biológico',
};
const TIPO_PRODUCTO_COLOR_BG = {
  farmaceutico:       'bg-blue-50 border-blue-200',
  dispositivo_medico: 'bg-purple-50 border-purple-200',
  biologico:          'bg-emerald-50 border-emerald-200',
};
const TIPO_PRODUCTO_BADGE = {
  farmaceutico:       'bg-blue-100 text-blue-800',
  dispositivo_medico: 'bg-purple-100 text-purple-800',
  biologico:          'bg-emerald-100 text-emerald-800',
};

const toBoolean = (v) => v === 1 || v === true;

function VerDocumento() {
  const { id } = useParams();
  const [documento, setDocumento] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => { fetchDocumento(); }, [id]);

  const fetchDocumento = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/documentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumento(res.data);
    } catch {
      setError('Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (f) => {
    if (!f) return '-';
    return new Date(f).toLocaleDateString('es-ES', { year:'numeric', month:'2-digit', day:'2-digit' });
  };
  const fmtDT = (f) => {
    if (!f) return '-';
    return new Date(f).toLocaleString('es-ES', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  };
  const fmtMonto = (val, moneda) => {
    if (!val) return '-';
    const s = moneda === 'dolares' ? '$' : 'S/';
    return `${s} ${parseFloat(val).toFixed(2)}`;
  };

  // ── Subtotal de costos del documento (sin monto_orden) ──
  const calcularSubtotalDoc = () => {
    if (!documento) return 0;
    let t = 0;
    const s = (chk, val) => { if (chk && val) t += parseFloat(val) || 0; };
    s(documento.cambio_mayor,            documento.cambio_mayor_costo);
    s(documento.cambio_menor,            documento.cambio_menor_costo);
    s(documento.inscripcion,             documento.inscripcion_costo);
    s(documento.renovacion,              documento.renovacion_costo);
    s(documento.traduccion,              documento.traduccion_costo);
    s(documento.clase1,                  documento.clase1_costo);
    s(documento.clase2,                  documento.clase2_costo);
    s(documento.clase3,                  documento.clase3_costo);
    s(documento.clase4,                  documento.clase4_costo);
    s(documento.vaccines_inmunologicos,  documento.vaccines_inmunologicos_costo);
    s(documento.otros_biologicos,        documento.otros_biologicos_costo);
    s(documento.bioequivalente,          documento.bioequivalente_costo);
    s(documento.biotecnologico,          documento.biotecnologico_costo);
    if (documento.derecho_tramite_monto) t += parseFloat(documento.derecho_tramite_monto) || 0;
    return t;
  };

  const calcularTotal = () => {
    const mo = parseFloat(documento?.monto_orden) || 0;
    return (mo + calcularSubtotalDoc()).toFixed(2);
  };

  // ── Renderizar servicios marcados de un documento (para costos adicionales) ──
  const renderServiciosDocumento = () => {
    if (!documento) return null;
    const tipo = documento.tipo_producto;
    const rows = [];

    const addRow = (chk, val, mon, label) => {
      if (!chk) return;
      rows.push({ label, valor: fmtMonto(val, mon) });
    };

    if (tipo === 'farmaceutico') {
      addRow(documento.cambio_mayor, documento.cambio_mayor_costo, documento.cambio_mayor_moneda, 'Cambio Mayor');
      addRow(documento.cambio_menor, documento.cambio_menor_costo, documento.cambio_menor_moneda, 'Cambio Menor');
      addRow(documento.inscripcion,  documento.inscripcion_costo,  documento.inscripcion_moneda,  'Inscripción');
      addRow(documento.renovacion,   documento.renovacion_costo,   documento.renovacion_moneda,   'Renovación');
      addRow(documento.traduccion,   documento.traduccion_costo,   documento.traduccion_moneda,   'Traducción');
    } else if (tipo === 'dispositivo_medico') {
      [1,2,3,4].forEach(n => addRow(documento[`clase${n}`], documento[`clase${n}_costo`], documento[`clase${n}_moneda`], `Clase ${n}`));
      addRow(documento.traduccion, documento.traduccion_costo, documento.traduccion_moneda, 'Traducción');
    } else if (tipo === 'biologico') {
      addRow(documento.vaccines_inmunologicos, documento.vaccines_inmunologicos_costo, documento.vaccines_inmunologicos_moneda, 'Vacunas e Inmunológicos');
      addRow(documento.otros_biologicos,       documento.otros_biologicos_costo,       documento.otros_biologicos_moneda,       'Otros Biológicos');
      addRow(documento.bioequivalente,         documento.bioequivalente_costo,         documento.bioequivalente_moneda,         'Bioequivalente');
      addRow(documento.biotecnologico,         documento.biotecnologico_costo,         documento.biotecnologico_moneda,         'Biotecnológico');
      addRow(documento.traduccion,             documento.traduccion_costo,             documento.traduccion_moneda,             'Traducción');
    }

    if (rows.length === 0) return <p className="text-sm text-slate-400 italic">Sin costos adicionales registrados.</p>;

    return (
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-lg">
            <span className="text-sm font-medium text-slate-700">{r.label}</span>
            <span className="text-sm font-bold text-blue-700">{r.valor}</span>
          </div>
        ))}
      </div>
    );
  };

  // ── Renderizar servicios de productos de la orden ──
  const renderServiciosOrdenProducto = (prod) => {
    const tipo = prod.tipo_producto;
    const servicios = [];

    if (tipo === 'farmaceutico') {
      if (toBoolean(prod.cambio_mayor))  servicios.push({ label: 'Cambio Mayor',  costo: prod.cambio_mayor_costo, moneda: prod.cambio_mayor_moneda });
      if (toBoolean(prod.cambio_menor))  servicios.push({ label: 'Cambio Menor',  costo: prod.cambio_menor_costo, moneda: prod.cambio_menor_moneda });
      if (toBoolean(prod.inscripcion))   servicios.push({ label: 'Inscripción',   costo: prod.inscripcion_costo, moneda: prod.inscripcion_moneda });
      if (toBoolean(prod.renovacion))    servicios.push({ label: 'Renovación',    costo: prod.renovacion_costo, moneda: prod.renovacion_moneda });
      if (toBoolean(prod.traduccion))    servicios.push({ label: 'Traducción',    costo: prod.traduccion_costo, moneda: prod.traduccion_moneda });
    } else if (tipo === 'dispositivo_medico') {
      [1,2,3,4].forEach(n => {
        if (toBoolean(prod[`clase${n}`])) servicios.push({ label: `Clase ${n}`, costo: prod[`clase${n}_costo`], moneda: prod[`clase${n}_moneda`] });
      });
      if (toBoolean(prod.traduccion)) servicios.push({ label: 'Traducción', costo: prod.traduccion_costo, moneda: prod.traduccion_moneda });
    } else if (tipo === 'biologico') {
      if (toBoolean(prod.vaccines_inmunologicos)) servicios.push({ label: 'Vacunas e Inmunológicos', costo: prod.vaccines_inmunologicos_costo, moneda: prod.vaccines_inmunologicos_moneda });
      if (toBoolean(prod.otros_biologicos))       servicios.push({ label: 'Otros Biológicos',        costo: prod.otros_biologicos_costo,       moneda: prod.otros_biologicos_moneda });
      if (toBoolean(prod.bioequivalente))         servicios.push({ label: 'Bioequivalente',          costo: prod.bioequivalente_costo,         moneda: prod.bioequivalente_moneda });
      if (toBoolean(prod.biotecnologico))         servicios.push({ label: 'Biotecnológico',          costo: prod.biotecnologico_costo,         moneda: prod.biotecnologico_moneda });
      if (toBoolean(prod.traduccion))             servicios.push({ label: 'Traducción',              costo: prod.traduccion_costo,             moneda: prod.traduccion_moneda });
    }

    if (servicios.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Costos de Servicios</p>
        <div className="space-y-1">
          {servicios.map((srv, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-slate-700">{srv.label}</span>
              <span className="font-semibold text-blue-700">{fmtMonto(srv.costo, srv.moneda)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Renderizar un producto de la orden ──
  const renderProductoOrden = (prod, idx) => {
    const esBio = prod.tipo_producto === 'biologico';
    const bgCls = TIPO_PRODUCTO_COLOR_BG[prod.tipo_producto] || 'bg-slate-50 border-slate-200';
    const badgeCls = TIPO_PRODUCTO_BADGE[prod.tipo_producto] || 'bg-slate-100 text-slate-800';

    return (
      <div key={idx} className={`rounded-xl border p-5 ${bgCls}`}>
        {/* Cabecera del producto */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
              {idx + 1}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{prod.producto_nombre || '-'}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{prod.producto_registro || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeCls}`}>
              {TIPO_PRODUCTO_LABEL[prod.tipo_producto]}
            </span>
            {!esBio && prod.monto && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-600 text-white">
                S/ {parseFloat(prod.monto).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Datos del producto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {prod.cpb_numero && (
            <div className="bg-white rounded-lg p-3 border border-white/60">
              <p className="text-xs text-slate-500">CPB N°</p>
              <p className="font-semibold text-sm text-slate-800">{prod.cpb_numero}</p>
            </div>
          )}
          {!esBio && prod.monto && (
            <div className="bg-white rounded-lg p-3 border border-white/60">
              <p className="text-xs text-slate-500">Monto</p>
              <p className="font-bold text-sm text-emerald-700">S/ {parseFloat(prod.monto).toFixed(2)}</p>
            </div>
          )}
          {prod.fecha_recepcion && (
            <div className="bg-white rounded-lg p-3 border border-white/60">
              <p className="text-xs text-slate-500">Fecha Recepción</p>
              <p className="font-semibold text-sm text-slate-800">{fmt(prod.fecha_recepcion)}</p>
            </div>
          )}
          {prod.fecha_ingreso_vuce && (
            <div className="bg-white rounded-lg p-3 border border-white/60">
              <p className="text-xs text-slate-500">Ingreso VUCE</p>
              <p className="font-semibold text-sm text-slate-800">{fmt(prod.fecha_ingreso_vuce)}</p>
            </div>
          )}
          {prod.fecha_fin_proceso && (
            <div className="bg-white rounded-lg p-3 border border-white/60">
              <p className="text-xs text-slate-500">Fin de Proceso</p>
              <p className="font-semibold text-sm text-slate-800">{fmt(prod.fecha_fin_proceso)}</p>
            </div>
          )}
        </div>

        {/* Servicios del producto con costos */}
        {renderServiciosOrdenProducto(prod)}

        {prod.observaciones && (
          <div className="mt-3 bg-white rounded-lg p-3 border border-white/60">
            <p className="text-xs text-slate-500 mb-1">Observaciones</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{prod.observaciones}</p>
          </div>
        )}
      </div>
    );
  };

  // ── HTML para impresión ──
  const generarHTMLImpresion = () => {
    if (!documento) return '';
    const mo         = parseFloat(documento.monto_orden) || 0;
    const subtotalDoc = calcularSubtotalDoc();
    const total      = calcularTotal();
    const prods      = documento.orden_productos || [];

    const estilos = `
      <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: white; color: #1e293b; font-size: 13px; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
        .header-left h1 { font-size: 20px; font-weight: bold; margin: 0 0 4px; }
        .num-doc { font-size: 18px; font-weight: bold; color: #2563eb; margin: 4px 0; }
        .badge { display:inline-block; padding:3px 10px; border-radius:9999px; font-size:11px; font-weight:600; }
        .badge-blue { background:#dbeafe; color:#1e40af; }
        .badge-purple { background:#ede9fe; color:#5b21b6; }
        .badge-green { background:#dcfce7; color:#166534; }
        .badge-orange { background:#ffedd5; color:#92400e; }
        .section { margin-bottom: 18px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .section-title { background: #f8fafc; padding: 8px 14px; font-weight: 700; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #e2e8f0; }
        .section-body { padding: 14px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .field-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
        .field-value { font-weight: 600; color: #0f172a; }
        .prod-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; background: #f8fafc; }
        .prod-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .prod-name { font-weight: 700; font-size: 14px; }
        .prod-reg { font-size: 11px; color: #64748b; font-family: monospace; }
        .monto-badge { background: #059669; color: white; border-radius: 9999px; padding: 2px 10px; font-weight: 700; font-size: 13px; }
        .service-row { display: flex; justify-content: space-between; padding: 6px 10px; background: white; border-radius: 6px; margin-bottom: 4px; border: 1px solid #f1f5f9; }
        .total-box { background: linear-gradient(135deg, #1e40af, #4f46e5); color: white; border-radius: 10px; padding: 18px; margin-top: 4px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; opacity: .85; }
        .total-final { display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,.3); padding-top: 12px; margin-top: 8px; }
        .total-label { font-size: 20px; font-weight: 800; }
        .total-valor { font-size: 28px; font-weight: 800; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px; }
      </style>
    `;

    const badgeDoc = (tipo) => {
      const cls = { factura:'badge-blue', factura_electronica:'badge-purple', boleta:'badge-green', nota_credito:'badge-orange' }[tipo] || 'badge-blue';
      return `<span class="badge ${cls}">${TIPOS_DOCUMENTO_LABEL[tipo] || tipo}</span>`;
    };

    const prodRowService = (chk, val, mon, label) => {
      if (!chk || !val) return '';
      const m = mon === 'dolares' ? '$' : 'S/';
      return `<div class="service-row"><span>${label}</span><span><strong>${m} ${parseFloat(val).toFixed(2)}</strong></span></div>`;
    };

    const costosDocHTML = () => {
      const t = documento.tipo_producto;
      let h = '';
      if (t === 'farmaceutico') {
        h += prodRowService(documento.cambio_mayor, documento.cambio_mayor_costo, documento.cambio_mayor_moneda, 'Cambio Mayor');
        h += prodRowService(documento.cambio_menor, documento.cambio_menor_costo, documento.cambio_menor_moneda, 'Cambio Menor');
        h += prodRowService(documento.inscripcion,  documento.inscripcion_costo,  documento.inscripcion_moneda,  'Inscripción');
        h += prodRowService(documento.renovacion,   documento.renovacion_costo,   documento.renovacion_moneda,   'Renovación');
        h += prodRowService(documento.traduccion,   documento.traduccion_costo,   documento.traduccion_moneda,   'Traducción');
      } else if (t === 'dispositivo_medico') {
        [1,2,3,4].forEach(n => { h += prodRowService(documento[`clase${n}`], documento[`clase${n}_costo`], documento[`clase${n}_moneda`], `Clase ${n}`); });
        h += prodRowService(documento.traduccion, documento.traduccion_costo, documento.traduccion_moneda, 'Traducción');
      } else {
        h += prodRowService(documento.vaccines_inmunologicos, documento.vaccines_inmunologicos_costo, documento.vaccines_inmunologicos_moneda, 'Vacunas e Inmunológicos');
        h += prodRowService(documento.otros_biologicos, documento.otros_biologicos_costo, documento.otros_biologicos_moneda, 'Otros Biológicos');
        h += prodRowService(documento.bioequivalente, documento.bioequivalente_costo, documento.bioequivalente_moneda, 'Bioequivalente');
        h += prodRowService(documento.biotecnologico, documento.biotecnologico_costo, documento.biotecnologico_moneda, 'Biotecnológico');
        h += prodRowService(documento.traduccion, documento.traduccion_costo, documento.traduccion_moneda, 'Traducción');
      }
      return h || '<p style="color:#94a3b8;font-style:italic;font-size:12px;">Sin costos adicionales.</p>';
    };

    const prodsHTML = prods.map((p, i) => {
      const esBio = p.tipo_producto === 'biologico';
      return `
        <div class="prod-card">
          <div class="prod-header">
            <div>
              <div class="prod-name">${i+1}. ${p.producto_nombre || '-'}</div>
              <div class="prod-reg">${p.producto_registro || '-'}</div>
              ${p.cpb_numero ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">CPB N°: ${p.cpb_numero}</div>` : ''}
            </div>
            <div>
              <span class="badge ${TIPO_PRODUCTO_BADGE[p.tipo_producto] || ''}" style="font-size:10px;">${TIPO_PRODUCTO_LABEL[p.tipo_producto] || ''}</span>
              ${!esBio && p.monto ? `<span class="monto-badge" style="display:block;margin-top:4px;">S/ ${parseFloat(p.monto).toFixed(2)}</span>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Doc ${documento.numero_documento}</title>${estilos}</head>
      <body><div class="container">
        <div class="header">
          <div class="header-left">
            ${badgeDoc(documento.tipo_documento)}
            <h1 style="margin-top:6px;">Documento Contable #${documento.id}</h1>
            <div class="num-doc">${documento.numero_documento || '-'}</div>
            ${documento.orden_id ? `<div:12px;color style="font-size:#64748b;">Generado desde Orden #${documento.orden_id}</div>` : ''}
          </div>
          <div style="text-align:right;color:#475569;">
            <div style="font-weight:700;font-size:14px;">SGR</div>
            <div style="font-size:12px;">Sistema de Gestión de Reportes</div>
            <div style="font-size:12px;">${fmtDT(documento.created_at)}</div>
            <div style="font-size:12px;margin-top:4px;">Registrado por: <strong>${documento.usuario_nombre || '-'}</strong></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Cliente</div>
          <div class="section-body">
            <div class="grid-2">
              <div><div class="field-label">Razón Social</div><div class="field-value">${documento.cliente || '-'}</div></div>
              <div><div class="field-label">RUC</div><div class="field-value">${documento.ruc || '-'}</div></div>
            </div>
          </div>
        </div>

        ${prods.length > 0 ? `
        <div class="section">
          <div class="section-title">Productos de la Orden (${prods.length})</div>
          <div class="section-body">${prodsHTML}</div>
        </div>` : `
        <div class="section">
          <div class="section-title">Producto</div>
          <div class="section-body">
            <div class="grid-2">
              <div><div class="field-label">Nombre</div><div class="field-value">${documento.producto_nombre || '-'}</div></div>
              <div><div class="field-label">Registro Sanitario</div><div class="field-value">${documento.producto_registro || '-'}</div></div>
            </div>
          </div>
        </div>`}

        <div class="section">
          <div class="section-title">Costos de Servicios Adicionales</div>
          <div class="section-body">
            ${costosDocHTML()}
            ${documento.derecho_tramite_monto ? `
              <div class="service-row" style="margin-top:8px;border-top:1px dashed #e2e8f0;padding-top:8px;">
                <span>Derecho de Trámite ${documento.derecho_tramite_cpb ? `(CPB: ${documento.derecho_tramite_cpb})` : ''}</span>
                <span><strong>S/ ${parseFloat(documento.derecho_tramite_monto).toFixed(2)}</strong></span>
              </div>` : ''}
          </div>
        </div>

        <div class="total-box">
          ${mo > 0 ? `<div class="total-row"><span>Subtotal de la Orden #${documento.orden_id}</span><span>S/ ${mo.toFixed(2)}</span></div>` : ''}
          <div class="total-row"><span>Subtotal Costos Adicionales</span><span>S/ ${subtotalDoc.toFixed(2)}</span></div>
          <div class="total-final">
            <span class="total-label">TOTAL</span>
            <span class="total-valor">S/ ${total}</span>
          </div>
        </div>

        <div class="footer">Documento generado por SGR · ${documento.numero_documento || ''} · ${fmtDT(documento.created_at)}</div>
      </div></body></html>`;
  };

  const handleImprimir = () => {
    const v = window.open('', '_blank');
    v.document.write(generarHTMLImpresion());
    v.document.close();
    v.onload = () => v.print();
  };

  // ─────────────────────── render ───────────────────────
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

  const mo         = parseFloat(documento.monto_orden) || 0;
  const subtotalDoc = calcularSubtotalDoc();
  const total      = calcularTotal();
  const prods      = documento.orden_productos || [];

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/documentos" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-3xl font-bold text-slate-800">
                Documento #{documento.id}
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${TIPOS_DOCUMENTO_COLOR[documento.tipo_documento] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {TIPOS_DOCUMENTO_LABEL[documento.tipo_documento] || 'Documento'}
              </span>
            </div>
            <p className="text-blue-700 font-bold text-xl">{documento.numero_documento || 'Sin número'}</p>
            {documento.orden_id && (
              <p className="text-sm text-slate-500 mt-0.5">Generado desde Orden #{documento.orden_id}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleImprimir}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
            <Printer size={18} /><span>Imprimir</span>
          </button>
          <Link to={`/documentos/editar/${documento.id}`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
            <Package size={18} /><span>Editar</span>
          </Link>
        </div>
      </div>

      {/* Cabecera de color */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl px-6 py-4 text-white mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Receipt size={20} />
              <span className="text-lg font-bold">DOCUMENTO CONTABLE</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {TIPOS_DOCUMENTO_LABEL[documento.tipo_documento]}
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{documento.numero_documento}</p>
            <p className="text-blue-200 text-sm mt-1">{fmtDT(documento.created_at)}</p>
            {documento.orden_id && (
              <p className="text-blue-200 text-sm">Generado desde Orden #{documento.orden_id}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">SGR</p>
            <p className="text-xs opacity-75">Sistema de Gestión de Reportes</p>
            <p className="text-sm mt-2">
              Registrado por: <span className="font-semibold">{documento.usuario_nombre || '-'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Cliente ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
            <Building size={16} className="text-blue-500" />Cliente
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Razón Social</p>
              <p className="font-semibold text-slate-800">{documento.cliente || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">RUC</p>
              <p className="font-semibold text-slate-800">{documento.ruc || '-'}</p>
            </div>
          </div>
        </div>

        {/* ── Productos de la orden (si existe) o producto manual ── */}
        {prods.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <Package size={16} className="text-blue-500" />
                Productos de la Orden #{documento.orden_id}
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                {prods.length} producto{prods.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-5 space-y-4">
              {prods.map((p, i) => renderProductoOrden(p, i))}

              {/* Subtotal de montos de la orden */}
              {mo > 0 && (
                <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mt-2">
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Subtotal montos de la Orden</p>
                    <p className="text-xs text-amber-600">Suma de montos de productos farmacéuticos y dispositivos médicos</p>
                  </div>
                  <span className="text-xl font-bold text-amber-700">S/ {mo.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
              <Package size={16} className="text-blue-500" />Producto
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Nombre</p>
                <p className="font-semibold text-slate-800">{documento.producto_nombre || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Registro Sanitario</p>
                <p className="font-semibold font-mono text-slate-800">{documento.producto_registro || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Costos de servicios adicionales ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
            <DollarSign size={16} className="text-blue-500" />
            Costos de Servicios Adicionales
            <span className="text-xs font-normal text-slate-500 ml-1">
              ({TIPO_PRODUCTO_LABEL[documento.tipo_producto]})
            </span>
          </div>
          <div className="p-5">
            {renderServiciosDocumento()}

            {(documento.derecho_tramite_cpb || documento.derecho_tramite_monto) && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-700">Derecho de Trámite (Tasa de Salud)</p>
                  {documento.derecho_tramite_cpb && (
                    <p className="text-xs text-slate-500 mt-0.5">CPB N°: {documento.derecho_tramite_cpb}</p>
                  )}
                </div>
                <span className="font-bold text-blue-700">
                  {documento.derecho_tramite_monto ? `S/ ${parseFloat(documento.derecho_tramite_monto).toFixed(2)}` : '-'}
                </span>
              </div>
            )}

            {/* Resumen total */}
            <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
              <div className="space-y-2">
                {mo > 0 && (
                  <div className="flex justify-between text-sm opacity-85">
                    <span>Subtotal Orden #{documento.orden_id}</span>
                    <span>S/ {mo.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm opacity-85">
                  <span>Subtotal Costos Adicionales</span>
                  <span>S/ {subtotalDoc.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/30 pt-3 mt-2 flex justify-between items-center">
                  <span className="text-xl font-bold">TOTAL</span>
                  <span className="text-3xl font-bold">S/ {total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PDF adjunto ── */}
        {documento.pdf_adjunto && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
              <FileText size={16} className="text-blue-500" />Documento Adjunto
            </div>
            <div className="p-5">
              <a href={`/uploads/documentos/${documento.pdf_adjunto}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium">
                <Eye size={18} /><span>Ver PDF adjunto</span><Download size={16} className="ml-1" />
              </a>
              <p className="text-xs text-slate-400 mt-1">{documento.pdf_adjunto}</p>
            </div>
          </div>
        )}

        {/* ── Información del registro ── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2 font-semibold text-slate-700">
            <Calendar size={16} className="text-blue-500" />Información del Registro
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Fecha de creación</p>
              <p className="font-semibold text-slate-800">{fmtDT(documento.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Registrado por</p>
              <p className="font-semibold text-slate-800">{documento.usuario_nombre || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerDocumento;

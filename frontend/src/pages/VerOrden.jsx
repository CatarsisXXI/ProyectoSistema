import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Printer, Calendar, Package, Building } from 'lucide-react';

const toBoolean = (val) => val === 1 || val === true;

// ✅ Definición centralizada con el nombre EXACTO del campo autorizado en la BD
const CAMPOS_BIOLOGICOS = [
  { name: 'vaccines_immunologicos', label: 'Vacunas e Inmunológicos', autorizado: 'vaccines_immunologicos_autorizado' },
  { name: 'otros_biologicos_chk',   label: 'Otros Biológicos',        autorizado: 'otros_biologicos_autorizado' },
  { name: 'bioequivalente_chk',     label: 'Bioequivalente',          autorizado: 'bioequivalente_autorizado' },
  { name: 'biotecnologico_chk',     label: 'Biotecnológico',          autorizado: 'biotecnologico_autorizado' }
];

function VerOrden() {
  const { id } = useParams();
  const { usuario } = useContext(AuthContext);
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchOrden(); }, [id]);

  const fetchOrden = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/ordenes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrden(res.data);
    } catch (err) {
      setError('Error al cargar la orden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo) => {
    const labels = { farmaceutico: 'Farmacéutico', dispositivo_medico: 'Dispositivo Médico', biologico: 'Producto Biológico' };
    return labels[tipo] || tipo;
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatearFechaHora = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleImprimir = () => {
    const ventana = window.open('', '_blank');
    ventana.document.write(generarHTMLImpresion());
    ventana.document.close();
    ventana.onload = () => ventana.print();
  };

  const generarHTMLImpresion = () => {
    if (!orden) return '';
    const estilos = `
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: white; color: #1e293b; }
        .print-container { max-width: 1100px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { font-size: 24px; font-weight: bold; color: #1e293b; margin: 0; }
        .subtitle { color: #64748b; font-size: 14px; }
        .empresa-info { text-align: right; font-size: 14px; color: #475569; }
        .seccion { margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .seccion-titulo { background: #f1f5f9; padding: 10px 15px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #cbd5e1; }
        .seccion-contenido { padding: 15px; background: white; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .campo { margin-bottom: 10px; }
        .campo-label { font-size: 12px; color: #64748b; margin-bottom: 2px; }
        .campo-valor { font-weight: 500; color: #0f172a; font-size: 14px; }
        .producto-card { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 15px; padding: 12px; background: #fafafa; }
        .producto-titulo { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #2563eb; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      </style>
    `;

    const productosHTML = orden.productos?.map((prod, idx) => {
      const esBiologico = prod.tipo_producto === 'biologico';
      const serviciosHTML = () => {
        if (prod.tipo_producto === 'farmaceutico') {
          return `
            <div class="grid-2">
              <div class="campo"><div class="campo-label">Categoría 1</div><div class="campo-valor">${toBoolean(prod.categoria1) ? 'Sí' : 'No'}</div></div>
              <div class="campo"><div class="campo-label">Categoría 2</div><div class="campo-valor">${toBoolean(prod.categoria2) ? 'Sí' : 'No'}</div></div>
            </div>
            <div class="grid-3">
              ${['cambio_mayor','cambio_menor','inscripcion','renovacion','traduccion'].filter(i => toBoolean(prod[i])).map(i => {
                const label = i === 'cambio_mayor' ? 'Cambio Mayor' : i === 'cambio_menor' ? 'Cambio Menor' : i === 'inscripcion' ? 'Inscripción' : i === 'renovacion' ? 'Renovación' : 'Traducción';
                return `<div class="campo"><div class="campo-label">${label}</div><div class="campo-valor">Autorizado por: ${prod[`${i}_autorizado`] || 'No especificado'}</div></div>`;
              }).join('')}
            </div>`;
        } else if (prod.tipo_producto === 'dispositivo_medico') {
          return `<div class="grid-3">
            ${[1,2,3,4].filter(n => toBoolean(prod[`clase${n}`])).map(n =>
              `<div class="campo"><div class="campo-label">Clase ${n}</div><div class="campo-valor">Autorizado por: ${prod[`clase${n}_autorizado`] || 'No especificado'}</div></div>`
            ).join('')}
            ${toBoolean(prod.traduccion) ? `<div class="campo"><div class="campo-label">Traducción</div><div class="campo-valor">Autorizado por: ${prod.traduccion_autorizado || 'No especificado'}</div></div>` : ''}
          </div>`;
        } else if (prod.tipo_producto === 'biologico') {
          // ✅ Usa item.autorizado (el nombre correcto del campo en BD)
          return `<div class="grid-3">
            ${CAMPOS_BIOLOGICOS.filter(item => toBoolean(prod[item.name])).map(item =>
              `<div class="campo"><div class="campo-label">${item.label}</div><div class="campo-valor">Autorizado por: ${prod[item.autorizado] || 'No especificado'}</div></div>`
            ).join('')}
            ${toBoolean(prod.traduccion) ? `<div class="campo"><div class="campo-label">Traducción</div><div class="campo-valor">Autorizado por: ${prod.traduccion_autorizado || 'No especificado'}</div></div>` : ''}
          </div>`;
        }
        return '';
      };

      return `
        <div class="producto-card">
          <div class="producto-titulo">Producto ${idx + 1}: ${prod.producto_nombre || '-'}</div>
          <div class="grid-3">
            <div class="campo"><div class="campo-label">Registro Sanitario</div><div class="campo-valor">${prod.producto_registro || '-'}</div></div>
            <div class="campo"><div class="campo-label">Tipo</div><div class="campo-valor">${getTipoLabel(prod.tipo_producto)}</div></div>
            ${!esBiologico && prod.cpb_numero ? `<div class="campo"><div class="campo-label">CPB N°</div><div class="campo-valor">${prod.cpb_numero}</div></div>` : ''}
            ${!esBiologico && prod.monto ? `<div class="campo"><div class="campo-label">Monto</div><div class="campo-valor">S/ ${parseFloat(prod.monto).toFixed(2)}</div></div>` : ''}
            ${prod.fecha_recepcion ? `<div class="campo"><div class="campo-label">Fecha Recepción</div><div class="campo-valor">${formatearFecha(prod.fecha_recepcion)}</div></div>` : ''}
            ${prod.fecha_ingreso_vuce ? `<div class="campo"><div class="campo-label">Fecha Ingreso VUCE</div><div class="campo-valor">${formatearFecha(prod.fecha_ingreso_vuce)}</div></div>` : ''}
            ${prod.fecha_fin_proceso ? `<div class="campo"><div class="campo-label">Fecha Fin Proceso</div><div class="campo-valor">${formatearFecha(prod.fecha_fin_proceso)}</div></div>` : ''}
          </div>
          <div><div class="campo-label" style="margin-top:10px;">Servicios Solicitados</div>${serviciosHTML()}</div>
          ${prod.observaciones ? `<div style="margin-top:10px;"><div class="campo-label">Observaciones</div><div class="campo-valor">${prod.observaciones}</div></div>` : ''}
        </div>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Orden #${orden.id}</title>${estilos}</head>
      <body><div class="print-container">
        <div class="header">
          <div><h1>Orden de Servicio #${orden.id}</h1><div class="subtitle">Múltiples productos</div></div>
          <div class="empresa-info"><strong>SGR</strong><br>Sistema de Gestión de Reportes<br>${formatearFechaHora(orden.created_at)}</div>
        </div>
        <div class="seccion"><div class="seccion-titulo">Cliente</div><div class="seccion-contenido"><div class="grid-2">
          <div class="campo"><div class="campo-label">Razón Social</div><div class="campo-valor">${orden.cliente_nombre || '-'}</div></div>
          <div class="campo"><div class="campo-label">RUC</div><div class="campo-valor">${orden.cliente_ruc || '-'}</div></div>
        </div></div></div>
        <div class="seccion"><div class="seccion-titulo">Productos</div><div class="seccion-contenido">${productosHTML}</div></div>
        <div class="seccion"><div class="seccion-titulo">Información del Registro</div><div class="seccion-contenido"><div class="grid-2">
          <div class="campo"><div class="campo-label">Fecha de creación</div><div class="campo-valor">${formatearFechaHora(orden.created_at)}</div></div>
          <div class="campo"><div class="campo-label">Registrado por</div><div class="campo-valor">${usuario?.nombre_completo || 'Usuario'}</div></div>
        </div></div></div>
        <div class="footer">Documento generado por SGR - Sistema de Gestión de Reportes</div>
      </div></body></html>`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando orden...</p>
      </div>
    </div>
  );

  if (error || !orden) return (
    <div className="text-center py-12">
      <p className="text-rose-600">{error || 'Orden no encontrada'}</p>
      <Link to="/ordenes" className="text-blue-600 hover:underline mt-2 inline-block">Volver a órdenes</Link>
    </div>
  );

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/ordenes" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Orden de Servicio #{orden.id}</h1>
            <p className="text-slate-500 text-sm mt-1">{orden.productos?.length || 0} producto(s)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleImprimir} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
            <Printer size={18} /><span>Imprimir / Exportar PDF</span>
          </button>
          <Link to={`/ordenes/editar/${orden.id}`} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
            <Package size={18} /><span>Editar</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">ORDEN DE SERVICIO N° {orden.id}</h2>
              <p className="text-blue-100 text-sm">{formatearFechaHora(orden.created_at)}</p>
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
              <Building size={16} className="text-blue-500" />Cliente
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Razón Social</p><p className="font-medium">{orden.cliente_nombre || '-'}</p></div>
              <div><p className="text-xs text-slate-500">RUC</p><p className="font-medium">{orden.cliente_ruc || '-'}</p></div>
            </div>
          </div>

          {/* Productos */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Package size={16} className="text-blue-500" />Productos
            </div>
            <div className="p-4 space-y-6">
              {orden.productos?.map((prod, index) => {
                const esBiologico = prod.tipo_producto === 'biologico';
                return (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                    <h3 className="text-md font-semibold text-blue-600 mb-3">
                      Producto {index + 1}: {prod.producto_nombre || '-'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div><p className="text-xs text-slate-500">Registro Sanitario</p><p className="font-medium font-mono">{prod.producto_registro || '-'}</p></div>
                      <div><p className="text-xs text-slate-500">Tipo</p><p className="font-medium">{getTipoLabel(prod.tipo_producto)}</p></div>
                      {!esBiologico && prod.cpb_numero && <div><p className="text-xs text-slate-500">CPB N°</p><p className="font-medium">{prod.cpb_numero}</p></div>}
                      {!esBiologico && prod.monto && <div><p className="text-xs text-slate-500">Monto</p><p className="font-medium">S/ {parseFloat(prod.monto).toFixed(2)}</p></div>}
                      {prod.fecha_recepcion && <div><p className="text-xs text-slate-500">Fecha Recepción</p><p className="font-medium">{formatearFecha(prod.fecha_recepcion)}</p></div>}
                      {prod.fecha_ingreso_vuce && <div><p className="text-xs text-slate-500">Fecha Ingreso VUCE</p><p className="font-medium">{formatearFecha(prod.fecha_ingreso_vuce)}</p></div>}
                      {prod.fecha_fin_proceso && <div><p className="text-xs text-slate-500">Fecha Fin Proceso</p><p className="font-medium">{formatearFecha(prod.fecha_fin_proceso)}</p></div>}
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Servicios Solicitados</p>

                      {prod.tipo_producto === 'farmaceutico' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-xs text-slate-500">Categoría 1</span><p>{toBoolean(prod.categoria1) ? 'Sí' : 'No'}</p></div>
                            <div><span className="text-xs text-slate-500">Categoría 2</span><p>{toBoolean(prod.categoria2) ? 'Sí' : 'No'}</p></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {['cambio_mayor','cambio_menor','inscripcion','renovacion','traduccion'].map(item => {
                              if (!toBoolean(prod[item])) return null;
                              const label = item === 'cambio_mayor' ? 'Cambio Mayor' : item === 'cambio_menor' ? 'Cambio Menor' : item === 'inscripcion' ? 'Inscripción' : item === 'renovacion' ? 'Renovación' : 'Traducción';
                              return (
                                <div key={item} className="bg-white border border-slate-200 p-3 rounded">
                                  <p className="font-medium">{label}</p>
                                  <p className="text-sm text-slate-600">Autorizado por: {prod[`${item}_autorizado`] || 'No especificado'}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {prod.tipo_producto === 'dispositivo_medico' && (
                        <div className="grid grid-cols-2 gap-4">
                          {[1,2,3,4].map(num => {
                            if (!toBoolean(prod[`clase${num}`])) return null;
                            return (
                              <div key={num} className="bg-white border border-slate-200 p-3 rounded">
                                <p className="font-medium">Clase {num}</p>
                                <p className="text-sm text-slate-600">Autorizado por: {prod[`clase${num}_autorizado`] || 'No especificado'}</p>
                              </div>
                            );
                          })}
                          {toBoolean(prod.traduccion) && (
                            <div className="bg-white border border-slate-200 p-3 rounded">
                              <p className="font-medium">Traducción</p>
                              <p className="text-sm text-slate-600">Autorizado por: {prod.traduccion_autorizado || 'No especificado'}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {prod.tipo_producto === 'biologico' && (
                        <div className="grid grid-cols-2 gap-4">
                          {/* ✅ item.autorizado tiene el nombre correcto del campo en BD */}
                          {CAMPOS_BIOLOGICOS.map(item => {
                            if (!toBoolean(prod[item.name])) return null;
                            return (
                              <div key={item.name} className="bg-white border border-slate-200 p-3 rounded">
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-slate-600">
                                  Autorizado por: {prod[item.autorizado] || 'No especificado'}
                                </p>
                              </div>
                            );
                          })}
                          {toBoolean(prod.traduccion) && (
                            <div className="bg-white border border-slate-200 p-3 rounded">
                              <p className="font-medium">Traducción</p>
                              <p className="text-sm text-slate-600">Autorizado por: {prod.traduccion_autorizado || 'No especificado'}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {prod.observaciones && (
                      <div className="mt-4">
                        <p className="text-xs text-slate-500">Observaciones</p>
                        <p className="text-sm whitespace-pre-wrap">{prod.observaciones}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Información de registro */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />Información del Registro
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Fecha de creación</p><p className="font-medium">{formatearFechaHora(orden.created_at)}</p></div>
              <div><p className="text-xs text-slate-500">Registrado por</p><p className="font-medium">{usuario?.nombre_completo || 'Usuario'}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerOrden;

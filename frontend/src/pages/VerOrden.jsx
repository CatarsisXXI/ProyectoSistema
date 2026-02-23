import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Calendar, User, Package, Building, FileText, CheckCircle } from 'lucide-react';

function VerOrden() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrden();
  }, [id]);

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
    const labels = {
      farmaceutico: 'Farmacéutico',
      dispositivo_medico: 'Dispositivo Médico',
      biologico: 'Producto Biológico'
    };
    return labels[tipo] || tipo;
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatearFechaHora = (fechaISO) => {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImprimir = () => {
    // Abrir una nueva ventana para impresión
    const ventanaImpresion = window.open('', '_blank');
    
    // Generar el contenido HTML con estilos
    const contenidoHTML = generarHTMLImpresion();
    
    // Escribir el contenido en la nueva ventana
    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
    
    // Esperar a que los recursos se carguen y luego imprimir
    ventanaImpresion.onload = () => {
      ventanaImpresion.print();
      // Opcional: cerrar la ventana después de imprimir
      // ventanaImpresion.onafterprint = () => ventanaImpresion.close();
    };
  };

  const generarHTMLImpresion = () => {
    if (!orden) return '';

    // Estilos CSS para impresión (usando clases Tailwind pero en CSS plano para compatibilidad)
    const estilos = `
      <style>
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #1e293b;
        }
        .print-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
          margin: 0;
        }
        .header .subtitle {
          color: #64748b;
          font-size: 14px;
        }
        .empresa-info {
          text-align: right;
          font-size: 14px;
          color: #475569;
        }
        .seccion {
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .seccion-titulo {
          background: #f1f5f9;
          padding: 10px 15px;
          font-weight: 600;
          color: #0f172a;
          border-bottom: 1px solid #cbd5e1;
        }
        .seccion-contenido {
          padding: 15px;
          background: white;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .campo {
          margin-bottom: 10px;
        }
        .campo-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 2px;
        }
        .campo-valor {
          font-weight: 500;
          color: #0f172a;
          font-size: 14px;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-blue {
          background: #dbeafe;
          color: #1e40af;
        }
        .badge-green {
          background: #dcfce7;
          color: #166534;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th {
          text-align: left;
          padding: 8px;
          background: #f8fafc;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }
        .table td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    `;

    // Construir el cuerpo según el tipo de producto
    const servicios = () => {
      if (orden.tipo_producto === 'farmaceutico') {
        return (
          `<div class="grid-2">
            <div class="campo">
              <div class="campo-label">Categoría 1</div>
              <div class="campo-valor">${orden.categoria1 ? 'Sí' : 'No'}</div>
            </div>
            <div class="campo">
              <div class="campo-label">Categoría 2</div>
              <div class="campo-valor">${orden.categoria2 ? 'Sí' : 'No'}</div>
            </div>
          </div>
          <div class="grid-3">
            ${['cambio_mayor', 'cambio_menor', 'inscripcion', 'renovacion', 'traduccion'].map(item => {
              const checked = orden[item];
              const autorizado = orden[`${item}_autorizado`];
              if (!checked) return '';
              return `
                <div class="campo">
                  <div class="campo-label">${item.replace(/_/g, ' ')}</div>
                  <div class="campo-valor">Autorizado por: ${autorizado || 'No especificado'}</div>
                </div>
              `;
            }).join('')}
          </div>`
        );
      } else if (orden.tipo_producto === 'dispositivo_medico') {
        return (
          `<div class="grid-3">
            ${[1,2,3,4].map(num => {
              const checked = orden[`clase${num}`];
              const autorizado = orden[`clase${num}_autorizado`];
              if (!checked) return '';
              return `
                <div class="campo">
                  <div class="campo-label">Clase ${num}</div>
                  <div class="campo-valor">Autorizado por: ${autorizado || 'No especificado'}</div>
                </div>
              `;
            }).join('')}
            ${orden.traduccion ? `
              <div class="campo">
                <div class="campo-label">Traducción</div>
                <div class="campo-valor">Autorizado por: ${orden.traduccion_autorizado || 'No especificado'}</div>
              </div>
            ` : ''}
          </div>`
        );
      } else if (orden.tipo_producto === 'biologico') {
        return (
          `<div class="grid-3">
            ${[
              { name: 'vaccines_immunologicos', label: 'Vacunas e Inmunológicos' },
              { name: 'otros_biologicos_chk', label: 'Otros Biológicos' },
              { name: 'bioequivalente_chk', label: 'Bioequivalente' },
              { name: 'biotecnologico_chk', label: 'Biotecnológico' }
            ].map(item => {
              const checked = orden[item.name];
              const autorizado = orden[`${item.name}_autorizado`];
              if (!checked) return '';
              return `
                <div class="campo">
                  <div class="campo-label">${item.label}</div>
                  <div class="campo-valor">Autorizado por: ${autorizado || 'No especificado'}</div>
                </div>
              `;
            }).join('')}
            ${orden.traduccion ? `
              <div class="campo">
                <div class="campo-label">Traducción</div>
                <div class="campo-valor">Autorizado por: ${orden.traduccion_autorizado || 'No especificado'}</div>
              </div>
            ` : ''}
          </div>`
        );
      }
      return '';
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orden de Servicio #${orden.id}</title>
          ${estilos}
        </head>
        <body>
          <div class="print-container">
            <div class="header">
              <div>
                <h1>Orden de Servicio #${orden.id}</h1>
                <div class="subtitle">${getTipoLabel(orden.tipo_producto)}</div>
              </div>
              <div class="empresa-info">
                <div><strong>SGR</strong></div>
                <div>Sistema de Gestión de Reportes</div>
                <div>${formatearFechaHora(orden.created_at)}</div>
              </div>
            </div>

            <!-- Cliente -->
            <div class="seccion">
              <div class="seccion-titulo">Cliente</div>
              <div class="seccion-contenido">
                <div class="grid-2">
                  <div class="campo">
                    <div class="campo-label">Razón Social</div>
                    <div class="campo-valor">${orden.cliente_nombre || '-'}</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">RUC</div>
                    <div class="campo-valor">${orden.cliente_ruc || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Producto -->
            <div class="seccion">
              <div class="seccion-titulo">Producto</div>
              <div class="seccion-contenido">
                <div class="grid-3">
                  <div class="campo">
                    <div class="campo-label">Nombre</div>
                    <div class="campo-valor">${orden.producto_nombre || '-'}</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">Registro Sanitario</div>
                    <div class="campo-valor">${orden.producto_registro || '-'}</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">CPB N°</div>
                    <div class="campo-valor">${orden.cpb_numero || '-'}</div>
                  </div>
                </div>
                <div class="grid-3">
                  <div class="campo">
                    <div class="campo-label">Monto</div>
                    <div class="campo-valor">S/ ${orden.monto ? parseFloat(orden.monto).toFixed(2) : '0.00'}</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">Fecha Recepción</div>
                    <div class="campo-valor">${formatearFecha(orden.fecha_recepcion)}</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">Fecha Ingreso VUCE</div>
                    <div class="campo-valor">${formatearFecha(orden.fecha_ingreso_vuce)}</div>
                  </div>
                </div>
                <div class="grid-3">
                  <div class="campo">
                    <div class="campo-label">Fecha Fin Proceso</div>
                    <div class="campo-valor">${formatearFecha(orden.fecha_fin_proceso)}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Servicios -->
            <div class="seccion">
              <div class="seccion-titulo">Servicios Solicitados</div>
              <div class="seccion-contenido">
                ${servicios()}
              </div>
            </div>

            <!-- Observaciones -->
            ${orden.observaciones ? `
              <div class="seccion">
                <div class="seccion-titulo">Observaciones</div>
                <div class="seccion-contenido">
                  <p style="margin:0; white-space: pre-wrap;">${orden.observaciones}</p>
                </div>
              </div>
            ` : ''}

            <!-- Información de registro -->
            <div class="seccion">
              <div class="seccion-titulo">Información del Registro</div>
              <div class="seccion-contenido">
                <div class="grid-2">
                  <div class="campo">
                    <div class="campo-label">Fecha de creación</div>
                    <div class="campo-valor">${formatearFechaHora(orden.created_at)}</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">Registrado por</div>
                    <div class="campo-valor">${orden.usuario_nombre || 'Usuario'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              Documento generado por SGR - Sistema de Gestión de Reportes
            </div>
          </div>
        </body>
      </html>
    `;
    return html;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando orden...</p>
        </div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-600">{error || 'Orden no encontrada'}</p>
        <Link to="/ordenes" className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a órdenes
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Encabezado con botones */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/ordenes"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Orden de Servicio #{orden.id}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {getTipoLabel(orden.tipo_producto)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImprimir}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Printer size={18} />
            <span>Imprimir / Exportar PDF</span>
          </button>
          <Link
            to={`/ordenes/editar/${orden.id}`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Package size={18} />
            <span>Editar</span>
          </Link>
        </div>
      </div>

      {/* Contenido de la orden (vista previa) */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Cabecera de la orden en la vista */}
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
              <Building size={16} className="text-blue-500" />
              Cliente
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Razón Social</p>
                <p className="font-medium">{orden.cliente_nombre || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">RUC</p>
                <p className="font-medium">{orden.cliente_ruc || '-'}</p>
              </div>
            </div>
          </div>

          {/* Producto */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Package size={16} className="text-blue-500" />
              Producto
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500">Nombre</p>
                <p className="font-medium">{orden.producto_nombre || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Registro Sanitario</p>
                <p className="font-medium font-mono">{orden.producto_registro || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">CPB N°</p>
                <p className="font-medium">{orden.cpb_numero || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Monto</p>
                <p className="font-medium">S/ {orden.monto ? parseFloat(orden.monto).toFixed(2) : '0.00'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha Recepción</p>
                <p className="font-medium">{formatearFecha(orden.fecha_recepcion)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha Ingreso VUCE</p>
                <p className="font-medium">{formatearFecha(orden.fecha_ingreso_vuce)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha Fin Proceso</p>
                <p className="font-medium">{formatearFecha(orden.fecha_fin_proceso)}</p>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              Servicios Solicitados
            </div>
            <div className="p-4">
              {orden.tipo_producto === 'farmaceutico' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500">Categoría 1</span>
                      <p>{orden.categoria1 ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Categoría 2</span>
                      <p>{orden.categoria2 ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['cambio_mayor', 'cambio_menor', 'inscripcion', 'renovacion', 'traduccion'].map(item => {
                      if (!orden[item]) return null;
                      return (
                        <div key={item} className="bg-slate-50 p-3 rounded">
                          <p className="font-medium capitalize">{item.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-slate-600">Autorizado por: {orden[`${item}_autorizado`] || 'No especificado'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {orden.tipo_producto === 'dispositivo_medico' && (
                <div className="grid grid-cols-2 gap-4">
                  {[1,2,3,4].map(num => {
                    if (!orden[`clase${num}`]) return null;
                    return (
                      <div key={num} className="bg-slate-50 p-3 rounded">
                        <p className="font-medium">Clase {num}</p>
                        <p className="text-sm text-slate-600">Autorizado por: {orden[`clase${num}_autorizado`] || 'No especificado'}</p>
                      </div>
                    );
                  })}
                  {orden.traduccion && (
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-medium">Traducción</p>
                      <p className="text-sm text-slate-600">Autorizado por: {orden.traduccion_autorizado || 'No especificado'}</p>
                    </div>
                  )}
                </div>
              )}
              {orden.tipo_producto === 'biologico' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'vaccines_immunologicos', label: 'Vacunas e Inmunológicos' },
                    { name: 'otros_biologicos_chk', label: 'Otros Biológicos' },
                    { name: 'bioequivalente_chk', label: 'Bioequivalente' },
                    { name: 'biotecnologico_chk', label: 'Biotecnológico' }
                  ].map(item => {
                    if (!orden[item.name]) return null;
                    return (
                      <div key={item.name} className="bg-slate-50 p-3 rounded">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-slate-600">Autorizado por: {orden[`${item.name}_autorizado`] || 'No especificado'}</p>
                      </div>
                    );
                  })}
                  {orden.traduccion && (
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-medium">Traducción</p>
                      <p className="text-sm text-slate-600">Autorizado por: {orden.traduccion_autorizado || 'No especificado'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {orden.observaciones && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" />
                Observaciones
              </div>
              <div className="p-4">
                <p className="whitespace-pre-wrap">{orden.observaciones}</p>
              </div>
            </div>
          )}

          {/* Información de registro */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Información del Registro
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Fecha de creación</p>
                <p className="font-medium">{formatearFechaHora(orden.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Registrado por</p>
                <p className="font-medium">{orden.usuario_nombre || 'Usuario'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerOrden;
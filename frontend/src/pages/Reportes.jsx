import { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Printer, FileText, Calendar, User, Package, Download } from 'lucide-react';

function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/documentos/reporte/contabilidad', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportes(res.data);
    } catch (error) {
      console.error('Error fetching reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReportes = filterTipo 
    ? reportes.filter(r => r.tipo_producto === filterTipo)
    : reportes;

  const getTipoLabel = (tipo) => {
    const labels = {
      farmaceutico: 'Farmacéutico',
      dispositivo_medico: 'Dispositivo Médico',
      biologico: 'Biológico'
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo) => {
    const colors = {
      farmaceutico: 'bg-blue-100 text-blue-800',
      dispositivo_medico: 'bg-purple-100 text-purple-800',
      biologico: 'bg-emerald-100 text-emerald-800'
    };
    return colors[tipo] || 'bg-slate-100 text-slate-800';
  };

  const getServiciosFarmaceutico = (reporte) => {
    const servicios = [];
    const nombres = {
      inscripcion: 'Inscripción',
      renovacion: 'Renovación',
      traduccion: 'Traducción',
      cambio_mayor: 'Cambio Mayor',
      cambio_menor: 'Cambio Menor'
    };

    Object.keys(nombres).forEach(key => {
      if (reporte[key] === true || reporte[key] === 1) {
        const aplicaCategorias = ['cambio_mayor', 'cambio_menor', 'inscripcion', 'renovacion'].includes(key);
        
        if (aplicaCategorias) {
          if (reporte.categoria1) {
            servicios.push({
              nombre: nombres[key],
              categoria: 'Categoría 1',
              producto: reporte.producto_nombre,
              sanitario: reporte.registro_sanitario
            });
          }
          if (reporte.categoria2) {
            servicios.push({
              nombre: nombres[key],
              categoria: 'Categoría 2',
              producto: reporte.producto_nombre,
              sanitario: reporte.registro_sanitario
            });
          }
        } else {
          servicios.push({
            nombre: nombres[key],
            categoria: '',
            producto: reporte.producto_nombre,
            sanitario: reporte.registro_sanitario
          });
        }
      }
    });
    return servicios;
  };

  const getServiciosDispositivo = (reporte) => {
    const servicios = [];
    const nombres = {
      clase1: 'Clase 1',
      clase2: 'Clase 2',
      clase3: 'Clase 3',
      clase4: 'Clase 4',
      traduccion: 'Traducción'
    };

    Object.keys(nombres).forEach(key => {
      if (reporte[key] === true || reporte[key] === 1) {
        servicios.push({
          nombre: nombres[key],
          categoria: '',
          producto: reporte.producto_nombre,
          sanitario: reporte.registro_sanitario
        });
      }
    });
    return servicios;
  };

  const getServiciosBiologico = (reporte) => {
    const servicios = [];
    const nombres = {
      vaccines_inmunologicos: 'Vacunas e Inmunológicos',
      otros_biologicos: 'Otros Biológicos',
      bioequivalente: 'Bioequivalente',
      biotecnologico: 'Biotecnológico',
      traduccion: 'Traducción'
    };

    Object.keys(nombres).forEach(key => {
      if (reporte[key] === true || reporte[key] === 1) {
        servicios.push({
          nombre: nombres[key],
          categoria: '',
          producto: reporte.producto_nombre,
          sanitario: reporte.registro_sanitario
        });
      }
    });
    return servicios;
  };

  const getServicios = (reporte) => {
    switch (reporte.tipo_producto) {
      case 'farmaceutico':
        return getServiciosFarmaceutico(reporte);
      case 'dispositivo_medico':
        return getServiciosDispositivo(reporte);
      case 'biologico':
        return getServiciosBiologico(reporte);
      default:
        return [];
    }
  };

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const handleImprimir = (reporte) => {
    const ventanaImpresion = window.open('', '_blank');
    const contenidoHTML = generarHTMLImpresion(reporte);
    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
    ventanaImpresion.onload = () => {
      ventanaImpresion.print();
    };
  };

  const generarHTMLImpresion = (reporte) => {
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
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }
        .servicios-lista {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .servicios-lista li {
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .servicios-lista li:last-child {
          border-bottom: none;
        }
      </style>
    `;

    const servicios = getServicios(reporte);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte Contable #${reporte.id}</title>
          ${estilos}
        </head>
        <body>
          <div class="print-container">
            <div class="header">
              <div>
                <h1>Reporte Contable #${reporte.id}</h1>
                <div class="subtitle">${getTipoLabel(reporte.tipo_producto)}</div>
              </div>
              <div class="empresa-info">
                <div><strong>SGR</strong></div>
                <div>Sistema de Gestión de Reportes</div>
                <div>${formatearFechaHora(reporte.created_at)}</div>
              </div>
            </div>

            <div class="seccion">
              <div class="seccion-titulo">Cliente</div>
              <div class="seccion-contenido">
                <div class="grid-2">
                  <div class="campo">
                    <div class="campo-label">Razón Social</div>
                    <div class="campo-valor">${reporte.cliente || '-'}</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">RUC</div>
                    <div class="campo-valor">${reporte.ruc || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="seccion">
              <div class="seccion-titulo">Servicios</div>
              <div class="seccion-contenido">
                ${servicios.length > 0 ? `
                  <ul class="servicios-lista">
                    ${servicios.map(s => `
                      <li>
                        <strong>${s.nombre}</strong>
                        ${s.categoria ? ` (${s.categoria})` : ''}
                        <div style="font-size:12px; color:#64748b;">
                          ${s.producto} - Reg. ${s.sanitario}
                        </div>
                      </li>
                    `).join('')}
                  </ul>
                ` : '<p>No hay servicios contratados</p>'}
              </div>
            </div>

            ${(reporte.derecho_tramite_cpb || reporte.derecho_tramite_monto) ? `
              <div class="seccion">
                <div class="seccion-titulo">Derecho de Trámite (Tasa de Salud)</div>
                <div class="seccion-contenido">
                  <div style="display: flex; justify-content: space-between;">
                    ${reporte.derecho_tramite_cpb ? `<span><span style="color:#64748b;">CPB N°:</span> ${reporte.derecho_tramite_cpb}</span>` : ''}
                    ${reporte.derecho_tramite_monto ? `<span><strong>${formatCurrency(reporte.derecho_tramite_monto)}</strong></span>` : ''}
                  </div>
                </div>
              </div>
            ` : ''}

            ${reporte.pdf_adjunto ? `
              <div class="seccion">
                <div class="seccion-titulo">Documento Adjunto</div>
                <div class="seccion-contenido">
                  <div class="campo-valor">${reporte.pdf_adjunto}</div>
                </div>
              </div>
            ` : ''}

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
          <p className="text-slate-500 font-medium">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reportes para Contabilidad</h1>
          <p className="text-slate-500 text-sm mt-1">Reporte de documentos contables por producto</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Filtrar por tipo:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTipo('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterTipo === '' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterTipo('farmaceutico')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterTipo === 'farmaceutico' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Farmacéuticos
          </button>
          <button
            onClick={() => setFilterTipo('dispositivo_medico')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterTipo === 'dispositivo_medico' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dispositivos Médicos
          </button>
          <button
            onClick={() => setFilterTipo('biologico')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterTipo === 'biologico' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Productos Biológicos
          </button>
        </div>
      </div>

      {/* Report Cards */}
      {filteredReportes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No hay reportes</h3>
          <p className="text-slate-500 text-sm">No se encontraron documentos contables para mostrar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReportes.map((reporte) => {
            const servicios = getServicios(reporte);
            return (
              <div key={reporte.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden print:break-inside-avoid">
                {/* Cabecera del reporte */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Documento Contable #{reporte.id}</h2>
                      <p className="text-blue-100 text-sm">{formatearFecha(reporte.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(reporte.tipo_producto)}`}>
                        {getTipoLabel(reporte.tipo_producto)}
                      </span>
                      <button
                        onClick={() => handleImprimir(reporte)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                        title="Imprimir reporte"
                      >
                        <Printer size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Cliente */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      <span className="font-medium text-slate-700">Cliente:</span>
                      <span className="text-slate-600">{reporte.cliente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">RUC:</span>
                      <span className="font-mono text-sm">{reporte.ruc}</span>
                    </div>
                  </div>

                  {/* Servicios */}
                  {servicios.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Package size={16} className="text-blue-500" />
                        Servicios Contratados
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {servicios.map((servicio, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg text-sm">
                            <span className="font-medium text-slate-700">{servicio.nombre}</span>
                            {servicio.categoria && (
                              <span className="text-slate-500 ml-2">({servicio.categoria})</span>
                            )}
                            <div className="text-xs text-slate-500 mt-1">
                              {servicio.producto} - Reg: {servicio.sanitario}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Derecho de Trámite */}
                  {(reporte.derecho_tramite_monto || reporte.derecho_tramite_cpb) && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Derecho de Trámite (Tasa de Salud)</span>
                        <div className="flex items-center gap-4">
                          {reporte.derecho_tramite_cpb && (
                            <span className="text-sm text-slate-500">
                              <span className="font-medium">CPB N°:</span> {reporte.derecho_tramite_cpb}
                            </span>
                          )}
                          {reporte.derecho_tramite_monto && (
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(reporte.derecho_tramite_monto)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF Adjunto */}
                  {reporte.pdf_adjunto && (
                    <div className="mt-4">
                      <a
                        href={`/uploads/documentos/${reporte.pdf_adjunto}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FileText size={14} />
                        Ver PDF adjunto
                        <Download size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Reportes;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Filter, 
  Printer, 
  Calendar, 
  User, 
  Package, 
  DollarSign,
  FileCheck,
  Download,
  Eye,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

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
      farmaceutico: 'bg-blue-100 text-blue-800 border-blue-200',
      dispositivo_medico: 'bg-purple-100 text-purple-800 border-purple-200',
      biologico: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[tipo] || 'bg-slate-100 text-slate-800 border-slate-200';
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
          <p className="text-slate-500 text-sm mt-1">
            Reporte de documentos contables por producto
          </p>
        </div>
        {filteredReportes.length > 0 && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Printer size={18} />
            <span className="font-medium">Imprimir Reportes</span>
          </button>
        )}
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

      {/* Reportes */}
      {filteredReportes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
            <AlertCircle size={24} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-1">No hay reportes</h3>
          <p className="text-slate-500 text-sm">No se encontraron documentos contables para el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReportes.map((reporte) => {
            const servicios = getServicios(reporte);
            return (
              <div 
                key={reporte.id} 
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden print:break-inside-avoid hover:shadow-lg transition-shadow duration-300"
              >
                {/* Cabecera del reporte */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileText size={20} />
                      <div>
                        <h2 className="text-lg font-bold">{reporte.cliente}</h2>
                        <p className="text-sm text-blue-100">RUC: {reporte.ruc}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTipoColor(reporte.tipo_producto)} bg-opacity-90`}>
                      {getTipoLabel(reporte.tipo_producto)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Servicios */}
                  {servicios.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                        <Package size={16} className="text-blue-500" />
                        Servicios Contratados
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        {servicios.map((servicio, idx) => (
                          <div key={idx} className="flex items-start text-sm border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                            <ChevronRight size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-slate-800">{servicio.nombre}</span>
                              {servicio.categoria && (
                                <span className="text-slate-600 ml-2">({servicio.categoria})</span>
                              )}
                              <div className="text-xs text-slate-500 mt-1">
                                {servicio.producto} - Registro: {servicio.sanitario}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Derecho de Trámite */}
                  {reporte.derecho_tramite_monto && parseFloat(reporte.derecho_tramite_monto) > 0 && (
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-emerald-600" />
                          <span className="font-semibold text-slate-700">Derecho de Trámite (Tasa de Salud)</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                          {formatCurrency(reporte.derecho_tramite_monto)}
                        </span>
                      </div>
                      {reporte.derecho_tramite_cpb && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <FileCheck size={12} />
                          CPB Nº: {reporte.derecho_tramite_cpb}
                        </p>
                      )}
                    </div>
                  )}

                  {/* PDF Adjunto */}
                  {reporte.pdf_adjunto && (
                    <div className="border-t border-slate-200 pt-4">
                      <a 
                        href={`/uploads/documentos/${reporte.pdf_adjunto}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Ver documento PDF adjunto</span>
                        <Download size={14} className="ml-1" />
                      </a>
                    </div>
                  )}

                  {/* Fecha */}
                  <div className="border-t border-slate-200 pt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} />
                    <span>Fecha de registro: {formatearFecha(reporte.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estilos de impresión */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .animate-fadeIn {
            animation: none;
          }
          .bg-white {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
          .bg-gradient-to-r {
            background: #2563eb !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

export default Reportes;
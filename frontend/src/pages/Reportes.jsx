import { useState, useEffect } from 'react';
import axios from 'axios';

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
          // Crear línea para Categoria 1 si está seleccionada
          if (reporte.categoria1) {
            servicios.push({
              nombre: nombres[key],
              categoria: 'Categoria 1',
              producto: reporte.producto_nombre,
              sanitario: reporte.registro_sanitario
            });
          }
          // Crear línea para Categoria 2 si está seleccionada
          if (reporte.categoria2) {
            servicios.push({
              nombre: nombres[key],
              categoria: 'Categoria 2',
              producto: reporte.producto_nombre,
              sanitario: reporte.registro_sanitario
            });
          }
        } else {
          // Para servicios sin categoría (traducción)
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

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Reportes para Contabilidad</h1>
        <p className="text-text-secondary">Reporte de documentos contables por producto</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setFilterTipo('')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterTipo === '' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterTipo('farmaceutico')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterTipo === 'farmaceutico' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            Farmacéuticos
          </button>
          <button
            onClick={() => setFilterTipo('dispositivo_medico')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterTipo === 'dispositivo_medico' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            Dispositivos Médicos
          </button>
          <button
            onClick={() => setFilterTipo('biologico')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterTipo === 'biologico' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            Productos Biológicos
          </button>
        </div>
      </div>

      {/* Report Cards */}
      {loading ? (
        <div className="p-8 text-center text-text-secondary">Cargando...</div>
      ) : filteredReportes.length === 0 ? (
        <div className="p-8 text-center text-text-secondary">
          No se encontraron reportes
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReportes.map((reporte) => {
            const servicios = getServicios(reporte);
            return (
              <div key={reporte.id} className="bg-white rounded-xl shadow-sm p-8 print:break-inside-avoid">
                {/* Header - Cliente Info */}
                <div className="mb-6 border-b-2 border-gray-200 pb-4">
                  <h3 className="text-xl font-bold text-text-primary">
                    Cliente: {reporte.cliente}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">RUC: {reporte.ruc}</p>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {getTipoLabel(reporte.tipo_producto)}
                    </span>
                  </div>
                </div>

                {/* Servicios */}
                {servicios.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">Servicios Contratados:</h4>
                    <div className="space-y-2">
                      {servicios.map((servicio, idx) => (
                        <div key={idx} className="flex items-start text-sm text-text-primary">
                          <span className="min-w-fit mr-2">•</span>
                          <div>
                            <span className="font-medium">{servicio.nombre}:</span>
                            {servicio.categoria && (
                              <span className="text-text-secondary ml-2">{servicio.categoria}</span>
                            )}
                            <span className="ml-2">{servicio.producto}</span>
                            <span className="text-text-secondary ml-2">Registro sanitario: {servicio.sanitario}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Derecho de Tramite */}
                {reporte.derecho_tramite_monto && parseFloat(reporte.derecho_tramite_monto) > 0 && (
                  <div className="mt-6 pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary">
                        Derecho de Trámite (Tasa de Salud):
                      </span>
                      <span className="text-lg font-bold text-secondary">
                        {formatCurrency(reporte.derecho_tramite_monto)}
                      </span>
                    </div>
                    {reporte.derecho_tramite_cpb && (
                      <p className="text-xs text-text-secondary mt-2">CPB Nº: {reporte.derecho_tramite_cpb}</p>
                    )}
                  </div>
                )}

                {/* PDF Adjunto */}
                {reporte.pdf_adjunto && (
                  <div className="mt-4">
                    <a 
                      href={`/uploads/documentos/${reporte.pdf_adjunto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      📄 Ver documento PDF
                    </a>
                  </div>
                )}

                {/* Fecha */}
                <div className="mt-4 text-xs text-text-secondary">
                  Fecha: {new Date(reporte.created_at).toLocaleDateString('es-PE')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print Button */}
      {filteredReportes.length > 0 && (
        <div className="mt-8 flex justify-end no-print">
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 font-medium"
          >
            <span>🖨️</span> Imprimir Reportes
          </button>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .fade-in {
            animation: none;
          }
          .bg-white {
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

export default Reportes;

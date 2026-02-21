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

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Reportes para Contabilidad</h1>
        <p className="text-text-secondary">Reporte de documentos contables</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-4">
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
        <div className="space-y-4">
          {filteredReportes.map((reporte) => (
            <div key={reporte.id} className="bg-white rounded-xl shadow-sm p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {reporte.cliente}
                  </h3>
                  <p className="text-sm text-text-secondary">RUC: {reporte.ruc}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {getTipoLabel(reporte.tipo_producto)}
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{reporte.producto_nombre}</span>
                  <span className="text-text-secondary">Registro sanitario: {reporte.registro_sanitario}</span>
                </div>
              </div>

              {/* Footer - Derecho de Tramite */}
              {reporte.derecho_tramite_cpb && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-text-primary">Derecho de Trámite (Tasa de Salud):</span>
                    </div>
                    <div className="text-lg font-bold text-secondary">
                      S/ {parseFloat(reporte.derecho_tramite_monto || 0).toFixed(2)}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">CPB N°: {reporte.derecho_tramite_cpb}</p>
                </div>
              )}

              {/* Fecha */}
              <div className="mt-4 text-xs text-text-secondary">
                Fecha de generación: {new Date(reporte.created_at).toLocaleDateString('es-PE')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print Button */}
      {filteredReportes.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <span>🖨️</span> Imprimir Reportes
          </button>
        </div>
      )}
    </div>
  );
}

export default Reportes;

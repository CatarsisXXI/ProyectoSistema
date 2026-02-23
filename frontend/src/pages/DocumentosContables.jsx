import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DocumentosContables() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/documentos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching documentos:', error);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocumentos = filterTipo 
    ? documentos.filter(d => d.tipo_producto === filterTipo)
    : documentos;

  const getTipoLabel = (tipo) => {
    const labels = {
      farmaceutico: 'Farmacéutico',
      dispositivo_medico: 'Dispositivo Médico',
      biologico: 'Biológico'
    };
    return labels[tipo] || tipo;
  };

  const calcularTotal = (doc) => {
    let total = 0;
    
    if (doc.tipo_producto === 'farmaceutico') {
      if (doc.cambio_mayor && doc.cambio_mayor_costo) total += parseFloat(doc.cambio_mayor_costo);
      if (doc.cambio_menor && doc.cambio_menor_costo) total += parseFloat(doc.cambio_menor_costo);
      if (doc.inscripcion && doc.inscripcion_costo) total += parseFloat(doc.inscripcion_costo);
      if (doc.renovacion && doc.renovacion_costo) total += parseFloat(doc.renovacion_costo);
      if (doc.traduccion && doc.traduccion_costo) total += parseFloat(doc.traduccion_costo);
    } else if (doc.tipo_producto === 'dispositivo_medico') {
      if (doc.clase1 && doc.clase1_costo) total += parseFloat(doc.clase1_costo);
      if (doc.clase2 && doc.clase2_costo) total += parseFloat(doc.clase2_costo);
      if (doc.clase3 && doc.clase3_costo) total += parseFloat(doc.clase3_costo);
      if (doc.clase4 && doc.clase4_costo) total += parseFloat(doc.clase4_costo);
      if (doc.traduccion && doc.traduccion_costo) total += parseFloat(doc.traduccion_costo);
    } else if (doc.tipo_producto === 'biologico') {
      if (doc.vaccines_inmunologicos && doc.vaccines_inmunologicos_costo) total += parseFloat(doc.vaccines_inmunologicos_costo);
      if (doc.otros_biologicos && doc.otros_biologicos_costo) total += parseFloat(doc.otros_biologicos_costo);
      if (doc.bioequivalente && doc.bioequivalente_costo) total += parseFloat(doc.bioequivalente_costo);
      if (doc.biotecnologico && doc.biotecnologico_costo) total += parseFloat(doc.biotecnologico_costo);
      if (doc.traduccion && doc.traduccion_costo) total += parseFloat(doc.traduccion_costo);
    }
    
    return total;
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Documentos Contables</h1>
          <p className="text-text-secondary">Gestión de documentos contables</p>
        </div>
        <Link
          to="/documentos/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <span>➕</span> Nuevo Documento
        </Link>
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Cargando...</div>
        ) : filteredDocumentos.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            No se encontraron documentos contables
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">RUC</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Producto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Registro</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Derecho Tramite</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocumentos.map((doc) => (
                  <tr key={doc.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">#{doc.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {getTipoLabel(doc.tipo_producto)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{doc.cliente_nombre}</td>
                    <td className="px-4 py-3 text-sm">{doc.cliente_ruc}</td>
                    <td className="px-4 py-3 text-sm">{doc.producto_nombre}</td>
                    <td className="px-4 py-3 text-sm font-mono">{doc.producto_registro}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      S/ {calcularTotal(doc).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {doc.derecho_tramite_cpb ? (
                        <span>{doc.derecho_tramite_cpb} - S/ {doc.derecho_tramite_monto}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(doc.created_at).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentosContables;

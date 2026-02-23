import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Calendar, User, Eye, Pencil, FileText, Filter } from 'lucide-react';

function DocumentosContables() {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState('');
  const location = useLocation();

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

  useEffect(() => {
    fetchDocumentos();
  }, [location.key]);

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

  const getTipoColor = (tipo) => {
    const colors = {
      farmaceutico: 'bg-blue-100 text-blue-800',
      dispositivo_medico: 'bg-purple-100 text-purple-800',
      biologico: 'bg-emerald-100 text-emerald-800'
    };
    return colors[tipo] || 'bg-slate-100 text-slate-800';
  };

  const calcularTotal = (doc) => {
    let total = 0;
    if (doc.cambio_mayor && doc.cambio_mayor_costo) total += parseFloat(doc.cambio_mayor_costo) || 0;
    if (doc.cambio_menor && doc.cambio_menor_costo) total += parseFloat(doc.cambio_menor_costo) || 0;
    if (doc.inscripcion && doc.inscripcion_costo) total += parseFloat(doc.inscripcion_costo) || 0;
    if (doc.renovacion && doc.renovacion_costo) total += parseFloat(doc.renovacion_costo) || 0;
    if (doc.clase1 && doc.clase1_costo) total += parseFloat(doc.clase1_costo) || 0;
    if (doc.clase2 && doc.clase2_costo) total += parseFloat(doc.clase2_costo) || 0;
    if (doc.clase3 && doc.clase3_costo) total += parseFloat(doc.clase3_costo) || 0;
    if (doc.clase4 && doc.clase4_costo) total += parseFloat(doc.clase4_costo) || 0;
    if (doc.vaccines_inmunologicos && doc.vaccines_inmunologicos_costo) total += parseFloat(doc.vaccines_inmunologicos_costo) || 0;
    if (doc.otros_biologicos && doc.otros_biologicos_costo) total += parseFloat(doc.otros_biologicos_costo) || 0;
    if (doc.bioequivalente && doc.bioequivalente_costo) total += parseFloat(doc.bioequivalente_costo) || 0;
    if (doc.biotecnologico && doc.biotecnologico_costo) total += parseFloat(doc.biotecnologico_costo) || 0;
    if (doc.traduccion && doc.traduccion_costo) total += parseFloat(doc.traduccion_costo) || 0;
    if (doc.derecho_tramite_monto) total += parseFloat(doc.derecho_tramite_monto) || 0;
    return total;
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
          <p className="text-slate-500 font-medium">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Documentos Contables</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de documentos contables</p>
        </div>
        <Link
          to="/documentos/nuevo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={18} />
          <span className="font-medium">Nuevo Documento</span>
        </Link>
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

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RUC</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Derecho Trámite</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registrado por</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDocumentos.map((doc) => {
                const total = calcularTotal(doc);
                return (
                  <tr key={doc.id} className="group hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      #{doc.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(doc.tipo_producto)}`}>
                        {getTipoLabel(doc.tipo_producto)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                      {doc.cliente_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {doc.cliente_ruc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {doc.producto_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                      {doc.producto_registro}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                      S/ {total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {doc.derecho_tramite_cpb ? (
                        <span>{doc.derecho_tramite_cpb} - S/ {parseFloat(doc.derecho_tramite_monto).toFixed(2)}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {formatearFecha(doc.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-slate-400" />
                        {doc.usuario_nombre || 'Usuario'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/documentos/ver/${doc.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/documentos/editar/${doc.id}`}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Editar documento"
                        >
                          <Pencil size={16} />
                        </Link>
                        {doc.pdf_adjunto && (
                          <a
                            href={`/uploads/documentos/${doc.pdf_adjunto}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Ver PDF"
                          >
                            <FileText size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje sin resultados */}
        {filteredDocumentos.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Search size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay documentos</h3>
            <p className="text-slate-500 text-sm">Comienza creando un nuevo documento contable.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentosContables;
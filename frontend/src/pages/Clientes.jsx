import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Pencil, Trash2, Search, Phone, Mail, Calendar } from 'lucide-react';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(res.data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [location.key]);

  const eliminarCliente = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/clientes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchClientes();
      } catch (error) {
        console.error('Error deleting cliente:', error);
      }
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">Lista de clientes registrados en el sistema</p>
        </div>
        <Link
          to="/clientes/nuevo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <UserPlus size={18} />
          <span className="font-medium">Nuevo Cliente</span>
        </Link>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RUC</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Razón Social</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Representante</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientes.map((cliente) => {
                // Parseo seguro de categoría
                let categorias = [];
                if (cliente.categoria) {
                  try {
                    const parsed = JSON.parse(cliente.categoria);
                    categorias = Array.isArray(parsed) ? parsed : [];
                  } catch (e) {
                    categorias = [];
                  }
                }

                return (
                  <tr 
                    key={cliente.id} 
                    className="group hover:bg-blue-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {cliente.codigo_cliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {cliente.ruc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {cliente.razon_social}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {cliente.representante_legal || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex flex-col gap-1">
                        {cliente.email1 && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-slate-400" />
                            <span className="text-xs">{cliente.email1}</span>
                          </span>
                        )}
                        {cliente.celular1 && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-slate-400" />
                            <span className="text-xs">{cliente.celular1}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {categorias.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {categorias.map((cat, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        {formatFecha(cliente.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/clientes/editar/${cliente.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          title="Editar cliente"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => eliminarCliente(cliente.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Eliminar cliente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje sin resultados */}
        {clientes.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Search size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay clientes</h3>
            <p className="text-slate-500 text-sm">Comienza creando un nuevo cliente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Clientes;
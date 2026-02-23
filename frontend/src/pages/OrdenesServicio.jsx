import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Pencil, FileText, Search, Calendar, User, Eye, Printer } from 'lucide-react';

function OrdenesServicio() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdenes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/ordenes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrdenes(res.data);
    } catch (error) {
      console.error('Error fetching ordenes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, [location.key]);

  const getTipoLabel = (tipo) => {
    const labels = {
      farmaceutico: 'Farmacéutico',
      dispositivo_medico: 'Dispositivo Médico',
      biologico: 'Producto Biológico'
    };
    return labels[tipo] || tipo;
  };

  const handleGenerarDocumento = (orden) => {
    navigate('/documentos/nuevo', {
      state: {
        ordenData: {
          id: orden.id,
          tipo_producto: orden.tipo_producto,
          clienteInfo: {
            id: orden.cliente_id,
            razon_social: orden.cliente_nombre,
            ruc: orden.cliente_ruc
          },
          productoInfo: {
            id: orden.producto_id,
            nombre_producto: orden.producto_nombre,
            codigo_registro: orden.producto_registro
          }
        }
      }
    });
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
          <p className="text-slate-500 font-medium">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Órdenes de Servicio</h1>
          <p className="text-slate-500 text-sm mt-1">Lista de órdenes de servicio</p>
        </div>
        <Link
          to="/ordenes/nuevo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={18} />
          <span className="font-medium">Nueva Orden</span>
        </Link>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registro Sanitario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CPB N°</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registrado por</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ordenes.map((orden) => (
                <tr key={orden.id} className="group hover:bg-blue-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {orden.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {getTipoLabel(orden.tipo_producto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {orden.cliente_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {orden.cliente_ruc}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {orden.producto_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                    {orden.producto_registro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {orden.cpb_numero || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {formatearFecha(orden.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      {orden.usuario_nombre || 'Usuario'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {/* Botón Ver Detalles */}
                      <Link
                        to={`/ordenes/${orden.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </Link>
                      {/* Botón Editar */}
                      <Link
                        to={`/ordenes/editar/${orden.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                        title="Editar orden"
                      >
                        <Pencil size={16} />
                      </Link>

                      {/* Botón Generar Documento */}
                      <button
                        onClick={() => handleGenerarDocumento(orden)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Generar documento"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje sin resultados */}
        {ordenes.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Search size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay órdenes</h3>
            <p className="text-slate-500 text-sm">Comienza creando una nueva orden de servicio.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdenesServicio;
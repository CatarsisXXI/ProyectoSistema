import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Pencil, FileText, Search, Calendar, Eye } from 'lucide-react';

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

  useEffect(() => { fetchOrdenes(); }, [location.key]);

  const getTipoLabel = (tipo) => {
    const labels = {
      farmaceutico: 'Farmacéutico',
      dispositivo_medico: 'Dispositivo Médico',
      biologico: 'Producto Biológico'
    };
    return labels[tipo] || tipo;
  };

  // Calcula la suma de montos de todos los productos de la orden
  // Solo farmacéutico y dispositivo_medico tienen campo monto
  const calcularTotalOrden = (orden) => {
    return (orden.productos || []).reduce((sum, p) => {
      if (p.tipo_producto !== 'biologico' && p.monto) {
        sum += parseFloat(p.monto) || 0;
      }
      return sum;
    }, 0);
  };

  const handleGenerarDocumento = (orden) => {
    const primerProducto = orden.productos?.[0];
    const totalOrden = calcularTotalOrden(orden);

    // Construir mapa de montos por tipo de producto para pre-cargar en el documento
    // Se toman del primer producto farmacéutico o dispositivo que tenga monto
    const productoConMonto = (orden.productos || []).find(
      p => p.tipo_producto !== 'biologico' && p.monto
    );

    navigate('/documentos/nuevo', {
      state: {
        ordenData: {
          id: orden.id,
          tipo_producto: primerProducto?.tipo_producto || 'farmaceutico',
          totalMonto: totalOrden,                        // total de la orden para mostrarlo
          monto_orden: totalOrden,                       // campo que se guarda en documento
          clienteInfo: {
            id: orden.cliente_id,
            razon_social: orden.cliente_nombre,
            ruc: orden.cliente_ruc
          },
          productoInfo: primerProducto ? {
            id: primerProducto.producto_id,
            nombre_producto: primerProducto.producto_nombre,
            codigo_registro: primerProducto.producto_registro
          } : null,
          // Detalles de todos los productos para referencia
          productos: orden.productos || []
        }
      }
    });
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  const formatearMonto = (num) =>
    num > 0 ? `S/ ${num.toFixed(2)}` : '-';

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RUC</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cant.</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registros Sanitarios</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Orden</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ordenes.map((orden) => {
                const cantidad = orden.productos?.length || 0;
                const primerProducto = orden.productos?.[0];
                const otros = cantidad > 1 ? ` +${cantidad - 1}` : '';
                const totalOrden = calcularTotalOrden(orden);
                return (
                  <tr key={orden.id} className="group hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {orden.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {orden.cliente_nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {orden.cliente_ruc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {primerProducto ? primerProducto.producto_nombre : '-'}
                      {otros && <span className="ml-1 text-xs text-blue-500 font-medium">{otros}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                      {primerProducto ? primerProducto.producto_registro : '-'}
                      {otros && <span className="ml-1 text-xs text-slate-400">y más</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-700">
                      {formatearMonto(totalOrden)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {formatearFecha(orden.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/ordenes/${orden.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/ordenes/editar/${orden.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          title="Editar orden"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleGenerarDocumento(orden)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Generar documento contable"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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

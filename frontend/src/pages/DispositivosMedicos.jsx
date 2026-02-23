import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Pencil, Search, Calendar, User, Package } from 'lucide-react';

function DispositivosMedicos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/productos/dispositivos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(res.data);
    } catch (error) {
      console.error('Error fetching dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [location.key]);

  // Formatear fecha
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
          <p className="text-slate-500 font-medium">Cargando dispositivos médicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dispositivos Médicos</h1>
          <p className="text-slate-500 text-sm mt-1">Lista de dispositivos médicos registrados</p>
        </div>
        <Link
          to="/productos/dispositivos/nuevo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus size={18} />
          <span className="font-medium">Nuevo Dispositivo</span>
        </Link>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Código Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre del Producto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Clase</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registrado por</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productos.map((producto) => {
                // Construir etiquetas de clase (booleanos)
                const clases = [];
                if (producto.clase1) clases.push('Clase 1');
                if (producto.clase2) clases.push('Clase 2');
                if (producto.clase3) clases.push('Clase 3');
                if (producto.clase4) clases.push('Clase 4');

                return (
                  <tr 
                    key={producto.id} 
                    className="group hover:bg-blue-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      {producto.codigo_registro}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {producto.nombre_producto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {clases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {clases.map((clase, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {clase}
                            </span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {formatearFecha(producto.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-slate-400" />
                        {producto.usuario_nombre || 'Usuario'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/productos/dispositivos/editar/${producto.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                          title="Editar dispositivo"
                        >
                          <Pencil size={16} />
                        </Link>
                        {/* Si se desea eliminar, se puede agregar similar a clientes */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje sin resultados */}
        {productos.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Search size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay dispositivos</h3>
            <p className="text-slate-500 text-sm">Comienza creando un nuevo dispositivo médico.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DispositivosMedicos;
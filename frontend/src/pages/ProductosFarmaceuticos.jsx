import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ProductosFarmaceuticos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/productos/farmaceuticos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(res.data);
    } catch (error) {
      console.error('Error fetching productos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Productos Farmacéuticos</h1>
          <p className="text-text-secondary">Lista de productos farmacéuticos registrados</p>
        </div>
        <Link
          to="/productos/farmaceuticos/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Código Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Nombre del Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Fabricante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">PAVS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary">{producto.codigo_registro}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{producto.nombre_producto}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {producto.categoria1 && 'Categoría 1 '}
                  {producto.categoria2 && 'Categoría 2'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{producto.fabricante || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {producto.pavs ? 'Sí' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productos.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            No hay productos farmacéuticos registrados
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductosFarmaceuticos;

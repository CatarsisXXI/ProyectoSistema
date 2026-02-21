import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function OrdenesServicio() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdenes();
  }, []);

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

  const getTipoLabel = (tipo) => {
    const labels = {
      farmaceutico: 'Farmacéutico',
      dispositivo_medico: 'Dispositivo Médico',
      biologico: 'Producto Biológico'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Órdenes de Servicio</h1>
          <p className="text-text-secondary">Lista de órdenes de servicio</p>
        </div>
        <Link
          to="/ordenes/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          Nueva Orden
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">RUC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Registro Sanitario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">CPB N°</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ordenes.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{orden.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{getTipoLabel(orden.tipo_producto)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{orden.cliente_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{orden.cliente_ruc}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{orden.producto_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-secondary">{orden.producto_registro}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{orden.cpb_numero || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ordenes.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            No hay órdenes de servicio registradas
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdenesServicio;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

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

  const eliminarCliente = async (id) => {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
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

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
          <p className="text-text-secondary">Lista de clientes registrados</p>
        </div>
        <Link
          to="/clientes/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">RUC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Razón Social</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Representante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{cliente.codigo_cliente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{cliente.ruc}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{cliente.razon_social}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{cliente.representante_legal || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{cliente.email1 || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => eliminarCliente(cliente.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            No hay clientes registrados
          </div>
        )}
      </div>
    </div>
  );
}

export default Clientes;

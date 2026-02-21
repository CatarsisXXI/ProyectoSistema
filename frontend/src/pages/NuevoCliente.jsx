import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function NuevoCliente() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    representante_legal: '',
    email1: '',
    email2: '',
    email3: '',
    celular1: '',
    celular2: '',
    celular3: '',
    categoria: [],
    solicitud: [],
    otros_solicitud: ''
  });

  const opcionesCategoria = ['Droguería', 'Botica', 'Clínica', 'Hospital', 'Farmacia'];
  const opcionesSolicitud = ['Registros', 'Dirección Técnica', 'Almacenamiento BPA', 'Almacenamiento SIN BPA', 'Otros'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoriaChange = (opcion) => {
    setFormData(prev => ({
      ...prev,
      categoria: prev.categoria.includes(opcion)
        ? prev.categoria.filter(c => c !== opcion)
        : [...prev.categoria, opcion]
    }));
  };

  const handleSolicitudChange = (opcion) => {
    setFormData(prev => ({
      ...prev,
      solicitud: prev.solicitud.includes(opcion)
        ? prev.solicitud.filter(s => s !== opcion)
        : [...prev.solicitud, opcion]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/clientes', {
        ...formData,
        usuario_id: usuario.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/clientes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  const mostrarOtros = formData.solicitud.includes('Otros');

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Nuevo Cliente</h1>
        <p className="text-text-secondary">Registrar nuevo cliente en el sistema</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Datos del Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                RUC <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Ingrese RUC"
                maxLength={11}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Razón Social <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Razón social"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Representante Legal
              </label>
              <input
                type="text"
                name="representante_legal"
                value={formData.representante_legal}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Nombre del representante"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Contactos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Correo Electrónico 1
              </label>
              <input
                type="email"
                name="email1"
                value={formData.email1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Correo Electrónico 2
              </label>
              <input
                type="email"
                name="email2"
                value={formData.email2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Correo Electrónico 3
              </label>
              <input
                type="email"
                name="email3"
                value={formData.email3}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Celular 1
              </label>
              <input
                type="text"
                name="celular1"
                value={formData.celular1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="999999999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Celular 2
              </label>
              <input
                type="text"
                name="celular2"
                value={formData.celular2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="999999999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Celular 3
              </label>
              <input
                type="text"
                name="celular3"
                value={formData.celular3}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="999999999"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Categoría</h2>
          <div className="flex flex-wrap gap-4">
            {opcionesCategoria.map(opcion => (
              <label key={opcion} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categoria.includes(opcion)}
                  onChange={() => handleCategoriaChange(opcion)}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">{opcion}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Solicitud</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {opcionesSolicitud.map(opcion => (
              <label key={opcion} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.solicitud.includes(opcion)}
                  onChange={() => handleSolicitudChange(opcion)}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">{opcion}</span>
              </label>
            ))}
          </div>
          {mostrarOtros && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Especificar Otros
              </label>
              <input
                type="text"
                name="otros_solicitud"
                value={formData.otros_solicitud}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Especifique"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="border border-gray-300 text-text-primary px-6 py-2 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoCliente;

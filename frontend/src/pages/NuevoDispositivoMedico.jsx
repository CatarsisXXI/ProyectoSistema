import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function NuevoDispositivoMedico() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codigoRegistro, setCodigoRegistro] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_producto: '',
    clase1: false,
    clase2: false,
    clase3: false,
    clase4: false
  });

  useEffect(() => {
    fetchSiguienteCodigo();
  }, []);

  const fetchSiguienteCodigo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/productos/dispositivos/siguiente-codigo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCodigoRegistro(res.data.codigo);
    } catch (error) {
      console.error('Error fetching código:', error);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : e.target.value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/productos/dispositivos', {
        ...formData,
        codigo_registro: codigoRegistro,
        usuario_id: usuario.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/productos/dispositivos');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const fechaActual = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Nuevo Dispositivo Médico</h1>
        <p className="text-text-secondary">Registrar nuevo dispositivo médico en el sistema</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Datos del Dispositivo Médico</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Fecha de Registro
              </label>
              <input
                type="text"
                value={fechaActual}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-text-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={usuario?.nombre_completo || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-text-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Registro Sanitario
              </label>
              <input
                type="text"
                value={codigoRegistro}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-text-secondary font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nombre del Producto <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="nombre_producto"
                value={formData.nombre_producto}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Nombre del dispositivo"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Clase
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="clase1"
                  checked={formData.clase1}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Clase 1</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="clase2"
                  checked={formData.clase2}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Clase 2</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="clase3"
                  checked={formData.clase3}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Clase 3</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="clase4"
                  checked={formData.clase4}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Clase 4</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Dispositivo'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/productos/dispositivos')}
              className="border border-gray-300 text-text-primary px-6 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NuevoDispositivoMedico;

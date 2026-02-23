import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function NuevoProductoBiologico() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codigoRegistro, setCodigoRegistro] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_producto: '',
    vacunas_inmunologicos: false,
    otros_biologicos: false,
    bioequivalente: false,
    biotecnologico: false,
    fabricante: '',
    pais_origen: '',
    pavs: null
  });

  useEffect(() => {
    fetchSiguienteCodigo();
  }, []);

  const fetchSiguienteCodigo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/productos/biologicos/siguiente-codigo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCodigoRegistro(res.data.codigo);
    } catch (error) {
      console.error('Error fetching código:', error);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let newValue = value;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'radio' && name === 'pavs') {
      newValue = value === 'true';
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/productos/biologicos', {
        ...formData,
        codigo_registro: codigoRegistro,
        usuario_id: usuario.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/productos/biologicos');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear producto biológico');
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
        <h1 className="text-2xl font-bold text-text-primary">Nuevo Producto Biológico</h1>
        <p className="text-text-secondary">Registrar nuevo producto biológico en el sistema</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Datos del Producto Biológico</h2>
          
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
                placeholder="Nombre del producto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Fabricante
              </label>
              <input
                type="text"
                name="fabricante"
                value={formData.fabricante}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Nombre del fabricante"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                País de Origen
              </label>
              <input
                type="text"
                name="pais_origen"
                value={formData.pais_origen}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="País de origen"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Tipo de Producto
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="vacunas_inmunologicos"
                  checked={formData.vacunas_inmunologicos}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Vacunas e Inmunológicos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="otros_biologicos"
                  checked={formData.otros_biologicos}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Otros Biológicos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="bioequivalente"
                  checked={formData.bioequivalente}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Bioequivalente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="biotecnologico"
                  checked={formData.biotecnologico}
                  onChange={handleChange}
                  className="custom-checkbox"
                />
                <span className="text-sm text-text-primary">Biotecnológico</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              PAVS
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pavs"
                  value="true"
                  checked={formData.pavs === true}
                  onChange={handleChange}
                  className="custom-radio"
                />
                <span className="text-sm text-text-primary">Sí</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pavs"
                  value="false"
                  checked={formData.pavs === false}
                  onChange={handleChange}
                  className="custom-radio"
                />
                <span className="text-sm text-text-primary">No</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/productos/biologicos')}
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

export default NuevoProductoBiologico;

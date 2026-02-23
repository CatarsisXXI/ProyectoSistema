import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SelectPais from '../components/SelectPais';
import { Save, ArrowLeft, Package, Calendar, User, AlertCircle } from 'lucide-react';

function NuevoProductoBiologico() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_producto: '',
    codigo_registro: '',
    vacunas_inmunologicos: false,
    otros_biologicos: false,
    bioequivalente: false,
    biotecnologico: false,
    fabricante: '',
    pais_origen: '',
    pavs: null
  });

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

  const handlePaisChange = (value) => {
    setFormData(prev => ({ ...prev, pais_origen: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/productos/biologicos', {
        ...formData,
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
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {/* Encabezado con botón de volver */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/productos/biologicos')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nuevo Producto Biológico</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registra un nuevo producto biológico en el sistema
          </p>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Package size={18} className="text-blue-500" />
            Datos del Producto Biológico
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha de Registro */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha de Registro
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fechaActual}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={usuario?.nombre_completo || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Registro Sanitario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registro Sanitario <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="codigo_registro"
                value={formData.codigo_registro}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                placeholder="Ej: PRB-2024-0001"
              />
            </div>

            {/* Nombre del Producto */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Producto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nombre_producto"
                value={formData.nombre_producto}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Nombre del producto"
              />
            </div>

            {/* Fabricante */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fabricante
              </label>
              <input
                type="text"
                name="fabricante"
                value={formData.fabricante}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Nombre del fabricante"
              />
            </div>

            {/* País de Origen con autocompletado */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                País de Origen
              </label>
              <SelectPais
                value={formData.pais_origen}
                onChange={handlePaisChange}
                placeholder="Seleccione o escriba un país..."
                className="w-full"
              />
            </div>
          </div>

          {/* Tipo de Producto (checkboxes) */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Producto
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="vacunas_inmunologicos"
                  checked={formData.vacunas_inmunologicos}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                Vacunas e Inmunológicos
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="otros_biologicos"
                  checked={formData.otros_biologicos}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                Otros Biológicos
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="bioequivalente"
                  checked={formData.bioequivalente}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                Bioequivalente
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="biotecnologico"
                  checked={formData.biotecnologico}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                Biotecnológico
              </label>
            </div>
          </div>

          {/* PAVS (radio) */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              PAVS
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="pavs"
                  value="true"
                  checked={formData.pavs === true}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                Sí
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="pavs"
                  value="false"
                  checked={formData.pavs === false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                No
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/productos/biologicos')}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NuevoProductoBiologico;
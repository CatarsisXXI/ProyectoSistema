import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Save, ArrowLeft, Phone, Mail, FileText, AlertCircle, Calendar, User } from 'lucide-react';

// Opciones definidas en el backend
const CATEGORIAS = ['Drogueria', 'Botica', 'Clinica', 'Hospital', 'Farmacia'];
const SOLICITUDES = ['Registros', 'Direccion Técnica', 'Almacenamiento BPA', 'Almacenamiento sin BPA', 'Otros'];

function NuevoCliente() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fecha actual formateada
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

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
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Encabezado con botón de volver */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/clientes')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nuevo Cliente</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registra un nuevo cliente en el sistema
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
        {/* Datos del Cliente */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <FileText size={18} className="text-blue-500" />
            Datos del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                RUC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                required
                maxLength={11}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="12345678901"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Razón Social <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Nombre de la empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Representante Legal
              </label>
              <input
                type="text"
                name="representante_legal"
                value={formData.representante_legal}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Nombre completo"
              />
            </div>
          </div>
        </div>

        {/* Contactos */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Phone size={18} className="text-blue-500" />
            Contactos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={`email${i}`}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo Electrónico {i}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name={`email${i}`}
                    value={formData[`email${i}`]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder={`correo${i}@empresa.com`}
                  />
                </div>
              </div>
            ))}
            {[1, 2, 3].map(i => (
              <div key={`celular${i}`}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Celular {i}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name={`celular${i}`}
                    value={formData[`celular${i}`]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorías (múltiple) */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <FileText size={18} className="text-blue-500" />
            Categorías
          </h2>
          <div className="flex flex-wrap gap-4">
            {CATEGORIAS.map(opcion => (
              <label key={opcion} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categoria.includes(opcion)}
                  onChange={() => handleCategoriaChange(opcion)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>

        {/* Solicitudes (múltiple) */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <FileText size={18} className="text-blue-500" />
            Solicitudes / Documentación
          </h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {SOLICITUDES.map(opcion => (
              <label key={opcion} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.solicitud.includes(opcion)}
                  onChange={() => handleSolicitudChange(opcion)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                {opcion}
              </label>
            ))}
          </div>
          {mostrarOtros && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Especificar otros
              </label>
              <input
                type="text"
                name="otros_solicitud"
                value={formData.otros_solicitud}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Describa la solicitud"
              />
            </div>
          )}
        </div>

        {/* Información adicional (fecha y usuario) */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Calendar size={18} className="text-blue-500" />
            Información del Registro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha de registro (autocompletada) */}
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
            {/* Usuario que registra */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registrado por
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={usuario?.nombre_completo || usuario?.username || 'Usuario'}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
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
                Guardar Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoCliente;
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, Phone, Mail, FileText } from 'lucide-react';

// Opciones definidas en el backend
const CATEGORIAS = ['drogueria', 'botica', 'clinica', 'hospital', 'farmacia'];
const SOLICITUDES = ['registros', 'direccion tecnica', 'almacenamiento BPA', 'almacenamiento sin BPA', 'otros'];

function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

  // Determina si se debe mostrar el campo de texto para 'otros'
  const mostrarOtros = formData.solicitud.includes('otros');

  useEffect(() => {
    fetchCliente();
  }, [id]);

  const fetchCliente = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      // 🔧 CORRECCIÓN: Parseo seguro de categoría
      let categoriaArray = [];
      if (data.categoria) {
        try {
          const parsed = JSON.parse(data.categoria);
          categoriaArray = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          categoriaArray = [];
        }
      }

      // 🔧 CORRECCIÓN: Parseo seguro de solicitud
      let solicitudArray = [];
      if (data.solicitud) {
        try {
          const parsed = JSON.parse(data.solicitud);
          solicitudArray = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          solicitudArray = [];
        }
      }

      setFormData({
        ruc: data.ruc || '',
        razon_social: data.razon_social || '',
        representante_legal: data.representante_legal || '',
        email1: data.email1 || '',
        email2: data.email2 || '',
        email3: data.email3 || '',
        celular1: data.celular1 || '',
        celular2: data.celular2 || '',
        celular3: data.celular3 || '',
        categoria: categoriaArray,
        solicitud: solicitudArray,
        otros_solicitud: data.otros_solicitud || ''
      });
    } catch (err) {
      setError('Error al cargar los datos del cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoriaChange = (cat) => {
    setFormData(prev => ({
      ...prev,
      categoria: prev.categoria.includes(cat)
        ? prev.categoria.filter(item => item !== cat)
        : [...prev.categoria, cat]
    }));
  };

  const handleSolicitudChange = (sol) => {
    const newSolicitud = formData.solicitud.includes(sol)
      ? formData.solicitud.filter(item => item !== sol)
      : [...formData.solicitud, sol];

    setFormData(prev => ({
      ...prev,
      solicitud: newSolicitud,
      // Si se desmarca 'otros', limpiamos el campo
      otros_solicitud: (sol === 'otros' && prev.solicitud.includes(sol)) ? '' : prev.otros_solicitud
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Convertir arrays a JSON string para el backend
    const payload = {
      ...formData,
      categoria: JSON.stringify(formData.categoria),
      solicitud: JSON.stringify(formData.solicitud)
    };

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/clientes/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cliente actualizado correctamente');
      setTimeout(() => {
        navigate('/clientes');
      }, 1500);
    } catch (err) {
      setError('Error al actualizar el cliente. Verifica los datos.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/clientes"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Editar Cliente</h1>
          <p className="text-slate-500 text-sm mt-1">
            Modifica los datos del cliente
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          {success} Redirigiendo...
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Columna izquierda: Información general */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileText size={18} className="text-blue-500" />
              Información general
            </h3>
            
            {/* RUC */}
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="12345678901"
              />
            </div>

            {/* Razón Social */}
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

            {/* Representante Legal */}
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

            {/* Categorías */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categorías
              </label>
              <div className="space-y-2">
                {CATEGORIAS.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.categoria.includes(cat)}
                      onChange={() => handleCategoriaChange(cat)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha: Contacto */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Phone size={18} className="text-blue-500" />
              Contacto
            </h3>

            {/* Email 1 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Principal
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email1"
                  value={formData.email1}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>

            {/* Email 2 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Secundario
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email2"
                  value={formData.email2}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="otro@correo.com"
                />
              </div>
            </div>

            {/* Email 3 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Adicional
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email3"
                  value={formData.email3}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="adicional@correo.com"
                />
              </div>
            </div>

            {/* Celular 1 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Celular Principal
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="celular1"
                  value={formData.celular1}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>

            {/* Celular 2 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Celular Secundario
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="celular2"
                  value={formData.celular2}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="+51 988 888 888"
                />
              </div>
            </div>

            {/* Celular 3 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Celular Adicional
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="celular3"
                  value={formData.celular3}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="+51 977 777 777"
                />
              </div>
            </div>
          </div>

          {/* Fila completa para solicitudes */}
          <div className="md:col-span-2 space-y-5">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileText size={18} className="text-blue-500" />
              Solicitudes / Documentación
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de solicitud
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SOLICITUDES.map(sol => (
                  <label key={sol} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.solicitud.includes(sol)}
                      onChange={() => handleSolicitudChange(sol)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    {sol}
                  </label>
                ))}
              </div>
            </div>

            {/* Campo de texto para 'otros' (solo visible si está seleccionado) */}
            {mostrarOtros && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Especificar otros
                </label>
                <textarea
                  name="otros_solicitud"
                  rows="3"
                  value={formData.otros_solicitud}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
                  placeholder="Describa aquí la solicitud específica"
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-200">
          <Link
            to="/clientes"
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarCliente;
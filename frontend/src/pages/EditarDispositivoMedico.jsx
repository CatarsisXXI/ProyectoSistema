import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, Package, Calendar, User } from 'lucide-react';

function EditarDispositivoMedico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    codigo_registro: '',
    nombre_producto: '',
    clase1: false,
    clase2: false,
    clase3: false,
    clase4: false
  });

  const [metadata, setMetadata] = useState({
    created_at: '',
    usuario_nombre: ''
  });

  useEffect(() => {
    fetchDispositivo();
  }, [id]);

  const fetchDispositivo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/productos/dispositivos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      setMetadata({
        created_at: data.created_at,
        usuario_nombre: data.usuario_nombre || 'Usuario'
      });

      setFormData({
        codigo_registro: data.codigo_registro || '',
        nombre_producto: data.nombre_producto || '',
        clase1: Boolean(data.clase1),
        clase2: Boolean(data.clase2),
        clase3: Boolean(data.clase3),
        clase4: Boolean(data.clase4)
      });
    } catch (err) {
      setError('Error al cargar los datos del dispositivo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/productos/dispositivos/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Dispositivo actualizado correctamente');
      setTimeout(() => {
        navigate('/productos/dispositivos');
      }, 1500);
    } catch (err) {
      setError('Error al actualizar el dispositivo. Verifica los datos.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
          <p className="text-slate-500 font-medium">Cargando datos del dispositivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/productos/dispositivos"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Editar Dispositivo Médico</h1>
          <p className="text-slate-500 text-sm mt-1">
            Modifica los datos del dispositivo
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          {success} Redirigiendo...
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Package size={18} className="text-blue-500" />
            Datos del Dispositivo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código de Registro (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Código de Registro
              </label>
              <input
                type="text"
                name="codigo_registro"
                value={formData.codigo_registro}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
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
                placeholder="Nombre del dispositivo"
              />
            </div>
          </div>

          {/* Clases (checkboxes) */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Clase
            </label>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map(num => (
                <label key={num} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name={`clase${num}`}
                    checked={formData[`clase${num}`]}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  Clase {num}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Información de registro (solo lectura) */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Calendar size={18} className="text-blue-500" />
            Información del Registro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha de Registro
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formatearFecha(metadata.created_at)}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registrado por
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={metadata.usuario_nombre}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/productos/dispositivos"
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

export default EditarDispositivoMedico;
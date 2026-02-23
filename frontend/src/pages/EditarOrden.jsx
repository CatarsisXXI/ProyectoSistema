import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Save, ArrowLeft, Loader2, Calendar, User, AlertCircle, Package } from 'lucide-react';

function EditarOrden() {
  const { id } = useParams();
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tipoProducto, setTipoProducto] = useState('farmaceutico');
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busquedaRUC, setBusquedaRUC] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [mostrarClientesDropdown, setMostrarClientesDropdown] = useState(false);
  const [mostrarProductosDropdown, setMostrarProductosDropdown] = useState(false);

  const [formData, setFormData] = useState({
    cliente_id: '',
    producto_id: '',
    // Farmacéutico
    categoria1: false,
    categoria2: false,
    cambio_mayor: false,
    cambio_mayor_autorizado: '',
    cambio_menor: false,
    cambio_menor_autorizado: '',
    inscripcion: false,
    inscripcion_autorizado: '',
    renovacion: false,
    renovacion_autorizado: '',
    traduccion: false,
    traduccion_autorizado: '',
    // Dispositivos
    clase1: false,
    clase1_autorizado: '',
    clase2: false,
    clase2_autorizado: '',
    clase3: false,
    clase3_autorizado: '',
    clase4: false,
    clase4_autorizado: '',
    // Biológicos
    vaccines_immunologicos: false,
    vaccines_immunologicos_autorizado: '',
    otros_biologicos_chk: false,
    otros_biologicos_autorizado: '',
    bioequivalente_chk: false,
    bioequivalente_autorizado: '',
    biotecnologico_chk: false,
    biotecnologico_autorizado: '',
    // Comunes
    cpb_numero: '',
    monto: '',
    fecha_recepcion: '',
    fecha_ingreso_vuce: '',
    fecha_fin_proceso: '',
    observaciones: ''
  });

  const [metadata, setMetadata] = useState({
    created_at: '',
    usuario_nombre: ''
  });

  // Función para formatear fecha ISO a YYYY-MM-DD para input date
  const formatearFechaInput = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return '';
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchClientes();
    fetchOrden();
  }, [id]);

  const fetchOrden = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/ordenes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      setTipoProducto(data.tipo_producto);
      setClienteSeleccionado({
        id: data.cliente_id,
        razon_social: data.cliente_nombre,
        ruc: data.cliente_ruc
      });
      setBusquedaRUC(data.cliente_ruc);

      setProductoSeleccionado({
        id: data.producto_id,
        nombre_producto: data.producto_nombre,
        codigo_registro: data.producto_registro
      });
      setBusquedaProducto(data.producto_nombre);

      setMetadata({
        created_at: data.created_at,
        usuario_nombre: data.usuario_nombre || 'Usuario'
      });

      setFormData({
        cliente_id: data.cliente_id,
        producto_id: data.producto_id,
        // Farmacéutico
        categoria1: Boolean(data.categoria1),
        categoria2: Boolean(data.categoria2),
        cambio_mayor: Boolean(data.cambio_mayor),
        cambio_mayor_autorizado: data.cambio_mayor_autorizado || '',
        cambio_menor: Boolean(data.cambio_menor),
        cambio_menor_autorizado: data.cambio_menor_autorizado || '',
        inscripcion: Boolean(data.inscripcion),
        inscripcion_autorizado: data.inscripcion_autorizado || '',
        renovacion: Boolean(data.renovacion),
        renovacion_autorizado: data.renovacion_autorizado || '',
        traduccion: Boolean(data.traduccion),
        traduccion_autorizado: data.traduccion_autorizado || '',
        // Dispositivos
        clase1: Boolean(data.clase1),
        clase1_autorizado: data.clase1_autorizado || '',
        clase2: Boolean(data.clase2),
        clase2_autorizado: data.clase2_autorizado || '',
        clase3: Boolean(data.clase3),
        clase3_autorizado: data.clase3_autorizado || '',
        clase4: Boolean(data.clase4),
        clase4_autorizado: data.clase4_autorizado || '',
        // Biológicos
        vaccines_immunologicos: Boolean(data.vaccines_immunologicos),
        vaccines_immunologicos_autorizado: data.vaccines_immunologicos_autorizado || '',
        otros_biologicos_chk: Boolean(data.otros_biologicos_chk),
        otros_biologicos_autorizado: data.otros_biologicos_autorizado || '',
        bioequivalente_chk: Boolean(data.bioequivalente_chk),
        bioequivalente_autorizado: data.bioequivalente_autorizado || '',
        biotecnologico_chk: Boolean(data.biotecnologico_chk),
        biotecnologico_autorizado: data.biotecnologico_autorizado || '',
        // Comunes
        cpb_numero: data.cpb_numero || '',
        monto: data.monto || '',
        fecha_recepcion: formatearFechaInput(data.fecha_recepcion),
        fecha_ingreso_vuce: formatearFechaInput(data.fecha_ingreso_vuce),
        fecha_fin_proceso: formatearFechaInput(data.fecha_fin_proceso),
        observaciones: data.observaciones || ''
      });
    } catch (err) {
      setError('Error al cargar los datos de la orden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/clientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      setClientes([]);
    }
  };

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      if (tipoProducto === 'farmaceutico') endpoint = '/api/productos/farmaceuticos';
      else if (tipoProducto === 'dispositivo_medico') endpoint = '/api/productos/dispositivos';
      else endpoint = '/api/productos/biologicos';
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching productos:', error);
      setProductos([]);
    }
  };

  useEffect(() => {
    if (tipoProducto) {
      fetchProductos();
    }
  }, [tipoProducto]);

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(prev => ({ ...prev, cliente_id: cliente.id }));
    setBusquedaRUC(cliente.ruc);
    setMostrarClientesDropdown(false);
  };

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setFormData(prev => ({ ...prev, producto_id: producto.id }));
    setBusquedaProducto(producto.nombre_producto);
    setMostrarProductosDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleTipoProductoChange = (e) => {
    setTipoProducto(e.target.value);
    setProductoSeleccionado(null);
    setFormData(prev => ({ ...prev, producto_id: '' }));
    setBusquedaProducto('');
    setMostrarProductosDropdown(false);
  };

  const filteredClientes = clientes.filter(c =>
    c.ruc.toLowerCase().includes(busquedaRUC.toLowerCase()) ||
    c.razon_social.toLowerCase().includes(busquedaRUC.toLowerCase())
  );

  const filteredProductos = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/ordenes/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Orden actualizada correctamente');
      setTimeout(() => {
        navigate('/ordenes');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar orden');
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
          <p className="text-slate-500 font-medium">Cargando datos de la orden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/ordenes"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Editar Orden de Servicio</h1>
          <p className="text-slate-500 text-sm mt-1">Modifica los datos de la orden</p>
        </div>
      </div>

      {/* Información de registro (solo lectura) */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Registro</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Registrado por</label>
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

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          {success} Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Generales */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Package size={18} className="text-blue-500" />
            Datos Generales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de Producto
              </label>
              <select
                value={tipoProducto}
                onChange={handleTipoProductoChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="farmaceutico">Farmacéutico</option>
                <option value="dispositivo_medico">Dispositivo Médico</option>
                <option value="biologico">Producto Biológico</option>
              </select>
            </div>
          </div>

          {/* Buscar Cliente por RUC */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar Cliente por RUC
              </label>
              <input
                type="text"
                value={busquedaRUC}
                onChange={(e) => {
                  setBusquedaRUC(e.target.value);
                  setMostrarClientesDropdown(true);
                }}
                onFocus={() => busquedaRUC && setMostrarClientesDropdown(true)}
                placeholder="Ingrese RUC o nombre"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {mostrarClientesDropdown && busquedaRUC && filteredClientes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                  {filteredClientes.map(cliente => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => seleccionarCliente(cliente)}
                      className="w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-100 last:border-b-0 transition-all duration-150"
                    >
                      <div className="font-medium text-slate-700">{cliente.razon_social}</div>
                      <div className="text-sm text-blue-600 font-semibold">{cliente.ruc}</div>
                      <div className="text-xs text-slate-500 mt-1">Dirección: {cliente.direccion || 'No especificada'}</div>
                    </button>
                  ))}
                </div>
              )}
              {mostrarClientesDropdown && busquedaRUC && filteredClientes.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500 z-20 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="font-medium">No se encontraron clientes</p>
                  <p className="text-xs mt-1">Intenta con otro RUC o nombre</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <input
                type="text"
                value={clienteSeleccionado?.razon_social || ''}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUC</label>
              <input
                type="text"
                value={clienteSeleccionado?.ruc || ''}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Buscar Producto por Nombre */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar Producto
              </label>
              <input
                type="text"
                value={busquedaProducto}
                onChange={(e) => {
                  setBusquedaProducto(e.target.value);
                  setMostrarProductosDropdown(true);
                }}
                onFocus={() => busquedaProducto && setMostrarProductosDropdown(true)}
                placeholder="Nombre del producto"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {mostrarProductosDropdown && busquedaProducto && filteredProductos.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                  {filteredProductos.map(producto => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => seleccionarProducto(producto)}
                      className="w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-100 last:border-b-0 transition-all duration-150"
                    >
                      <div className="font-medium text-slate-700">{producto.nombre_producto}</div>
                      <div className="text-sm text-blue-600 font-semibold">Reg: {producto.codigo_registro}</div>
                    </button>
                  ))}
                </div>
              )}
              {mostrarProductosDropdown && busquedaProducto && filteredProductos.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500 z-20 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="font-medium">No se encontraron productos</p>
                  <p className="text-xs mt-1">Intenta con otro nombre</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
              <input
                type="text"
                value={productoSeleccionado?.nombre_producto || ''}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registro Sanitario</label>
              <input
                type="text"
                value={productoSeleccionado?.codigo_registro || ''}
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Servicios según tipo */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Package size={18} className="text-blue-500" />
            Servicios
          </h2>

          {/* Farmacéutico */}
          {tipoProducto === 'farmaceutico' && (
            <>
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Categoría</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categoria1"
                      checked={formData.categoria1}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    Categoría 1
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categoria2"
                      checked={formData.categoria2}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    Categoría 2
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['cambio_mayor', 'cambio_menor', 'inscripcion', 'renovacion', 'traduccion'].map(item => (
                  <div key={item}>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        name={item}
                        checked={formData[item]}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      {item === 'cambio_mayor' ? 'Cambio Mayor' :
                       item === 'cambio_menor' ? 'Cambio Menor' :
                       item === 'inscripcion' ? 'Inscripción' :
                       item === 'renovacion' ? 'Renovación' : 'Traducción'}
                    </label>
                    {formData[item] && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Autorizado por <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name={`${item}_autorizado`}
                          value={formData[`${item}_autorizado`]}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Dispositivo Médico */}
          {tipoProducto === 'dispositivo_medico' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(num => (
                <div key={num}>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      name={`clase${num}`}
                      checked={formData[`clase${num}`]}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    Clase {num}
                  </label>
                  {formData[`clase${num}`] && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Autorizado por <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name={`clase${num}_autorizado`}
                        value={formData[`clase${num}_autorizado`]}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  )}
                </div>
              ))}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="traduccion"
                    checked={formData.traduccion}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  Traducción
                </label>
                {formData.traduccion && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Autorizado por <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="traduccion_autorizado"
                      value={formData.traduccion_autorizado}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Producto Biológico */}
          {tipoProducto === 'biologico' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'vaccines_immunologicos', label: 'Vacunas e Inmunológicos' },
                { name: 'otros_biologicos_chk', label: 'Otros Biológicos' },
                { name: 'bioequivalente_chk', label: 'Bioequivalente' },
                { name: 'biotecnologico_chk', label: 'Biotecnológico' }
              ].map(item => (
                <div key={item.name}>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={formData[item.name]}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    {item.label}
                  </label>
                  {formData[item.name] && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Autorizado por <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name={`${item.name}_autorizado`}
                        value={formData[`${item.name}_autorizado`]}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  )}
                </div>
              ))}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="traduccion"
                    checked={formData.traduccion}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  Traducción
                </label>
                {formData.traduccion && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Autorizado por <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="traduccion_autorizado"
                      value={formData.traduccion_autorizado}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fechas, CPB, Monto y Observaciones */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Calendar size={18} className="text-blue-500" />
            Fechas y Observaciones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPB N°</label>
              <input
                type="text"
                name="cpb_numero"
                value={formData.cpb_numero}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto S/.</label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Recepción</label>
              <input
                type="date"
                name="fecha_recepcion"
                value={formData.fecha_recepcion}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Ingreso a VUCE</label>
              <input
                type="date"
                name="fecha_ingreso_vuce"
                value={formData.fecha_ingreso_vuce}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin de Proceso</label>
              <input
                type="date"
                name="fecha_fin_proceso"
                value={formData.fecha_fin_proceso}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/ordenes"
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.cliente_id || !formData.producto_id}
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

export default EditarOrden;
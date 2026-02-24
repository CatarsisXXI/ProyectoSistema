import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Save, ArrowLeft, Calendar, User, AlertCircle, Package, Trash2, Plus } from 'lucide-react';

function NuevaOrden() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipoProductoBusqueda, setTipoProductoBusqueda] = useState('farmaceutico');

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busquedaRUC, setBusquedaRUC] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarClientesDropdown, setMostrarClientesDropdown] = useState(false);

  // Estados para búsqueda temporal de producto antes de agregar
  const [busquedaProductoTemp, setBusquedaProductoTemp] = useState('');
  const [productoTempSeleccionado, setProductoTempSeleccionado] = useState(null);
  const [mostrarProductosDropdownTemp, setMostrarProductosDropdownTemp] = useState(false);

  // Lista de productos agregados a la orden
  const [productosAgregados, setProductosAgregados] = useState([]);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (tipoProductoBusqueda) {
      fetchProductos();
    }
  }, [tipoProductoBusqueda]);

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
      if (tipoProductoBusqueda === 'farmaceutico') endpoint = '/api/productos/farmaceuticos';
      else if (tipoProductoBusqueda === 'dispositivo_medico') endpoint = '/api/productos/dispositivos';
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

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaRUC(cliente.ruc);
    setMostrarClientesDropdown(false);
  };

  // Funciones para el producto temporal
  const seleccionarProductoTemp = (producto) => {
    setProductoTempSeleccionado(producto);
    setBusquedaProductoTemp(producto.nombre_producto);
    setMostrarProductosDropdownTemp(false);
  };

  // Inicializa los servicios según el tipo de producto, incluyendo los campos comunes
  const inicializarServiciosPorTipo = (tipo) => {
    const baseComun = {
      fecha_recepcion: '',
      fecha_ingreso_vuce: '',
      fecha_fin_proceso: '',
      observaciones: ''
    };

    if (tipo === 'farmaceutico' || tipo === 'dispositivo_medico') {
      return {
        ...baseComun,
        cpb_numero: '',
        monto: '',
        traduccion: false,
        traduccion_autorizado: '',
        ...(tipo === 'farmaceutico' ? {
          categoria1: false,
          categoria2: false,
          cambio_mayor: false,
          cambio_mayor_autorizado: '',
          cambio_menor: false,
          cambio_menor_autorizado: '',
          inscripcion: false,
          inscripcion_autorizado: '',
          renovacion: false,
          renovacion_autorizado: ''
        } : {
          clase1: false,
          clase1_autorizado: '',
          clase2: false,
          clase2_autorizado: '',
          clase3: false,
          clase3_autorizado: '',
          clase4: false,
          clase4_autorizado: ''
        })
      };
    } else if (tipo === 'biologico') {
      return {
        ...baseComun,
        traduccion: false,
        traduccion_autorizado: '',
        vaccines_immunologicos: false,
        vaccines_immunologicos_autorizado: '',
        otros_biologicos_chk: false,
        otros_biologicos_autorizado: '',
        bioequivalente_chk: false,
        bioequivalente_autorizado: '',
        biotecnologico_chk: false,
        biotecnologico_autorizado: ''
      };
    }
    return {};
  };

  // Agrega el producto temporal a la lista con sus servicios inicializados
  const agregarProducto = () => {
    if (!productoTempSeleccionado) return;

    const tipo = tipoProductoBusqueda;
    const nuevoProducto = {
      producto: productoTempSeleccionado,
      tipo: tipo,
      servicios: inicializarServiciosPorTipo(tipo)
    };

    setProductosAgregados([...productosAgregados, nuevoProducto]);
    setProductoTempSeleccionado(null);
    setBusquedaProductoTemp('');
  };

  // Maneja cambios en los servicios de un producto específico
  const handleServicioChange = (index, field, value) => {
    const nuevosProductos = [...productosAgregados];
    nuevosProductos[index].servicios[field] = value;
    setProductosAgregados(nuevosProductos);
  };

  // Elimina un producto de la lista
  const eliminarProducto = (index) => {
    const nuevosProductos = productosAgregados.filter((_, i) => i !== index);
    setProductosAgregados(nuevosProductos);
  };

  const filteredClientes = clientes.filter(c =>
    c.ruc.toLowerCase().includes(busquedaRUC.toLowerCase()) ||
    c.razon_social.toLowerCase().includes(busquedaRUC.toLowerCase())
  );

  const filteredProductosTemp = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(busquedaProductoTemp.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!clienteSeleccionado || productosAgregados.length === 0) {
      setError('Debe seleccionar un cliente y al menos un producto');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        cliente_id: clienteSeleccionado.id,
        productos: productosAgregados.map(item => ({
          producto_id: item.producto.id,
          tipo_producto: item.tipo,
          ...item.servicios
        }))
      };

      await axios.post('/api/ordenes', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/ordenes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear orden');
    } finally {
      setLoading(false);
    }
  };

  const fechaActual = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Renderiza los campos específicos de servicios según el tipo
  const renderServiciosEspecificos = (producto, index) => {
    const { tipo, servicios } = producto;

    if (tipo === 'farmaceutico') {
      return (
        <>
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Categoría</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={servicios.categoria1}
                  onChange={(e) => handleServicioChange(index, 'categoria1', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                Categoría 1
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={servicios.categoria2}
                  onChange={(e) => handleServicioChange(index, 'categoria2', e.target.checked)}
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
                    checked={servicios[item]}
                    onChange={(e) => handleServicioChange(index, item, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  {item === 'cambio_mayor' ? 'Cambio Mayor' :
                    item === 'cambio_menor' ? 'Cambio Menor' :
                    item === 'inscripcion' ? 'Inscripción' :
                    item === 'renovacion' ? 'Renovación' : 'Traducción'}
                </label>
                {servicios[item] && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Autorizado por <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={servicios[`${item}_autorizado`] || ''}
                      onChange={(e) => handleServicioChange(index, `${item}_autorizado`, e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      );
    }

    if (tipo === 'dispositivo_medico') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(num => (
            <div key={num}>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={servicios[`clase${num}`]}
                  onChange={(e) => handleServicioChange(index, `clase${num}`, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                Clase {num}
              </label>
              {servicios[`clase${num}`] && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Autorizado por <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={servicios[`clase${num}_autorizado`] || ''}
                    onChange={(e) => handleServicioChange(index, `clase${num}_autorizado`, e.target.value)}
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
                checked={servicios.traduccion}
                onChange={(e) => handleServicioChange(index, 'traduccion', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              Traducción
            </label>
            {servicios.traduccion && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Autorizado por <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={servicios.traduccion_autorizado || ''}
                  onChange={(e) => handleServicioChange(index, 'traduccion_autorizado', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (tipo === 'biologico') {
      return (
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
                  checked={servicios[item.name]}
                  onChange={(e) => handleServicioChange(index, item.name, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                {item.label}
              </label>
              {servicios[item.name] && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Autorizado por <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={servicios[`${item.name}_autorizado`] || ''}
                    onChange={(e) => handleServicioChange(index, `${item.name}_autorizado`, e.target.value)}
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
                checked={servicios.traduccion}
                onChange={(e) => handleServicioChange(index, 'traduccion', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              Traducción
            </label>
            {servicios.traduccion && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Autorizado por <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={servicios.traduccion_autorizado || ''}
                  onChange={(e) => handleServicioChange(index, 'traduccion_autorizado', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Renderiza los campos comunes (fechas, CPB, monto, observaciones) según el tipo
  const renderCamposComunes = (producto, index) => {
    const { tipo, servicios } = producto;

    return (
      <div className="mt-6 border-t border-slate-200 pt-6">
        <h4 className="text-md font-medium text-slate-700 mb-4">Detalles de la orden para este producto</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(tipo === 'farmaceutico' || tipo === 'dispositivo_medico') && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPB N°</label>
                <input
                  type="text"
                  value={servicios.cpb_numero || ''}
                  onChange={(e) => handleServicioChange(index, 'cpb_numero', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto S/.</label>
                <input
                  type="number"
                  value={servicios.monto || ''}
                  onChange={(e) => handleServicioChange(index, 'monto', e.target.value)}
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Recepción</label>
            <input
              type="date"
              value={servicios.fecha_recepcion || ''}
              onChange={(e) => handleServicioChange(index, 'fecha_recepcion', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Ingreso a VUCE</label>
            <input
              type="date"
              value={servicios.fecha_ingreso_vuce || ''}
              onChange={(e) => handleServicioChange(index, 'fecha_ingreso_vuce', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin de Proceso</label>
            <input
              type="date"
              value={servicios.fecha_fin_proceso || ''}
              onChange={(e) => handleServicioChange(index, 'fecha_fin_proceso', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
          <textarea
            value={servicios.observaciones || ''}
            onChange={(e) => handleServicioChange(index, 'observaciones', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/ordenes')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nueva Orden de Servicio</h1>
          <p className="text-slate-500 text-sm mt-1">
            Crear nueva orden de servicio con múltiples productos
          </p>
        </div>
      </div>

      {/* Fecha y usuario fijos */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Registro</label>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
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
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <User size={18} className="text-blue-500" />
            Cliente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Cliente por RUC</label>
              <input
                type="text"
                value={busquedaRUC}
                onChange={(e) => { setBusquedaRUC(e.target.value); setMostrarClientesDropdown(true); }}
                onFocus={() => busquedaRUC && setMostrarClientesDropdown(true)}
                placeholder="Ingrese RUC o nombre"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {mostrarClientesDropdown && busquedaRUC && filteredClientes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-72 overflow-y-auto">
                  {filteredClientes.map(cliente => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => seleccionarCliente(cliente)}
                      className="w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-slate-700">{cliente.razon_social}</div>
                      <div className="text-sm text-blue-600 font-semibold">{cliente.ruc}</div>
                    </button>
                  ))}
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
        </div>

        {/* Agregar Productos */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Package size={18} className="text-blue-500" />
            Agregar Productos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Producto</label>
              <select
                value={tipoProductoBusqueda}
                onChange={(e) => setTipoProductoBusqueda(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="farmaceutico">Farmacéutico</option>
                <option value="dispositivo_medico">Dispositivo Médico</option>
                <option value="biologico">Producto Biológico</option>
              </select>
            </div>
            <div className="relative md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Producto</label>
              <input
                type="text"
                value={busquedaProductoTemp}
                onChange={(e) => { setBusquedaProductoTemp(e.target.value); setMostrarProductosDropdownTemp(true); }}
                onFocus={() => busquedaProductoTemp && setMostrarProductosDropdownTemp(true)}
                placeholder="Nombre del producto"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {mostrarProductosDropdownTemp && busquedaProductoTemp && filteredProductosTemp.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-72 overflow-y-auto">
                  {filteredProductosTemp.map(producto => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => seleccionarProductoTemp(producto)}
                      className="w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-medium text-slate-700">{producto.nombre_producto}</div>
                      <div className="text-sm text-blue-600 font-semibold">Reg: {producto.codigo_registro}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={agregarProducto}
                disabled={!productoTempSeleccionado}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Plus size={18} />
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de productos agregados */}
          {productosAgregados.length > 0 && (
            <div className="mt-8 space-y-6">
              <h3 className="text-md font-semibold text-slate-700">Productos en la orden</h3>
              {productosAgregados.map((item, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-6 relative">
                  <button
                    type="button"
                    onClick={() => eliminarProducto(index)}
                    className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pr-8">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Producto</label>
                      <input
                        type="text"
                        value={item.producto.nombre_producto}
                        disabled
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Registro Sanitario</label>
                      <input
                        type="text"
                        value={item.producto.codigo_registro}
                        disabled
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                      <input
                        type="text"
                        value={
                          item.tipo === 'farmaceutico' ? 'Farmacéutico' :
                          item.tipo === 'dispositivo_medico' ? 'Dispositivo Médico' : 'Biológico'
                        }
                        disabled
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  {renderServiciosEspecificos(item, index)}
                  {renderCamposComunes(item, index)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validación de campos requeridos */}
        {(!clienteSeleccionado || productosAgregados.length === 0) && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Campos requeridos incompletos</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  {!clienteSeleccionado && <li>✗ Selecciona un cliente</li>}
                  {productosAgregados.length === 0 && <li>✗ Agrega al menos un producto</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/ordenes')} className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !clienteSeleccionado || productosAgregados.length === 0}
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
                Guardar Orden
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevaOrden;
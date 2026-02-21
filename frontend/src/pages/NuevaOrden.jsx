import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function NuevaOrden() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipoProducto, setTipoProducto] = useState('farmaceutico');
  
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busquedaRUC, setBusquedaRUC] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');

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

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [tipoProducto]);

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

  const buscarClientePorRUC = async (ruc) => {
    if (ruc.length < 8) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/clientes/buscar/${ruc}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClienteSeleccionado(res.data);
      setFormData(prev => ({ ...prev, cliente_id: res.data.id }));
    } catch (error) {
      setClienteSeleccionado(null);
    }
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/ordenes', {
        tipo_producto: tipoProducto,
        ...formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/ordenes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear orden');
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Nueva Orden de Servicio</h1>
        <p className="text-text-secondary">Crear nueva orden de servicio</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Datos Generales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tipo de Producto
              </label>
              <select
                value={tipoProducto}
                onChange={handleTipoProductoChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
              >
                <option value="farmaceutico">Farmacéutico</option>
                <option value="dispositivo_medico">Dispositivo Médico</option>
                <option value="biologico">Producto Biológico</option>
              </select>
            </div>
          </div>

          {/* Buscar Cliente por RUC */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Buscar Cliente por RUC
              </label>
              <input
                type="text"
                value={busquedaRUC}
                onChange={(e) => setBusquedaRUC(e.target.value)}
                onBlur={() => buscarClientePorRUC(busquedaRUC)}
                placeholder="Ingrese RUC"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
              />
              {busquedaRUC && !clienteSeleccionado && (
                <div className="mt-2 p-2 text-sm text-text-secondary bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="animate-pulse">Buscando...</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Cliente
              </label>
              <input
                type="text"
                value={clienteSeleccionado?.razon_social || ''}
                disabled
                placeholder="Se autocompletará"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-text-secondary transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                RUC
              </label>
              <input
                type="text"
                value={clienteSeleccionado?.ruc || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-text-secondary transition-all duration-200"
              />
            </div>
          </div>

          {/* Buscar Producto por Nombre */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Buscar Producto
              </label>
              <input
                type="text"
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
              />
              {busquedaProducto && filteredProductos.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg shadow-lg bg-white z-10 max-h-64 overflow-y-auto">
                  {filteredProductos.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setProductoSeleccionado(p);
                        setFormData(prev => ({ ...prev, producto_id: p.id }));
                        setBusquedaProducto(p.nombre_producto);
                      }}
                      className="px-4 py-3 hover:bg-primary hover:bg-opacity-10 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="font-medium text-text-primary">{p.nombre_producto}</div>
                      <div className="text-xs text-text-secondary">Reg: {p.codigo_registro}</div>
                    </div>
                  ))}
                </div>
              )}
              {busquedaProducto && filteredProductos.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-text-secondary z-10">
                  No se encontraron productos
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Registro Sanitario
              </label>
              <input
                type="text"
                value={productoSeleccionado?.codigo_registro || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-text-secondary transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Opciones según tipo de producto */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Servicios</h2>
          
          {/* Farmacéutico */}
          {tipoProducto === 'farmaceutico' && (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Categoría</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categoria1"
                      checked={formData.categoria1}
                      onChange={handleChange}
                      className="custom-checkbox"
                    />
                    <span className="text-sm text-text-primary">Categoría 1</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categoria2"
                      checked={formData.categoria2}
                      onChange={handleChange}
                      className="custom-checkbox"
                    />
                    <span className="text-sm text-text-primary">Categoría 2</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="cambio_mayor"
                    checked={formData.cambio_mayor}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Cambio Mayor</span>
                </label>
                {formData.cambio_mayor && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="cambio_mayor_autorizado"
                      value={formData.cambio_mayor_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="cambio_menor"
                    checked={formData.cambio_menor}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Cambio Menor</span>
                </label>
                {formData.cambio_menor && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="cambio_menor_autorizado"
                      value={formData.cambio_menor_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="inscripcion"
                    checked={formData.inscripcion}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Inscripción</span>
                </label>
                {formData.inscripcion && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="inscripcion_autorizado"
                      value={formData.inscripcion_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="renovacion"
                    checked={formData.renovacion}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Renovación</span>
                </label>
                {formData.renovacion && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="renovacion_autorizado"
                      value={formData.renovacion_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="traduccion"
                    checked={formData.traduccion}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Traducción</span>
                </label>
                {formData.traduccion && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="traduccion_autorizado"
                      value={formData.traduccion_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
            </>
          )}

          {/* Dispositivo Médico */}
          {tipoProducto === 'dispositivo_medico' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(num => (
                <div key={num}>
                  <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      name={`clase${num}`}
                      checked={formData[`clase${num}`]}
                      onChange={handleChange}
                      className="custom-checkbox"
                    />
                    <span className="text-sm text-text-primary">Clase {num}</span>
                  </label>
                  {formData[`clase${num}`] && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Autorizado por <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        name={`clase${num}_autorizado`}
                        value={formData[`clase${num}_autorizado`]}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="traduccion"
                    checked={formData.traduccion}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Traducción</span>
                </label>
                {formData.traduccion && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="traduccion_autorizado"
                      value={formData.traduccion_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Monto S/.
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>
          )}

          {/* Producto Biológico */}
          {tipoProducto === 'biologico' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="vaccines_immunologicos"
                    checked={formData.vaccines_immunologicos}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Vacunas e Inmunológicos</span>
                </label>
                {formData.vaccines_immunologicos && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="vaccines_immunologicos_autorizado"
                      value={formData.vaccines_immunologicos_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="otros_biologicos_chk"
                    checked={formData.otros_biologicos_chk}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Otros Biológicos</span>
                </label>
                {formData.otros_biologicos_chk && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="otros_biologicos_autorizado"
                      value={formData.otros_biologicos_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="bioequivalente_chk"
                    checked={formData.bioequivalente_chk}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Bioequivalente</span>
                </label>
                {formData.bioequivalente_chk && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="bioequivalente_autorizado"
                      value={formData.bioequivalente_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="biotecnologico_chk"
                    checked={formData.biotecnologico_chk}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Biotecnológico</span>
                </label>
                {formData.biotecnologico_chk && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="biotecnologico_autorizado"
                      value={formData.biotecnologico_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    name="traduccion"
                    checked={formData.traduccion}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm text-text-primary">Traducción</span>
                </label>
                {formData.traduccion && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Autorizado por <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="traduccion_autorizado"
                      value={formData.traduccion_autorizado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fechas y observaciones */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Fechas y Observaciones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                CPB N°
              </label>
              <input
                type="text"
                name="cpb_numero"
                value={formData.cpb_numero}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Fecha de Recepción
              </label>
              <input
                type="date"
                name="fecha_recepcion"
                value={formData.fecha_recepcion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Fecha de Ingreso a VUCE
              </label>
              <input
                type="date"
                name="fecha_ingreso_vuce"
                value={formData.fecha_ingreso_vuce}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Fecha de Fin de Proceso
              </label>
              <input
                type="date"
                name="fecha_fin_proceso"
                value={formData.fecha_fin_proceso}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Orden'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/ordenes')}
            className="border border-gray-300 text-text-primary px-6 py-2 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevaOrden;

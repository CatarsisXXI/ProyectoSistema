import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function NuevoDocumento() {
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
  const [pdfAdjunto, setPdfAdjunto] = useState(null);

  const [formData, setFormData] = useState({
    cliente_id: '',
    producto_id: '',
    // Farmacéutico
    categoria1: false,
    categoria2: false,
    cambio_mayor: false,
    cambio_mayor_costo: '',
    cambio_mayor_moneda: 'soles',
    cambio_menor: false,
    cambio_menor_costo: '',
    cambio_menor_moneda: 'soles',
    inscripcion: false,
    inscripcion_costo: '',
    inscripcion_moneda: 'soles',
    renovacion: false,
    renovacion_costo: '',
    renovacion_moneda: 'soles',
    traduccion: false,
    traduccion_costo: '',
    traduccion_moneda: 'soles',
    // Dispositivos
    clase1: false,
    clase1_costo: '',
    clase1_moneda: 'soles',
    clase2: false,
    clase2_costo: '',
    clase2_moneda: 'soles',
    clase3: false,
    clase3_costo: '',
    clase3_moneda: 'soles',
    clase4: false,
    clase4_costo: '',
    clase4_moneda: 'soles',
    // Biológicos
    vaccines_inmunologicos: false,
    vaccines_inmunologicos_costo: '',
    vaccines_inmunologicos_moneda: 'soles',
    otros_biologicos: false,
    otros_biologicos_costo: '',
    otros_biologicos_moneda: 'soles',
    bioequivalente: false,
    bioequivalente_costo: '',
    bioequivalente_moneda: 'soles',
    biotecnologico: false,
    biotecnologico_costo: '',
    biotecnologico_moneda: 'soles',
    // Derecho de trámite
    derecho_tramite_cpb: '',
    derecho_tramite_monto: ''
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
      setClientes(res.data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
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
      setProductos(res.data);
    } catch (error) {
      console.error('Error fetching productos:', error);
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

  const calculateTotal = () => {
    let total = 0;

    if (tipoProducto === 'farmaceutico') {
      if (formData.cambio_mayor && formData.cambio_mayor_costo) total += parseFloat(formData.cambio_mayor_costo) || 0;
      if (formData.cambio_menor && formData.cambio_menor_costo) total += parseFloat(formData.cambio_menor_costo) || 0;
      if (formData.inscripcion && formData.inscripcion_costo) total += parseFloat(formData.inscripcion_costo) || 0;
      if (formData.renovacion && formData.renovacion_costo) total += parseFloat(formData.renovacion_costo) || 0;
      if (formData.traduccion && formData.traduccion_costo) total += parseFloat(formData.traduccion_costo) || 0;
    } else if (tipoProducto === 'dispositivo_medico') {
      if (formData.clase1 && formData.clase1_costo) total += parseFloat(formData.clase1_costo) || 0;
      if (formData.clase2 && formData.clase2_costo) total += parseFloat(formData.clase2_costo) || 0;
      if (formData.clase3 && formData.clase3_costo) total += parseFloat(formData.clase3_costo) || 0;
      if (formData.clase4 && formData.clase4_costo) total += parseFloat(formData.clase4_costo) || 0;
      if (formData.traduccion && formData.traduccion_costo) total += parseFloat(formData.traduccion_costo) || 0;
    } else if (tipoProducto === 'biologico') {
      if (formData.vaccines_inmunologicos && formData.vaccines_inmunologicos_costo) total += parseFloat(formData.vaccines_inmunologicos_costo) || 0;
      if (formData.otros_biologicos && formData.otros_biologicos_costo) total += parseFloat(formData.otros_biologicos_costo) || 0;
      if (formData.bioequivalente && formData.bioequivalente_costo) total += parseFloat(formData.bioequivalente_costo) || 0;
      if (formData.biotecnologico && formData.biotecnologico_costo) total += parseFloat(formData.biotecnologico_costo) || 0;
      if (formData.traduccion && formData.traduccion_costo) total += parseFloat(formData.traduccion_costo) || 0;
    }

    if (formData.derecho_tramite_monto) total += parseFloat(formData.derecho_tramite_monto) || 0;

    return total.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let pdfFilename = '';

      // Si hay archivo PDF, subirlo primero
      if (pdfAdjunto) {
        const formDataPdf = new FormData();
        formDataPdf.append('pdf', pdfAdjunto);
        
        try {
          const uploadRes = await axios.post('/api/documentos/upload', formDataPdf, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          pdfFilename = uploadRes.data.filename;
        } catch (uploadError) {
          console.error('Error al subir PDF:', uploadError);
          setError('Error al subir el archivo PDF');
          setLoading(false);
          return;
        }
      }

      await axios.post('/api/documentos', {
        tipo_producto: tipoProducto,
        ...formData,
        pdf_adjunto: pdfFilename
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/documentos');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear documento');
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
        <h1 className="text-2xl font-bold text-text-primary">Nuevo Documento Contable</h1>
        <p className="text-text-secondary">Crear nuevo documento contable</p>
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
                Nombre del Producto
              </label>
              <input
                type="text"
                value={productoSeleccionado?.nombre_producto || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-text-secondary transition-all duration-200"
              />
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

        {/* Costos según tipo de producto */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Costos de Servicios</h2>
          
          {/* Farmacéutico */}
          {tipoProducto === 'farmaceutico' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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

              {[
                { key: 'cambio_mayor', label: 'Cambio Mayor' },
                { key: 'cambio_menor', label: 'Cambio Menor' },
                { key: 'inscripcion', label: 'Inscripción' },
                { key: 'renovacion', label: 'Renovación' },
                { key: 'traduccion', label: 'Traducción' }
              ].map(item => (
                <div key={item.key} className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={item.key}
                      checked={formData[item.key]}
                      onChange={handleChange}
                      className="custom-checkbox"
                    />
                    <span className="text-sm font-medium text-text-primary">{item.label}</span>
                  </label>
                  {formData[item.key] && (
                    <>
                      <input
                        type="number"
                        name={`${item.key}_costo`}
                        value={formData[`${item.key}_costo`]}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="Costo"
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <select
                        name={`${item.key}_moneda`}
                        value={formData[`${item.key}_moneda`]}
                        onChange={handleChange}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                      >
                        <option value="soles">Soles</option>
                        <option value="dolares">Dólares</option>
                      </select>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dispositivo Médico */}
          {tipoProducto === 'dispositivo_medico' && (
            <div className="space-y-4">
              {[1,2,3,4].map(num => (
                <div key={num} className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`clase${num}`}
                      checked={formData[`clase${num}`]}
                      onChange={handleChange}
                      className="custom-checkbox"
                    />
                    <span className="text-sm font-medium text-text-primary">Clase {num}</span>
                  </label>
                  {formData[`clase${num}`] && (
                    <>
                      <input
                        type="number"
                        name={`clase${num}_costo`}
                        value={formData[`clase${num}_costo`]}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="Costo"
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <select
                        name={`clase${num}_moneda`}
                        value={formData[`clase${num}_moneda`]}
                        onChange={handleChange}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                      >
                        <option value="soles">Soles</option>
                        <option value="dolares">Dólares</option>
                      </select>
                    </>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="traduccion"
                    checked={formData.traduccion}
                    onChange={handleChange}
                    className="custom-checkbox"
                  />
                  <span className="text-sm font-medium text-text-primary">Traducción</span>
                </label>
                {formData.traduccion && (
                  <>
                    <input
                      type="number"
                      name="traduccion_costo"
                      value={formData.traduccion_costo}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="Costo"
                      className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                    <select
                      name="traduccion_moneda"
                      value={formData.traduccion_moneda}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                    >
                      <option value="soles">Soles</option>
                      <option value="dolares">Dólares</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Producto Biológico */}
          {tipoProducto === 'biologico' && (
            <div className="space-y-4">
              {[
                { key: 'vaccines_inmunologicos', label: 'Vacunas e Inmunológicos' },
                { key: 'otros_biologicos', label: 'Otros Biológicos' },
                { key: 'bioequivalente', label: 'Bioequivalente' },
                { key: 'biotecnologico', label: 'Biotecnológico' },
                { key: 'traduccion', label: 'Traducción' }
              ].map(item => (
                <div key={item.key} className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={item.key}
                      checked={formData[item.key]}
                      onChange={handleChange}
                      className="custom-checkbox"
                    />
                    <span className="text-sm font-medium text-text-primary">{item.label}</span>
                  </label>
                  {formData[item.key] && (
                    <>
                      <input
                        type="number"
                        name={`${item.key}_costo`}
                        value={formData[`${item.key}_costo`]}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="Costo"
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <select
                        name={`${item.key}_moneda`}
                        value={formData[`${item.key}_moneda`]}
                        onChange={handleChange}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                      >
                        <option value="soles">Soles</option>
                        <option value="dolares">Dólares</option>
                      </select>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derecho de trámite */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Derecho de Trámite (Tasa de Salud)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                CPB N°
              </label>
              <input
                type="text"
                name="derecho_tramite_cpb"
                value={formData.derecho_tramite_cpb}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Monto S/.
              </label>
              <input
                type="number"
                name="derecho_tramite_monto"
                value={formData.derecho_tramite_monto}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Archivo Adjunto (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfAdjunto(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none
                          file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-opacity-90"
              />
              {pdfAdjunto && (
                <p className="text-xs text-green-600 mt-1">✓ {pdfAdjunto.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 mb-6 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-1">Total</h2>
              <p className="text-sm text-text-secondary">Suma de todos los costos ingresados</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                S/. {calculateTotal()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Documento'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/documentos')}
            className="border border-gray-300 text-text-primary px-6 py-2 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoDocumento;

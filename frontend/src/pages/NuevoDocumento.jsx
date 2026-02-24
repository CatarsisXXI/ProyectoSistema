import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Save, ArrowLeft, Calendar, User, AlertCircle,
  Package, Upload, DollarSign, FileText, Receipt
} from 'lucide-react';

const TIPOS_DOCUMENTO = [
  { value: 'factura',             label: 'Factura',              prefijo: 'F001'  },
  { value: 'factura_electronica', label: 'Factura Electrónica',  prefijo: 'FE01'  },
  { value: 'boleta',              label: 'Boleta',               prefijo: 'B001'  },
  { value: 'nota_credito',        label: 'Nota de Crédito',      prefijo: 'NC01'  },
];

function NuevoDocumento() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipoProducto, setTipoProducto] = useState('farmaceutico');
  const [tipoDocumento, setTipoDocumento] = useState('factura');

  // Monto de la orden de origen (solo lectura, se suma al total)
  const [montoOrden, setMontoOrden] = useState(0);
  const [ordenId, setOrdenId] = useState(null);
  const [ordenRef, setOrdenRef] = useState(''); // texto descriptivo

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busquedaRUC, setBusquedaRUC] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [pdfAdjunto, setPdfAdjunto] = useState(null);
  const [mostrarClientesDropdown, setMostrarClientesDropdown] = useState(false);
  const [mostrarProductosDropdown, setMostrarProductosDropdown] = useState(false);

  const [formData, setFormData] = useState({
    cliente_id: '',
    producto_id: '',
    // Farmacéutico
    categoria1: false, categoria2: false,
    cambio_mayor: false, cambio_mayor_costo: '', cambio_mayor_moneda: 'soles',
    cambio_menor: false, cambio_menor_costo: '', cambio_menor_moneda: 'soles',
    inscripcion: false, inscripcion_costo: '', inscripcion_moneda: 'soles',
    renovacion: false, renovacion_costo: '', renovacion_moneda: 'soles',
    traduccion: false, traduccion_costo: '', traduccion_moneda: 'soles',
    // Dispositivo
    clase1: false, clase1_costo: '', clase1_moneda: 'soles',
    clase2: false, clase2_costo: '', clase2_moneda: 'soles',
    clase3: false, clase3_costo: '', clase3_moneda: 'soles',
    clase4: false, clase4_costo: '', clase4_moneda: 'soles',
    // Biológico
    vaccines_inmunologicos: false, vaccines_inmunologicos_costo: '', vaccines_inmunologicos_moneda: 'soles',
    otros_biologicos: false, otros_biologicos_costo: '', otros_biologicos_moneda: 'soles',
    bioequivalente: false, bioequivalente_costo: '', bioequivalente_moneda: 'soles',
    biotecnologico: false, biotecnologico_costo: '', biotecnologico_moneda: 'soles',
    // Trámite
    derecho_tramite_cpb: '', derecho_tramite_monto: ''
  });

  useEffect(() => { fetchClientes(); }, []);
  useEffect(() => { fetchProductos(); }, [tipoProducto]);

  // Cargar datos si viene desde OrdenesServicio
  useEffect(() => {
    if (!location.state?.ordenData) return;
    const { ordenData } = location.state;

    if (ordenData.clienteInfo) {
      setClienteSeleccionado(ordenData.clienteInfo);
      setFormData(prev => ({ ...prev, cliente_id: ordenData.clienteInfo.id }));
      setBusquedaRUC(ordenData.clienteInfo.ruc);
    }
    if (ordenData.productoInfo) {
      setProductoSeleccionado(ordenData.productoInfo);
      setFormData(prev => ({ ...prev, producto_id: ordenData.productoInfo.id }));
      setBusquedaProducto(ordenData.productoInfo.nombre_producto);
    }
    if (ordenData.tipo_producto) {
      setTipoProducto(ordenData.tipo_producto);
    }
    if (ordenData.monto_orden) {
      setMontoOrden(parseFloat(ordenData.monto_orden) || 0);
    }
    if (ordenData.id) {
      setOrdenId(ordenData.id);
      setOrdenRef(`Orden #${ordenData.id}`);
    }
  }, [location.state]);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/clientes', { headers: { Authorization: `Bearer ${token}` } });
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch { setClientes([]); }
  };

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = tipoProducto === 'farmaceutico' ? '/api/productos/farmaceuticos'
        : tipoProducto === 'dispositivo_medico' ? '/api/productos/dispositivos'
        : '/api/productos/biologicos';
      const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch { setProductos([]); }
  };

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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTipoProductoChange = (e) => {
    setTipoProducto(e.target.value);
    setProductoSeleccionado(null);
    setFormData(prev => ({ ...prev, producto_id: '' }));
    setBusquedaProducto('');
  };

  // Suma de costos ingresados en el documento (sin contar monto_orden)
  const calcularSubtotalDocumento = () => {
    let total = 0;
    if (tipoProducto === 'farmaceutico') {
      if (formData.cambio_mayor   && formData.cambio_mayor_costo)   total += parseFloat(formData.cambio_mayor_costo) || 0;
      if (formData.cambio_menor   && formData.cambio_menor_costo)   total += parseFloat(formData.cambio_menor_costo) || 0;
      if (formData.inscripcion    && formData.inscripcion_costo)    total += parseFloat(formData.inscripcion_costo) || 0;
      if (formData.renovacion     && formData.renovacion_costo)     total += parseFloat(formData.renovacion_costo) || 0;
      if (formData.traduccion     && formData.traduccion_costo)     total += parseFloat(formData.traduccion_costo) || 0;
    } else if (tipoProducto === 'dispositivo_medico') {
      if (formData.clase1 && formData.clase1_costo) total += parseFloat(formData.clase1_costo) || 0;
      if (formData.clase2 && formData.clase2_costo) total += parseFloat(formData.clase2_costo) || 0;
      if (formData.clase3 && formData.clase3_costo) total += parseFloat(formData.clase3_costo) || 0;
      if (formData.clase4 && formData.clase4_costo) total += parseFloat(formData.clase4_costo) || 0;
      if (formData.traduccion && formData.traduccion_costo) total += parseFloat(formData.traduccion_costo) || 0;
    } else if (tipoProducto === 'biologico') {
      if (formData.vaccines_inmunologicos && formData.vaccines_inmunologicos_costo) total += parseFloat(formData.vaccines_inmunologicos_costo) || 0;
      if (formData.otros_biologicos       && formData.otros_biologicos_costo)       total += parseFloat(formData.otros_biologicos_costo) || 0;
      if (formData.bioequivalente         && formData.bioequivalente_costo)         total += parseFloat(formData.bioequivalente_costo) || 0;
      if (formData.biotecnologico         && formData.biotecnologico_costo)         total += parseFloat(formData.biotecnologico_costo) || 0;
      if (formData.traduccion             && formData.traduccion_costo)             total += parseFloat(formData.traduccion_costo) || 0;
    }
    if (formData.derecho_tramite_monto) total += parseFloat(formData.derecho_tramite_monto) || 0;
    return total;
  };

  const calcularTotal = () => (montoOrden + calcularSubtotalDocumento()).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let pdfFilename = '';
      if (pdfAdjunto) {
        const fd = new FormData();
        fd.append('pdf', pdfAdjunto);
        const uploadRes = await axios.post('/api/documentos/upload', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        pdfFilename = uploadRes.data.filename;
      }
      await axios.post('/api/documentos', {
        tipo_documento: tipoDocumento,
        orden_id: ordenId || undefined,
        monto_orden: montoOrden,
        tipo_producto: tipoProducto,
        ...formData,
        pdf_adjunto: pdfFilename
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/documentos');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear documento');
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(c =>
    c.ruc?.toLowerCase().includes(busquedaRUC.toLowerCase()) ||
    c.razon_social?.toLowerCase().includes(busquedaRUC.toLowerCase())
  );
  const filteredProductos = productos.filter(p =>
    p.nombre_producto?.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const fechaActual = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  const subtotalDoc = calcularSubtotalDocumento();
  const totalFinal = parseFloat(calcularTotal());

  const inputCls = "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
  const disabledCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed";

  const renderServiceRow = (item) => (
    <div key={item.key} className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-lg">
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer min-w-[140px]">
        <input type="checkbox" name={item.key} checked={formData[item.key]} onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
        <span className="font-medium">{item.label}</span>
      </label>
      {formData[item.key] && (
        <>
          <input type="number" name={`${item.key}_costo`} value={formData[`${item.key}_costo`]}
            onChange={handleChange} step="0.01" placeholder="Costo"
            className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
          <select name={`${item.key}_moneda`} value={formData[`${item.key}_moneda`]} onChange={handleChange}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white">
            <option value="soles">Soles</option>
            <option value="dolares">Dólares</option>
          </select>
        </>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/documentos')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nuevo Documento Contable</h1>
          <p className="text-slate-500 text-sm mt-1">
            {ordenRef ? `Generado desde ${ordenRef}` : 'Crear nuevo documento contable'}
          </p>
        </div>
      </div>

      {/* Fecha y usuario */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Registro</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={fechaActual} disabled className={`${disabledCls} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={usuario?.nombre_completo || ''} disabled className={`${disabledCls} pl-10`} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── TIPO DE DOCUMENTO ── */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-6">
            <Receipt size={18} className="text-blue-500" />
            Tipo de Documento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIPOS_DOCUMENTO.map(td => (
              <button
                key={td.value}
                type="button"
                onClick={() => setTipoDocumento(td.value)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  tipoDocumento === td.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <FileText size={24} className="mb-2" />
                <span className="font-semibold text-sm text-center">{td.label}</span>
                <span className="text-xs mt-1 opacity-70">{td.prefijo}-XXXXX</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            El número de correlativo se asignará automáticamente al guardar.
          </p>
        </div>

        {/* ── DATOS GENERALES ── */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <Package size={18} className="text-blue-500" />
            Datos Generales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Producto</label>
              <select value={tipoProducto} onChange={handleTipoProductoChange}
                className={`${inputCls} bg-white`}>
                <option value="farmaceutico">Farmacéutico</option>
                <option value="dispositivo_medico">Dispositivo Médico</option>
                <option value="biologico">Producto Biológico</option>
              </select>
            </div>
            {ordenRef && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Orden de Origen</label>
                <input type="text" value={ordenRef} disabled className={disabledCls} />
              </div>
            )}
          </div>

          {/* Cliente */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Cliente por RUC</label>
              <input type="text" value={busquedaRUC}
                onChange={(e) => { setBusquedaRUC(e.target.value); setMostrarClientesDropdown(true); }}
                onFocus={() => busquedaRUC && setMostrarClientesDropdown(true)}
                placeholder="Ingrese RUC o nombre" className={inputCls} />
              {mostrarClientesDropdown && busquedaRUC && filteredClientes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-72 overflow-y-auto">
                  {filteredClientes.map(c => (
                    <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}
                      className="w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-100 last:border-b-0">
                      <div className="font-medium text-slate-700">{c.razon_social}</div>
                      <div className="text-sm text-blue-600 font-semibold">RUC: {c.ruc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <input type="text" value={clienteSeleccionado?.razon_social || ''} disabled className={disabledCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUC</label>
              <input type="text" value={clienteSeleccionado?.ruc || ''} disabled className={disabledCls} />
            </div>
          </div>

          {/* Producto */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Producto</label>
              <input type="text" value={busquedaProducto}
                onChange={(e) => { setBusquedaProducto(e.target.value); setMostrarProductosDropdown(true); }}
                onFocus={() => busquedaProducto && setMostrarProductosDropdown(true)}
                placeholder="Nombre del producto" className={inputCls} />
              {mostrarProductosDropdown && busquedaProducto && filteredProductos.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-72 overflow-y-auto">
                  {filteredProductos.map(p => (
                    <button key={p.id} type="button" onClick={() => seleccionarProducto(p)}
                      className="w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-slate-100 last:border-b-0">
                      <div className="font-medium text-slate-700">{p.nombre_producto}</div>
                      <div className="text-sm text-blue-600 font-semibold">Reg: {p.codigo_registro}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
              <input type="text" value={productoSeleccionado?.nombre_producto || ''} disabled className={disabledCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registro Sanitario</label>
              <input type="text" value={productoSeleccionado?.codigo_registro || ''} disabled className={disabledCls} />
            </div>
          </div>
        </div>

        {/* ── MONTO DE LA ORDEN (solo si viene de una orden) ── */}
        {montoOrden > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2 mb-3">
              <DollarSign size={18} className="text-amber-600" />
              Montos de la Orden de Servicio
            </h2>
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-amber-200">
              <div>
                <p className="text-sm text-slate-600">Total de montos registrados en {ordenRef}</p>
                <p className="text-xs text-slate-500 mt-0.5">Incluye el monto de todos los productos (farmacéuticos y dispositivos médicos)</p>
              </div>
              <div className="text-2xl font-bold text-amber-700">S/ {montoOrden.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* ── COSTOS DE SERVICIOS ── */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <DollarSign size={18} className="text-blue-500" />
            Costos de Servicios Adicionales
          </h2>

          {/* Farmacéutico */}
          {tipoProducto === 'farmaceutico' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Categoría</h3>
                <div className="flex flex-wrap gap-4">
                  {['categoria1', 'categoria2'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" name={cat} checked={formData[cat]} onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                      {cat === 'categoria1' ? 'Categoría 1' : 'Categoría 2'}
                    </label>
                  ))}
                </div>
              </div>
              {[
                { key: 'cambio_mayor', label: 'Cambio Mayor' },
                { key: 'cambio_menor', label: 'Cambio Menor' },
                { key: 'inscripcion',  label: 'Inscripción'  },
                { key: 'renovacion',   label: 'Renovación'   },
                { key: 'traduccion',   label: 'Traducción'   }
              ].map(renderServiceRow)}
            </div>
          )}

          {/* Dispositivo médico */}
          {tipoProducto === 'dispositivo_medico' && (
            <div className="space-y-4">
              {[1,2,3,4].map(num => renderServiceRow({ key: `clase${num}`, label: `Clase ${num}` }))}
              {renderServiceRow({ key: 'traduccion', label: 'Traducción' })}
            </div>
          )}

          {/* Biológico */}
          {tipoProducto === 'biologico' && (
            <div className="space-y-4">
              {[
                { key: 'vaccines_inmunologicos', label: 'Vacunas e Inmunológicos' },
                { key: 'otros_biologicos',       label: 'Otros Biológicos'        },
                { key: 'bioequivalente',         label: 'Bioequivalente'          },
                { key: 'biotecnologico',         label: 'Biotecnológico'          },
                { key: 'traduccion',             label: 'Traducción'              }
              ].map(renderServiceRow)}
            </div>
          )}
        </div>

        {/* ── DERECHO DE TRÁMITE Y PDF ── */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <FileText size={18} className="text-blue-500" />
            Derecho de Trámite (Tasa de Salud)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPB N°</label>
              <input type="text" name="derecho_tramite_cpb" value={formData.derecho_tramite_cpb}
                onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto S/.</label>
              <input type="number" name="derecho_tramite_monto" value={formData.derecho_tramite_monto}
                onChange={handleChange} step="0.01" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Archivo Adjunto (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => setPdfAdjunto(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
              {pdfAdjunto && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Upload size={12} /> {pdfAdjunto.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── RESUMEN TOTAL ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4 opacity-90">Resumen de Totales</h2>
          <div className="space-y-3">
            {montoOrden > 0 && (
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-2">
                <span className="text-sm opacity-90">Subtotal Orden ({ordenRef})</span>
                <span className="font-semibold">S/ {montoOrden.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-2">
              <span className="text-sm opacity-90">Subtotal Costos de Servicios</span>
              <span className="font-semibold">S/ {subtotalDoc.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/30 pt-3 flex justify-between items-center">
              <span className="text-xl font-bold">TOTAL</span>
              <span className="text-3xl font-bold">S/ {totalFinal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {(!formData.cliente_id || !formData.producto_id) && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Campos requeridos incompletos</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  {!formData.cliente_id  && <li>✗ Selecciona un cliente</li>}
                  {!formData.producto_id && <li>✗ Selecciona un producto</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/documentos')}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Cancelar
          </button>
          <button type="submit" disabled={loading || !formData.cliente_id || !formData.producto_id}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Guardando...</>
            ) : (
              <><Save size={18} />Guardar Documento</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoDocumento;

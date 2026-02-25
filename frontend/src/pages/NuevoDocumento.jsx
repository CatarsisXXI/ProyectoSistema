import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Save, ArrowLeft, Calendar, User, AlertCircle,
  Package, Upload, DollarSign, FileText, Receipt, ChevronDown, ChevronUp
} from 'lucide-react';

const TIPOS_DOCUMENTO = [
  { value: 'factura',             label: 'Factura',             prefijo: 'F001'  },
  { value: 'factura_electronica', label: 'Factura Electrónica', prefijo: 'FE01'  },
  { value: 'boleta',              label: 'Boleta',              prefijo: 'B001'  },
  { value: 'nota_credito',        label: 'Nota de Crédito',     prefijo: 'NC01'  },
];

const TIPO_PRODUCTO_LABEL = {
  farmaceutico:      'Farmacéutico',
  dispositivo_medico:'Dispositivo Médico',
  biologico:         'Producto Biológico',
};
const TIPO_PRODUCTO_COLOR = {
  farmaceutico:      'bg-blue-100 text-blue-800 border-blue-200',
  dispositivo_medico:'bg-purple-100 text-purple-800 border-purple-200',
  biologico:         'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const inputCls    = "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
const disabledCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed";

// Costos que pertenecen a cada tipo
const SERVICIOS_FARMACEUTICO = [
  { key: 'cambio_mayor', label: 'Cambio Mayor'  },
  { key: 'cambio_menor', label: 'Cambio Menor'  },
  { key: 'inscripcion',  label: 'Inscripción'   },
  { key: 'renovacion',   label: 'Renovación'    },
  { key: 'traduccion',   label: 'Traducción'    },
];
const SERVICIOS_DISPOSITIVO = [
  { key: 'clase1',    label: 'Clase 1'    },
  { key: 'clase2',    label: 'Clase 2'    },
  { key: 'clase3',    label: 'Clase 3'    },
  { key: 'clase4',    label: 'Clase 4'    },
  { key: 'traduccion',label: 'Traducción' },
];
const SERVICIOS_BIOLOGICO = [
  { key: 'vaccines_inmunologicos', label: 'Vacunas e Inmunológicos' },
  { key: 'otros_biologicos',       label: 'Otros Biológicos'        },
  { key: 'bioequivalente',         label: 'Bioequivalente'          },
  { key: 'biotecnologico',         label: 'Biotecnológico'          },
  { key: 'traduccion',             label: 'Traducción'              },
];

const SERVICIOS_POR_TIPO = {
  farmaceutico:       SERVICIOS_FARMACEUTICO,
  dispositivo_medico: SERVICIOS_DISPOSITIVO,
  biologico:          SERVICIOS_BIOLOGICO,
};

function NuevoDocumento() {
  const { usuario } = useContext(AuthContext);
  const navigate    = useNavigate();
  const location    = useLocation();

  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('factura');

  // ── Estado de origen de orden ──
  const [desdeOrden,      setDesdeOrden]      = useState(false);
  const [ordenId,         setOrdenId]         = useState(null);
  const [ordenRef,        setOrdenRef]        = useState('');
  const [ordenProductos,  setOrdenProductos]  = useState([]); // todos los productos de la orden
  const [tiposPresentes,  setTiposPresentes]  = useState([]); // tipos únicos en la orden
  const [montoOrden,      setMontoOrden]      = useState(0);

  // ── Cuando NO viene de orden ──
  const [tipoProducto,    setTipoProducto]    = useState('farmaceutico');
  const [clientes,        setClientes]        = useState([]);
  const [productos,       setProductos]       = useState([]);
  const [busquedaRUC,     setBusquedaRUC]     = useState('');
  const [clienteSeleccionado,  setClienteSeleccionado]  = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busquedaProducto,     setBusquedaProducto]     = useState('');
  const [mostrarClientesDropdown,  setMostrarClientesDropdown]  = useState(false);
  const [mostrarProductosDropdown, setMostrarProductosDropdown] = useState(false);

  const [pdfAdjunto, setPdfAdjunto] = useState(null);

  // ── formData: todos los campos de costos ──
  const defaultFormData = () => ({
    cliente_id: '', producto_id: '',
    categoria1: false, categoria2: false,
    cambio_mayor: false, cambio_mayor_costo: '', cambio_mayor_moneda: 'soles',
    cambio_menor: false, cambio_menor_costo: '', cambio_menor_moneda: 'soles',
    inscripcion:  false, inscripcion_costo:  '', inscripcion_moneda:  'soles',
    renovacion:   false, renovacion_costo:   '', renovacion_moneda:   'soles',
    traduccion:   false, traduccion_costo:   '', traduccion_moneda:   'soles',
    clase1: false, clase1_costo: '', clase1_moneda: 'soles',
    clase2: false, clase2_costo: '', clase2_moneda: 'soles',
    clase3: false, clase3_costo: '', clase3_moneda: 'soles',
    clase4: false, clase4_costo: '', clase4_moneda: 'soles',
    vaccines_inmunologicos: false, vaccines_inmunologicos_costo: '', vaccines_inmunologicos_moneda: 'soles',
    otros_biologicos:       false, otros_biologicos_costo:       '', otros_biologicos_moneda:       'soles',
    bioequivalente:         false, bioequivalente_costo:         '', bioequivalente_moneda:         'soles',
    biotecnologico:         false, biotecnologico_costo:         '', biotecnologico_moneda:         'soles',
    derecho_tramite_cpb: '', derecho_tramite_monto: ''
  });
  const [formData, setFormData] = useState(defaultFormData());

  // ── Secciones expandidas/colapsadas (solo cuando hay múltiples tipos) ──
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({});

  // ────────────────────────────────────────────────
  useEffect(() => { fetchClientes(); }, []);
  useEffect(() => { if (!desdeOrden) fetchProductos(); }, [tipoProducto, desdeOrden]);

  // ── Cargar datos desde ordenData ──
  useEffect(() => {
    if (!location.state?.ordenData) return;
    const { ordenData } = location.state;

    setDesdeOrden(true);
    setOrdenId(ordenData.id);
    setOrdenRef(`Orden #${ordenData.id}`);

    const prods = ordenData.productos || [];
    setOrdenProductos(prods);

    // Tipos únicos presentes en la orden
    const tipos = [...new Set(prods.map(p => p.tipo_producto))];
    setTiposPresentes(tipos);

    // Expandir todas las secciones por defecto
    const expanded = {};
    tipos.forEach(t => { expanded[t] = true; });
    setSeccionesExpandidas(expanded);

    // Cliente del primer producto / info de la orden
    if (ordenData.clienteInfo) {
      setClienteSeleccionado(ordenData.clienteInfo);
      setFormData(prev => ({ ...prev, cliente_id: ordenData.clienteInfo.id }));
      setBusquedaRUC(ordenData.clienteInfo.ruc);
    }

    // Primer producto como referencia para producto_id
    if (prods.length > 0) {
      const primero = prods[0];
      setFormData(prev => ({
        ...prev,
        producto_id: primero.producto_id,
        cliente_id: ordenData.clienteInfo?.id || prev.cliente_id
      }));
    }

    // Monto total de la orden (suma de montos de farmacéutico y dispositivo)
    const total = prods.reduce((sum, p) => {
      if (p.tipo_producto !== 'biologico' && p.monto) sum += parseFloat(p.monto) || 0;
      return sum;
    }, 0);
    setMontoOrden(total);
    setTipoProducto(prods[0]?.tipo_producto || 'farmaceutico');
  }, [location.state]);

  // ────────────────────────────────────────────────
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

  const seleccionarCliente = (c) => {
    setClienteSeleccionado(c);
    setFormData(prev => ({ ...prev, cliente_id: c.id }));
    setBusquedaRUC(c.ruc);
    setMostrarClientesDropdown(false);
  };

  const seleccionarProducto = (p) => {
    setProductoSeleccionado(p);
    setFormData(prev => ({ ...prev, producto_id: p.id }));
    setBusquedaProducto(p.nombre_producto);
    setMostrarProductosDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSeccion = (tipo) => {
    setSeccionesExpandidas(prev => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  // ── Subtotal del documento (suma de todos los costos marcados, sin importar tipo) ──
  const calcularSubtotalDocumento = () => {
    let total = 0;
    const s = (chk, val) => { if (chk && val) total += parseFloat(val) || 0; };
    s(formData.cambio_mayor, formData.cambio_mayor_costo);
    s(formData.cambio_menor, formData.cambio_menor_costo);
    s(formData.inscripcion,  formData.inscripcion_costo);
    s(formData.renovacion,   formData.renovacion_costo);
    s(formData.traduccion,   formData.traduccion_costo);
    s(formData.clase1, formData.clase1_costo);
    s(formData.clase2, formData.clase2_costo);
    s(formData.clase3, formData.clase3_costo);
    s(formData.clase4, formData.clase4_costo);
    s(formData.vaccines_inmunologicos, formData.vaccines_inmunologicos_costo);
    s(formData.otros_biologicos,       formData.otros_biologicos_costo);
    s(formData.bioequivalente,         formData.bioequivalente_costo);
    s(formData.biotecnologico,         formData.biotecnologico_costo);
    if (formData.derecho_tramite_monto) total += parseFloat(formData.derecho_tramite_monto) || 0;
    return total;
  };

  const calcularTotal = () => (montoOrden + calcularSubtotalDocumento()).toFixed(2);

  // ── Subtotal por tipo (para el resumen desglosado) ──
  const calcularSubtotalPorTipo = (tipo) => {
    let total = 0;
    const s = (chk, val) => { if (chk && val) total += parseFloat(val) || 0; };
    const servicios = SERVICIOS_POR_TIPO[tipo] || [];
    servicios.forEach(item => s(formData[item.key], formData[`${item.key}_costo`]));
    return total;
  };

  // ── Monto de productos por tipo (para el resumen desglosado) ──
  const calcularMontoPorTipo = (tipo) => {
    return ordenProductos
      .filter(p => p.tipo_producto === tipo && p.tipo_producto !== 'biologico' && p.monto)
      .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
  };

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
        const up = await axios.post('/api/documentos/upload', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        pdfFilename = up.data.filename;
      }
      await axios.post('/api/documentos', {
        tipo_documento: tipoDocumento,
        orden_id:    ordenId   || undefined,
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
  const totalFinal  = parseFloat(calcularTotal());

  // ── Render fila de servicio (checkbox + costo + moneda) ──
  const renderServiceRow = (item) => (
    <div key={item.key} className="flex flex-wrap items-center gap-4 p-3 bg-white rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer min-w-[170px]">
        <input type="checkbox" name={item.key} checked={formData[item.key]} onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
        <span className="font-medium">{item.label}</span>
      </label>
      {formData[item.key] && (
        <>
          <input type="number" name={`${item.key}_costo`} value={formData[`${item.key}_costo`]}
            onChange={handleChange} step="0.01" placeholder="Costo"
            className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" />
          <select name={`${item.key}_moneda`} value={formData[`${item.key}_moneda`]} onChange={handleChange}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-sm">
            <option value="soles">Soles</option>
            <option value="dolares">Dólares</option>
          </select>
          {formData[`${item.key}_costo`] && (
            <span className="text-sm font-semibold text-blue-700">
              = S/ {parseFloat(formData[`${item.key}_costo`] || 0).toFixed(2)}
            </span>
          )}
        </>
      )}
    </div>
  );

  // ── Sección de costos por tipo de producto ──
  const renderSeccionCostos = (tipo) => {
    const servicios  = SERVICIOS_POR_TIPO[tipo] || [];
    const subtotal   = calcularSubtotalPorTipo(tipo);
    const colorClass = TIPO_PRODUCTO_COLOR[tipo] || 'bg-slate-100 text-slate-700 border-slate-200';
    const expanded   = seccionesExpandidas[tipo] !== false;

    return (
      <div key={tipo} className="border border-slate-200 rounded-xl overflow-hidden">
        <button type="button" onClick={() => toggleSeccion(tipo)}
          className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-3">
            <DollarSign size={18} className="text-blue-500" />
            <span className="font-semibold text-slate-700">
              Costos de Servicios — {TIPO_PRODUCTO_LABEL[tipo]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
              {TIPO_PRODUCTO_LABEL[tipo]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {subtotal > 0 && (
              <span className="text-sm font-bold text-blue-700">S/ {subtotal.toFixed(2)}</span>
            )}
            {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </div>
        </button>

        {expanded && (
          <div className="p-5 bg-white space-y-2">
            {tipo === 'farmaceutico' && (
              <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg mb-3 border border-slate-100">
                {['categoria1','categoria2'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" name={cat} checked={formData[cat]} onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                    <span className="font-medium">{cat === 'categoria1' ? 'Categoría 1' : 'Categoría 2'}</span>
                  </label>
                ))}
              </div>
            )}
            {servicios.map(renderServiceRow)}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/documentos')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Nuevo Documento Contable</h1>
          <p className="text-slate-500 text-sm mt-1">
            {ordenRef ? `Generado desde ${ordenRef}` : 'Crear documento contable manualmente'}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Registrado por</label>
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
            <Receipt size={18} className="text-blue-500" />Tipo de Documento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIPOS_DOCUMENTO.map(td => (
              <button key={td.value} type="button" onClick={() => setTipoDocumento(td.value)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  tipoDocumento === td.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                }`}>
                <FileText size={24} className="mb-2" />
                <span className="font-semibold text-sm text-center">{td.label}</span>
                <span className="text-xs mt-1 opacity-70">{td.prefijo}-XXXXX</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">El número correlativo se asignará automáticamente al guardar.</p>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* FLUJO A: Desde una orden de servicio                          */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {desdeOrden ? (
          <>
            {/* ── Datos del cliente (solo lectura) ── */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
                <User size={18} className="text-blue-500" />Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Razón Social</label>
                  <input type="text" value={clienteSeleccionado?.razon_social || ''} disabled className={disabledCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RUC</label>
                  <input type="text" value={clienteSeleccionado?.ruc || ''} disabled className={disabledCls} />
                </div>
              </div>
            </div>

            {/* ── Productos de la Orden ── */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
                <Package size={18} className="text-blue-500" />
                Productos de {ordenRef} ({ordenProductos.length} producto{ordenProductos.length !== 1 ? 's' : ''})
              </h2>

              <div className="space-y-3">
                {ordenProductos.map((prod, idx) => {
                  const esBio    = prod.tipo_producto === 'biologico';
                  const colorCls = TIPO_PRODUCTO_COLOR[prod.tipo_producto] || 'bg-slate-100 text-slate-700 border-slate-200';
                  return (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{prod.producto_nombre || '-'}</p>
                          <p className="text-xs text-slate-500 font-mono">{prod.producto_registro || '-'}</p>
                          {prod.cpb_numero && <p className="text-xs text-slate-500">CPB N°: {prod.cpb_numero}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorCls}`}>
                          {TIPO_PRODUCTO_LABEL[prod.tipo_producto]}
                        </span>
                        {!esBio && prod.monto && (
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-sm">
                            S/ {parseFloat(prod.monto).toFixed(2)}
                          </span>
                        )}
                        {esBio && (
                          <span className="text-xs text-slate-400 italic">Sin monto</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal de la orden */}
              {montoOrden > 0 && (
                <div className="mt-4 flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                  <span className="text-sm font-medium text-amber-800">Subtotal de montos de la orden</span>
                  <span className="text-xl font-bold text-amber-700">S/ {montoOrden.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* ── Secciones de costos por tipo presente en la orden ── */}
            {tiposPresentes.map(tipo => renderSeccionCostos(tipo))}
          </>
        ) : (
          /* ══════════════════════════════════════════════════════════════ */
          /* FLUJO B: Documento manual (sin orden)                         */
          /* ══════════════════════════════════════════════════════════════ */
          <>
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
                <Package size={18} className="text-blue-500" />Datos Generales
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Producto</label>
                <select value={tipoProducto} onChange={(e) => {
                  setTipoProducto(e.target.value);
                  setProductoSeleccionado(null);
                  setFormData(prev => ({ ...prev, producto_id: '' }));
                  setBusquedaProducto('');
                }} className={`${inputCls} bg-white max-w-xs`}>
                  <option value="farmaceutico">Farmacéutico</option>
                  <option value="dispositivo_medico">Dispositivo Médico</option>
                  <option value="biologico">Producto Biológico</option>
                </select>
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Costos según tipo seleccionado */}
            {renderSeccionCostos(tipoProducto)}
          </>
        )}

        {/* ── DERECHO DE TRÁMITE Y PDF ── */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <FileText size={18} className="text-blue-500" />Derecho de Trámite (Tasa de Salud)
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
          <h2 className="text-lg font-semibold mb-5 opacity-90">Resumen de Totales</h2>
          <div className="space-y-3">
            {/* Desglose por tipo */}
            {desdeOrden && tiposPresentes.map(tipo => {
              const monto    = calcularMontoPorTipo(tipo);
              const subtotal = calcularSubtotalPorTipo(tipo);
              if (monto === 0 && subtotal === 0) return null;
              return (
                <div key={tipo} className="bg-white/10 rounded-lg px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">{TIPO_PRODUCTO_LABEL[tipo]}</p>
                  {monto > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-80">Monto de la orden</span>
                      <span>S/ {monto.toFixed(2)}</span>
                    </div>
                  )}
                  {subtotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-80">Costos de servicios</span>
                      <span>S/ {subtotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Cuando NO viene de orden */}
            {!desdeOrden && subtotalDoc > 0 && (
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-2">
                <span className="text-sm opacity-90">Subtotal Costos de Servicios</span>
                <span className="font-semibold">S/ {subtotalDoc.toFixed(2)}</span>
              </div>
            )}

            {formData.derecho_tramite_monto && (
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-2">
                <span className="text-sm opacity-90">Derecho de Trámite</span>
                <span className="font-semibold">S/ {parseFloat(formData.derecho_tramite_monto || 0).toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-white/30 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold">TOTAL</span>
              <span className="text-3xl font-bold">S/ {totalFinal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {(!formData.cliente_id || !formData.producto_id) && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <ul className="text-sm text-amber-700 space-y-1">
                {!formData.cliente_id  && <li>✗ Selecciona un cliente</li>}
                {!formData.producto_id && <li>✗ Selecciona un producto</li>}
              </ul>
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
            {loading
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Guardando...</>
              : <><Save size={18} />Guardar Documento</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoDocumento;

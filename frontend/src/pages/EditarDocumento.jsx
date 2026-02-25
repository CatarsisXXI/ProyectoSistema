import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Save, ArrowLeft, Loader2, Calendar, User, AlertCircle,
  Package, DollarSign, FileText, Upload, Receipt,
  ChevronDown, ChevronUp
} from 'lucide-react';

const TIPOS_DOC_LABEL = {
  factura:             'Factura',
  factura_electronica: 'Factura Electrónica',
  boleta:              'Boleta',
  nota_credito:        'Nota de Crédito',
};
const TIPOS_DOC_COLOR = {
  factura:             'bg-blue-100 text-blue-800 border-blue-200',
  factura_electronica: 'bg-purple-100 text-purple-800 border-purple-200',
  boleta:              'bg-emerald-100 text-emerald-800 border-emerald-200',
  nota_credito:        'bg-orange-100 text-orange-800 border-orange-200',
};
const TIPO_PRODUCTO_LABEL = {
  farmaceutico:       'Farmacéutico',
  dispositivo_medico: 'Dispositivo Médico',
  biologico:          'Producto Biológico',
};
const TIPO_PRODUCTO_COLOR = {
  farmaceutico:       'bg-blue-100 text-blue-800 border-blue-200',
  dispositivo_medico: 'bg-purple-100 text-purple-800 border-purple-200',
  biologico:          'bg-emerald-100 text-emerald-800 border-emerald-200',
};
const TIPO_PRODUCTO_BG = {
  farmaceutico:       'bg-blue-50 border-blue-200',
  dispositivo_medico: 'bg-purple-50 border-purple-200',
  biologico:          'bg-emerald-50 border-emerald-200',
};

const SERVICIOS = {
  farmaceutico: [
    { key: 'cambio_mayor', label: 'Cambio Mayor'  },
    { key: 'cambio_menor', label: 'Cambio Menor'  },
    { key: 'inscripcion',  label: 'Inscripción'   },
    { key: 'renovacion',   label: 'Renovación'    },
    { key: 'traduccion',   label: 'Traducción'    },
  ],
  dispositivo_medico: [
    { key: 'clase1',     label: 'Clase 1'     },
    { key: 'clase2',     label: 'Clase 2'     },
    { key: 'clase3',     label: 'Clase 3'     },
    { key: 'clase4',     label: 'Clase 4'     },
    { key: 'traduccion', label: 'Traducción'  },
  ],
  biologico: [
    { key: 'vaccines_inmunologicos', label: 'Vacunas e Inmunológicos' },
    { key: 'otros_biologicos',       label: 'Otros Biológicos'        },
    { key: 'bioequivalente',         label: 'Bioequivalente'          },
    { key: 'biotecnologico',         label: 'Biotecnológico'          },
    { key: 'traduccion',             label: 'Traducción'              },
  ],
};

const inputCls    = "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
const disabledCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed";

function EditarDocumento() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // Datos que NO cambian (del servidor)
  const [tipoDocumento,    setTipoDocumento]    = useState('factura');
  const [numeroDocumento,  setNumeroDocumento]  = useState('');
  const [usuarioNombre,    setUsuarioNombre]    = useState('');
  const [fechaCreacion,    setFechaCreacion]    = useState('');
  const [ordenId,          setOrdenId]          = useState(null);
  const [montoOrden,       setMontoOrden]       = useState(0);
  const [ordenProductos,   setOrdenProductos]   = useState([]);

  const [tipoProducto, setTipoProducto] = useState('farmaceutico');
  const [desdeOrden,   setDesdeOrden]   = useState(false);

  const [clientes,  setClientes]  = useState([]);
  const [productos, setProductos] = useState([]);
  const [busquedaRUC,     setBusquedaRUC]     = useState('');
  const [busquedaProducto,setBusquedaProducto]= useState('');
  const [clienteSeleccionado,  setClienteSeleccionado]  = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarCli, setMostrarCli] = useState(false);
  const [mostrarProd,setMostrarProd]= useState(false);
  const [pdfAdjunto, setPdfAdjunto] = useState(null);
  const [pdfActual,  setPdfActual]  = useState('');

  // Secciones colapsables
  const [seccionesExpandidas, setSeccionesExpandidas] = useState({});

  const [formData, setFormData] = useState({
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

  useEffect(() => { fetchClientes(); fetchDocumento(); }, [id]);
  useEffect(() => { if (!desdeOrden) fetchProductos(); }, [tipoProducto, desdeOrden]);

  const fetchDocumento = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/documentos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;

      setTipoDocumento(data.tipo_documento || 'factura');
      setNumeroDocumento(data.numero_documento || '');
      // usuario_nombre viene del JOIN con usuarios en el backend
      setUsuarioNombre(data.usuario_nombre || '-');
      setFechaCreacion(data.created_at || '');
      setOrdenId(data.orden_id || null);
      setMontoOrden(parseFloat(data.monto_orden) || 0);
      setOrdenProductos(data.orden_productos || []);
      setDesdeOrden(!!data.orden_id);

      const tipo = data.tipo_producto || 'farmaceutico';
      setTipoProducto(tipo);

      if (data.orden_id) {
        const tipos = [...new Set((data.orden_productos || []).map(p => p.tipo_producto))];
        const exp = {};
        tipos.forEach(t => { exp[t] = true; });
        setSeccionesExpandidas(exp);
      } else {
        setSeccionesExpandidas({ [tipo]: true });
      }

      setPdfActual(data.pdf_adjunto || '');
      setClienteSeleccionado({ id: data.cliente_id, razon_social: data.cliente, ruc: data.ruc });
      setBusquedaRUC(data.ruc || '');
      setProductoSeleccionado({ id: data.producto_id, nombre_producto: data.producto_nombre, codigo_registro: data.producto_registro });
      setBusquedaProducto(data.producto_nombre || '');

      setFormData({
        cliente_id:  data.cliente_id,
        producto_id: data.producto_id,
        categoria1: Boolean(data.categoria1), categoria2: Boolean(data.categoria2),
        cambio_mayor: Boolean(data.cambio_mayor), cambio_mayor_costo: data.cambio_mayor_costo || '', cambio_mayor_moneda: data.cambio_mayor_moneda || 'soles',
        cambio_menor: Boolean(data.cambio_menor), cambio_menor_costo: data.cambio_menor_costo || '', cambio_menor_moneda: data.cambio_menor_moneda || 'soles',
        inscripcion:  Boolean(data.inscripcion),  inscripcion_costo:  data.inscripcion_costo  || '', inscripcion_moneda:  data.inscripcion_moneda  || 'soles',
        renovacion:   Boolean(data.renovacion),   renovacion_costo:   data.renovacion_costo   || '', renovacion_moneda:   data.renovacion_moneda   || 'soles',
        traduccion:   Boolean(data.traduccion),   traduccion_costo:   data.traduccion_costo   || '', traduccion_moneda:   data.traduccion_moneda   || 'soles',
        clase1: Boolean(data.clase1), clase1_costo: data.clase1_costo || '', clase1_moneda: data.clase1_moneda || 'soles',
        clase2: Boolean(data.clase2), clase2_costo: data.clase2_costo || '', clase2_moneda: data.clase2_moneda || 'soles',
        clase3: Boolean(data.clase3), clase3_costo: data.clase3_costo || '', clase3_moneda: data.clase3_moneda || 'soles',
        clase4: Boolean(data.clase4), clase4_costo: data.clase4_costo || '', clase4_moneda: data.clase4_moneda || 'soles',
        vaccines_inmunologicos: Boolean(data.vaccines_inmunologicos), vaccines_inmunologicos_costo: data.vaccines_inmunologicos_costo || '', vaccines_inmunologicos_moneda: data.vaccines_inmunologicos_moneda || 'soles',
        otros_biologicos:       Boolean(data.otros_biologicos),       otros_biologicos_costo:       data.otros_biologicos_costo       || '', otros_biologicos_moneda:       data.otros_biologicos_moneda       || 'soles',
        bioequivalente:         Boolean(data.bioequivalente),         bioequivalente_costo:         data.bioequivalente_costo         || '', bioequivalente_moneda:         data.bioequivalente_moneda         || 'soles',
        biotecnologico:         Boolean(data.biotecnologico),         biotecnologico_costo:         data.biotecnologico_costo         || '', biotecnologico_moneda:         data.biotecnologico_moneda         || 'soles',
        derecho_tramite_cpb:   data.derecho_tramite_cpb   || '',
        derecho_tramite_monto: data.derecho_tramite_monto || '',
      });
    } catch {
      setError('Error al cargar los datos del documento');
    } finally {
      setLoading(false);
    }
  };

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
      const ep = tipoProducto === 'farmaceutico' ? '/api/productos/farmaceuticos'
        : tipoProducto === 'dispositivo_medico'  ? '/api/productos/dispositivos'
        : '/api/productos/biologicos';
      const res = await axios.get(ep, { headers: { Authorization: `Bearer ${token}` } });
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch { setProductos([]); }
  };

  const seleccionarCliente = (c) => {
    setClienteSeleccionado(c);
    setFormData(prev => ({ ...prev, cliente_id: c.id }));
    setBusquedaRUC(c.ruc);
    setMostrarCli(false);
  };
  const seleccionarProducto = (p) => {
    setProductoSeleccionado(p);
    setFormData(prev => ({ ...prev, producto_id: p.id }));
    setBusquedaProducto(p.nombre_producto);
    setMostrarProd(false);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const toggleSeccion = (tipo) =>
    setSeccionesExpandidas(prev => ({ ...prev, [tipo]: !prev[tipo] }));

  // ── Cálculos ──
  const calcularSubtotalTipo = (tipo) => {
    let t = 0;
    const s = (chk, val) => { if (chk && val) t += parseFloat(val) || 0; };
    (SERVICIOS[tipo] || []).forEach(item => s(formData[item.key], formData[`${item.key}_costo`]));
    return t;
  };

  const calcularSubtotalDoc = () => {
    let t = 0;
    const s = (chk, val) => { if (chk && val) t += parseFloat(val) || 0; };
    Object.values(SERVICIOS).flat().forEach(item => s(formData[item.key], formData[`${item.key}_costo`]));
    if (formData.derecho_tramite_monto) t += parseFloat(formData.derecho_tramite_monto) || 0;
    return t;
  };

  const calcularTotal = () => (montoOrden + calcularSubtotalDoc()).toFixed(2);

  const calcularMontoPorTipo = (tipo) =>
    ordenProductos
      .filter(p => p.tipo_producto === tipo && p.tipo_producto !== 'biologico' && p.monto)
      .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      let pdfFilename = pdfActual;
      if (pdfAdjunto) {
        const fd = new FormData();
        fd.append('pdf', pdfAdjunto);
        const up = await axios.post('/api/documentos/upload', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        pdfFilename = up.data.filename;
      }
      await axios.put(`/api/documentos/${id}`, {
        tipo_producto: tipoProducto,
        monto_orden:   montoOrden,
        orden_id:      ordenId,
        ...formData,
        pdf_adjunto: pdfFilename
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Documento actualizado correctamente');
      setTimeout(() => navigate('/documentos'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar documento');
    } finally {
      setSaving(false);
    }
  };

  const filteredCli  = clientes.filter(c =>
    c.ruc?.toLowerCase().includes(busquedaRUC.toLowerCase()) ||
    c.razon_social?.toLowerCase().includes(busquedaRUC.toLowerCase())
  );
  const filteredProd = productos.filter(p =>
    p.nombre_producto?.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const fmtFecha = (f) => {
    if (!f) return '-';
    return new Date(f).toLocaleDateString('es-ES', { year:'numeric', month:'2-digit', day:'2-digit' });
  };

  // ── Render fila de servicio ──
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

  // ── Sección colapsable de costos por tipo ──
  const renderSeccionCostos = (tipo) => {
    const servicios = SERVICIOS[tipo] || [];
    const subtotal  = calcularSubtotalTipo(tipo);
    const expanded  = seccionesExpandidas[tipo] !== false;
    const colorCls  = TIPO_PRODUCTO_COLOR[tipo] || 'bg-slate-100 text-slate-700 border-slate-200';

    return (
      <div key={tipo} className="border border-slate-200 rounded-xl overflow-hidden">
        <button type="button" onClick={() => toggleSeccion(tipo)}
          className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-3">
            <DollarSign size={18} className="text-blue-500" />
            <span className="font-semibold text-slate-700">
              Costos de Servicios — {TIPO_PRODUCTO_LABEL[tipo]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorCls}`}>
              {TIPO_PRODUCTO_LABEL[tipo]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {subtotal > 0 && <span className="text-sm font-bold text-blue-700">S/ {subtotal.toFixed(2)}</span>}
            {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </div>
        </button>
        {expanded && (
          <div className="p-5 bg-white space-y-2">
            {tipo === 'farmaceutico' && (
              <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3">
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

  // ─────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando documento...</p>
      </div>
    </div>
  );

  const subtotalDoc = calcularSubtotalDoc();
  const totalFinal  = parseFloat(calcularTotal());
  const tiposPresentes = desdeOrden
    ? [...new Set(ordenProductos.map(p => p.tipo_producto))]
    : [tipoProducto];

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/documentos" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-slate-800">Editar Documento</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${TIPOS_DOC_COLOR[tipoDocumento] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {TIPOS_DOC_LABEL[tipoDocumento] || tipoDocumento}
            </span>
          </div>
          {numeroDocumento && <p className="text-blue-700 font-bold text-lg mt-1">{numeroDocumento}</p>}
        </div>
      </div>

      {/* Datos de solo lectura */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Información del Documento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento</label>
            <div className="relative">
              <Receipt size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={TIPOS_DOC_LABEL[tipoDocumento] || tipoDocumento} disabled className={`${disabledCls} pl-10`} />
            </div>
            <p className="text-xs text-slate-400 mt-1">No se puede cambiar tras guardar</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Registro</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={fmtFecha(fechaCreacion)} disabled className={`${disabledCls} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Registrado por</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={usuarioNombre} disabled className={`${disabledCls} pl-10`} />
            </div>
          </div>
        </div>
      </div>

      {error   && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center gap-2"><AlertCircle size={18}/>{error}</div>}
      {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2"><div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ─────────── FLUJO A: desde una orden ─────────── */}
        {desdeOrden ? (
          <>
            {/* Cliente (solo lectura) */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
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

            {/* Productos de la orden */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
                <Package size={18} className="text-blue-500" />
                Productos de la Orden #{ordenId} ({ordenProductos.length})
              </h2>
              <div className="space-y-3">
                {ordenProductos.map((prod, idx) => {
                  const esBio   = prod.tipo_producto === 'biologico';
                  const bgCls   = TIPO_PRODUCTO_BG[prod.tipo_producto]     || 'bg-slate-50 border-slate-200';
                  const badgeCls= TIPO_PRODUCTO_COLOR[prod.tipo_producto]  || 'bg-slate-100 text-slate-700 border-slate-200';
                  return (
                    <div key={idx} className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border ${bgCls}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{prod.producto_nombre || '-'}</p>
                          <p className="text-xs text-slate-500 font-mono">{prod.producto_registro || '-'}</p>
                          {prod.cpb_numero && <p className="text-xs text-slate-500">CPB N°: {prod.cpb_numero}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeCls}`}>
                          {TIPO_PRODUCTO_LABEL[prod.tipo_producto]}
                        </span>
                        {!esBio && prod.monto && (
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-sm">
                            S/ {parseFloat(prod.monto).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {montoOrden > 0 && (
                <div className="mt-4 flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                  <span className="text-sm font-semibold text-amber-800">Subtotal montos de la orden</span>
                  <span className="text-xl font-bold text-amber-700">S/ {montoOrden.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Costos por tipo presente */}
            {tiposPresentes.map(tipo => renderSeccionCostos(tipo))}
          </>
        ) : (
          /* ─────────── FLUJO B: documento manual ─────────── */
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
                  setSeccionesExpandidas({ [e.target.value]: true });
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
                    onChange={(e) => { setBusquedaRUC(e.target.value); setMostrarCli(true); }}
                    onFocus={() => busquedaRUC && setMostrarCli(true)}
                    placeholder="RUC o nombre" className={inputCls} />
                  {mostrarCli && busquedaRUC && filteredCli.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-64 overflow-y-auto">
                      {filteredCli.map(c => (
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
                    onChange={(e) => { setBusquedaProducto(e.target.value); setMostrarProd(true); }}
                    onFocus={() => busquedaProducto && setMostrarProd(true)}
                    placeholder="Nombre del producto" className={inputCls} />
                  {mostrarProd && busquedaProducto && filteredProd.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 border border-slate-200 rounded-lg shadow-xl bg-white z-20 max-h-64 overflow-y-auto">
                      {filteredProd.map(p => (
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

            {renderSeccionCostos(tipoProducto)}
          </>
        )}

        {/* Derecho de Trámite y PDF */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
            <FileText size={18} className="text-blue-500" />Derecho de Trámite (Tasa de Salud)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPB N°</label>
              <input type="text" name="derecho_tramite_cpb" value={formData.derecho_tramite_cpb} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto S/.</label>
              <input type="number" name="derecho_tramite_monto" value={formData.derecho_tramite_monto} onChange={handleChange} step="0.01" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Archivo Adjunto (PDF)</label>
              <input type="file" accept=".pdf" onChange={(e) => setPdfAdjunto(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
              {pdfAdjunto && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Upload size={12}/> {pdfAdjunto.name}</p>}
              {pdfActual && !pdfAdjunto && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><FileText size={12}/> PDF actual: {pdfActual}</p>}
            </div>
          </div>
        </div>

        {/* Resumen Total */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-5 opacity-90">Resumen de Totales</h2>
          <div className="space-y-3">
            {desdeOrden && tiposPresentes.map(tipo => {
              const mo  = calcularMontoPorTipo(tipo);
              const sub = calcularSubtotalTipo(tipo);
              if (mo === 0 && sub === 0) return null;
              return (
                <div key={tipo} className="bg-white/10 rounded-lg px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">{TIPO_PRODUCTO_LABEL[tipo]}</p>
                  {mo > 0  && <div className="flex justify-between text-sm"><span className="opacity-80">Monto de la orden</span><span>S/ {mo.toFixed(2)}</span></div>}
                  {sub > 0 && <div className="flex justify-between text-sm"><span className="opacity-80">Costos de servicios</span><span>S/ {sub.toFixed(2)}</span></div>}
                </div>
              );
            })}
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
          <Link to="/documentos" className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Cancelar
          </Link>
          <button type="submit" disabled={saving || !formData.cliente_id || !formData.producto_id}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]">
            {saving
              ? <><Loader2 size={18} className="animate-spin" />Guardando...</>
              : <><Save size={18} />Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarDocumento;

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Search, Calendar, User, Eye,
  Pencil, FileText, Filter, Receipt
} from 'lucide-react';

const TIPOS_DOC_LABEL = {
  factura:             'Factura',
  factura_electronica: 'Factura Electrónica',
  boleta:              'Boleta',
  nota_credito:        'Nota de Crédito',
};
const TIPOS_DOC_COLOR = {
  factura:             'bg-blue-100 text-blue-800',
  factura_electronica: 'bg-purple-100 text-purple-800',
  boleta:              'bg-emerald-100 text-emerald-800',
  nota_credito:        'bg-orange-100 text-orange-800',
};
const TIPOS_PROD_LABEL = {
  farmaceutico:       'Farmacéutico',
  dispositivo_medico: 'Dispositivo Médico',
  biologico:          'Biológico',
};
const TIPOS_PROD_COLOR = {
  farmaceutico:       'bg-blue-50 text-blue-700',
  dispositivo_medico: 'bg-purple-50 text-purple-700',
  biologico:          'bg-emerald-50 text-emerald-700',
};

function DocumentosContables() {
  const [documentos,  setDocumentos]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterTipo,  setFilterTipo]  = useState('');   // tipo producto
  const [filterDoc,   setFilterDoc]   = useState('');   // tipo documento
  const location = useLocation();

  const fetchDocumentos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/documentos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching documentos:', error);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocumentos(); }, [location.key]);

  const filteredDocumentos = documentos.filter(d => {
    if (filterTipo && d.tipo_producto   !== filterTipo) return false;
    if (filterDoc  && d.tipo_documento  !== filterDoc)  return false;
    return true;
  });

  // Total = monto_orden + todos los costos del documento
  const calcularTotal = (doc) => {
    let total = parseFloat(doc.monto_orden) || 0;
    const s = (chk, val) => { if (chk && val) total += parseFloat(val) || 0; };
    s(doc.cambio_mayor,           doc.cambio_mayor_costo);
    s(doc.cambio_menor,           doc.cambio_menor_costo);
    s(doc.inscripcion,            doc.inscripcion_costo);
    s(doc.renovacion,             doc.renovacion_costo);
    s(doc.clase1,                 doc.clase1_costo);
    s(doc.clase2,                 doc.clase2_costo);
    s(doc.clase3,                 doc.clase3_costo);
    s(doc.clase4,                 doc.clase4_costo);
    s(doc.vaccines_inmunologicos, doc.vaccines_inmunologicos_costo);
    s(doc.otros_biologicos,       doc.otros_biologicos_costo);
    s(doc.bioequivalente,         doc.bioequivalente_costo);
    s(doc.biotecnologico,         doc.biotecnologico_costo);
    s(doc.traduccion,             doc.traduccion_costo);
    if (doc.derecho_tramite_monto) total += parseFloat(doc.derecho_tramite_monto) || 0;
    return total;
  };

  const formatearFecha = (f) => {
    if (!f) return '-';
    return new Date(f).toLocaleDateString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Cargando documentos...</p>
      </div>
    </div>
  );

  const FilterBtn = ({ value, label, current, onClick }) => (
    <button onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        current === value
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}>
      {label}
    </button>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Documentos Contables</h1>
          <p className="text-slate-500 text-sm mt-1">Facturas, boletas y notas de crédito</p>
        </div>
        <Link to="/documentos/nuevo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
          <Plus size={18} /><span className="font-medium">Nuevo Documento</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">Tipo de documento:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterBtn value="" label="Todos" current={filterDoc} onClick={setFilterDoc} />
            {Object.entries(TIPOS_DOC_LABEL).map(([v, l]) => (
              <FilterBtn key={v} value={v} label={l} current={filterDoc} onClick={setFilterDoc} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">Tipo de producto:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterBtn value="" label="Todos" current={filterTipo} onClick={setFilterTipo} />
            <FilterBtn value="farmaceutico"       label="Farmacéutico"       current={filterTipo} onClick={setFilterTipo} />
            <FilterBtn value="dispositivo_medico" label="Dispositivo Médico" current={filterTipo} onClick={setFilterTipo} />
            <FilterBtn value="biologico"          label="Biológico"          current={filterTipo} onClick={setFilterTipo} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">N° Documento</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo Doc.</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo Prod.</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">RUC</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Orden</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registrado por</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDocumentos.map((doc) => {
                const total = calcularTotal(doc);
                return (
                  <tr key={doc.id} className="group hover:bg-blue-50/40 transition-colors duration-150">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-700 font-mono">{doc.numero_documento || '-'}</div>
                      <div className="text-xs text-slate-400">ID: {doc.id}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TIPOS_DOC_COLOR[doc.tipo_documento] || 'bg-slate-100 text-slate-700'}`}>
                        {TIPOS_DOC_LABEL[doc.tipo_documento] || 'Documento'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TIPOS_PROD_COLOR[doc.tipo_producto] || 'bg-slate-100 text-slate-700'}`}>
                        {TIPOS_PROD_LABEL[doc.tipo_producto] || doc.tipo_producto}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-700 max-w-[160px] truncate">
                      {doc.cliente_nombre}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                      {doc.cliente_ruc}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 max-w-[130px] truncate">
                      {doc.producto_nombre || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {doc.orden_id
                        ? <span className="text-blue-600 font-semibold">#{doc.orden_id}</span>
                        : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-700">
                        S/ {total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[110px]">
                          {doc.usuario_nombre || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {formatearFecha(doc.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <Link to={`/documentos/ver/${doc.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Ver detalles">
                          <Eye size={15} />
                        </Link>
                        <Link to={`/documentos/editar/${doc.id}`}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar">
                          <Pencil size={15} />
                        </Link>
                        {doc.pdf_adjunto && (
                          <a href={`/uploads/documentos/${doc.pdf_adjunto}`} target="_blank" rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Ver PDF">
                            <FileText size={15} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDocumentos.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Search size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay documentos</h3>
            <p className="text-slate-500 text-sm">Crea un nuevo documento o ajusta los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentosContables;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, User, Package, DollarSign, FileText, Download, Eye } from 'lucide-react';

function VerDocumento() {
  const { id } = useParams();
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocumento();
  }, [id]);

  const fetchDocumento = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/documentos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumento(res.data);
    } catch (err) {
      setError('Error al cargar el documento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      farmaceutico: 'Farmacéutico',
      dispositivo_medico: 'Dispositivo Médico',
      biologico: 'Biológico'
    };
    return labels[tipo] || tipo;
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

  const formatearFechaHora = (fechaISO) => {
    if (!fechaISO) return '-';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTotal = () => {
    if (!documento) return 0;
    let total = 0;
    if (documento.cambio_mayor && documento.cambio_mayor_costo) total += parseFloat(documento.cambio_mayor_costo) || 0;
    if (documento.cambio_menor && documento.cambio_menor_costo) total += parseFloat(documento.cambio_menor_costo) || 0;
    if (documento.inscripcion && documento.inscripcion_costo) total += parseFloat(documento.inscripcion_costo) || 0;
    if (documento.renovacion && documento.renovacion_costo) total += parseFloat(documento.renovacion_costo) || 0;
    if (documento.clase1 && documento.clase1_costo) total += parseFloat(documento.clase1_costo) || 0;
    if (documento.clase2 && documento.clase2_costo) total += parseFloat(documento.clase2_costo) || 0;
    if (documento.clase3 && documento.clase3_costo) total += parseFloat(documento.clase3_costo) || 0;
    if (documento.clase4 && documento.clase4_costo) total += parseFloat(documento.clase4_costo) || 0;
    if (documento.vaccines_inmunologicos && documento.vaccines_inmunologicos_costo) total += parseFloat(documento.vaccines_inmunologicos_costo) || 0;
    if (documento.otros_biologicos && documento.otros_biologicos_costo) total += parseFloat(documento.otros_biologicos_costo) || 0;
    if (documento.bioequivalente && documento.bioequivalente_costo) total += parseFloat(documento.bioequivalente_costo) || 0;
    if (documento.biotecnologico && documento.biotecnologico_costo) total += parseFloat(documento.biotecnologico_costo) || 0;
    if (documento.traduccion && documento.traduccion_costo) total += parseFloat(documento.traduccion_costo) || 0;
    if (documento.derecho_tramite_monto) total += parseFloat(documento.derecho_tramite_monto) || 0;
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !documento) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-600">{error || 'Documento no encontrado'}</p>
        <Link to="/documentos" className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a documentos
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Encabezado con botón de volver */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/documentos"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Documento Contable #{documento.id}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {getTipoLabel(documento.tipo_producto)}
            </p>
          </div>
        </div>
        <Link
          to={`/documentos/editar/${documento.id}`}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Package size={18} />
          <span>Editar</span>
        </Link>
      </div>

      {/* Contenido del documento */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">DOCUMENTO CONTABLE</h2>
              <p className="text-blue-100 text-sm">{formatearFechaHora(documento.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">SGR</p>
              <p className="text-xs opacity-75">Sistema de Gestión de Reportes</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cliente */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              Cliente
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Razón Social</p>
                <p className="font-medium">{documento.cliente_nombre || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">RUC</p>
                <p className="font-medium">{documento.cliente_ruc || '-'}</p>
              </div>
            </div>
          </div>

          {/* Producto */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Package size={16} className="text-blue-500" />
              Producto
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Nombre</p>
                <p className="font-medium">{documento.producto_nombre || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Registro Sanitario</p>
                <p className="font-medium font-mono">{documento.producto_registro || '-'}</p>
              </div>
            </div>
          </div>

          {/* Servicios y costos */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <DollarSign size={16} className="text-blue-500" />
              Servicios y Costos
            </div>
            <div className="p-4">
              {documento.tipo_producto === 'farmaceutico' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Categoría 1</p>
                      <p>{documento.categoria1 ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Categoría 2</p>
                      <p>{documento.categoria2 ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: 'cambio_mayor', label: 'Cambio Mayor' },
                      { key: 'cambio_menor', label: 'Cambio Menor' },
                      { key: 'inscripcion', label: 'Inscripción' },
                      { key: 'renovacion', label: 'Renovación' },
                      { key: 'traduccion', label: 'Traducción' }
                    ].map(item => {
                      if (!documento[item.key]) return null;
                      return (
                        <div key={item.key} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                          <span className="font-medium">{item.label}</span>
                          <span>
                            {documento[`${item.key}_costo`] ? 
                              `${documento[`${item.key}_moneda`] === 'soles' ? 'S/' : '$'} ${parseFloat(documento[`${item.key}_costo`]).toFixed(2)}` 
                              : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {documento.tipo_producto === 'dispositivo_medico' && (
                <div className="grid grid-cols-1 gap-3">
                  {[1,2,3,4].map(num => {
                    if (!documento[`clase${num}`]) return null;
                    return (
                      <div key={num} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                        <span className="font-medium">Clase {num}</span>
                        <span>
                          {documento[`clase${num}_costo`] ? 
                            `${documento[`clase${num}_moneda`] === 'soles' ? 'S/' : '$'} ${parseFloat(documento[`clase${num}_costo`]).toFixed(2)}` 
                            : '-'}
                        </span>
                      </div>
                    );
                  })}
                  {documento.traduccion && (
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                      <span className="font-medium">Traducción</span>
                      <span>
                        {documento.traduccion_costo ? 
                          `${documento.traduccion_moneda === 'soles' ? 'S/' : '$'} ${parseFloat(documento.traduccion_costo).toFixed(2)}` 
                          : '-'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {documento.tipo_producto === 'biologico' && (
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'vaccines_inmunologicos', label: 'Vacunas e Inmunológicos' },
                    { key: 'otros_biologicos', label: 'Otros Biológicos' },
                    { key: 'bioequivalente', label: 'Bioequivalente' },
                    { key: 'biotecnologico', label: 'Biotecnológico' }
                  ].map(item => {
                    if (!documento[item.key]) return null;
                    return (
                      <div key={item.key} className="flex justify-between items-center bg-slate-50 p-3 rounded">
                        <span className="font-medium">{item.label}</span>
                        <span>
                          {documento[`${item.key}_costo`] ? 
                            `${documento[`${item.key}_moneda`] === 'soles' ? 'S/' : '$'} ${parseFloat(documento[`${item.key}_costo`]).toFixed(2)}` 
                            : '-'}
                        </span>
                      </div>
                    );
                  })}
                  {documento.traduccion && (
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
                      <span className="font-medium">Traducción</span>
                      <span>
                        {documento.traduccion_costo ? 
                          `${documento.traduccion_moneda === 'soles' ? 'S/' : '$'} ${parseFloat(documento.traduccion_costo).toFixed(2)}` 
                          : '-'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Derecho de trámite */}
              {(documento.derecho_tramite_cpb || documento.derecho_tramite_monto) && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Derecho de Trámite (Tasa de Salud)</span>
                    <div className="text-right">
                      <span className="text-sm text-slate-500 mr-2">{documento.derecho_tramite_cpb || '-'}</span>
                      {documento.derecho_tramite_monto && (
                        <span className="font-semibold">S/ {parseFloat(documento.derecho_tramite_monto).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mt-6 pt-4 border-t-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">TOTAL</span>
                  <span className="text-2xl font-bold text-blue-600">S/ {calcularTotal()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Adjunto */}
          {documento.pdf_adjunto && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                Documento Adjunto
              </div>
              <div className="p-4">
                <a
                  href={`/uploads/documentos/${documento.pdf_adjunto}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye size={18} />
                  <span>Ver PDF adjunto</span>
                  <Download size={16} className="ml-2" />
                </a>
                <p className="text-xs text-slate-500 mt-1">Nombre del archivo: {documento.pdf_adjunto}</p>
              </div>
            </div>
          )}

          {/* Información de registro */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Información del Registro
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Fecha de creación</p>
                <p className="font-medium">{formatearFechaHora(documento.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Registrado por</p>
                <p className="font-medium">{documento.usuario_nombre || 'Usuario'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerDocumento;
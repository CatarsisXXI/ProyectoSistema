import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Users,
  Pill,
  Stethoscope,
  FlaskConical,
  ShoppingCart,
  FileText,
  Activity,
  TrendingUp,
  Package,
  ClipboardList,
} from 'lucide-react';

function Dashboard() {
  const { usuario } = useContext(AuthContext);
  const [stats, setStats] = useState({
    clientes: 0,
    farmaceuticos: 0,
    dispositivos: 0,
    biologicos: 0,
    ordenes: 0,
    documentos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [clientesRes, farmRes, disRes, bioRes, ordenesRes, docsRes] = await Promise.all([
        axios.get('/api/clientes', { headers }),
        axios.get('/api/productos/farmaceuticos', { headers }),
        axios.get('/api/productos/dispositivos', { headers }),
        axios.get('/api/productos/biologicos', { headers }),
        axios.get('/api/ordenes', { headers }),
        axios.get('/api/documentos', { headers })
      ]);

      setStats({
        clientes: clientesRes.data.length,
        farmaceuticos: farmRes.data.length,
        dispositivos: disRes.data.length,
        biologicos: bioRes.data.length,
        ordenes: ordenesRes.data.length,
        documentos: docsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuración de las tarjetas para mantener el código más limpio
  const cards = [
    {
      title: 'Clientes',
      value: stats.clientes,
      icon: Users,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconColor: 'text-blue-500',
      description: 'Total de clientes registrados'
    },
    {
      title: 'Productos Farmacéuticos',
      value: stats.farmaceuticos,
      icon: Pill,
      color: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconColor: 'text-emerald-500',
      description: 'Medicamentos y fármacos'
    },
    {
      title: 'Dispositivos Médicos',
      value: stats.dispositivos,
      icon: Stethoscope,
      color: 'cyan',
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      iconColor: 'text-cyan-500',
      description: 'Equipos e instrumentos'
    },
    {
      title: 'Productos Biológicos',
      value: stats.biologicos,
      icon: FlaskConical,
      color: 'purple',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      iconColor: 'text-purple-500',
      description: 'Vacunas, sueros, etc.'
    },
    {
      title: 'Órdenes de Servicio',
      value: stats.ordenes,
      icon: ShoppingCart,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      iconColor: 'text-amber-500',
      description: 'Órdenes activas y completadas'
    },
    {
      title: 'Documentos Contables',
      value: stats.documentos,
      icon: FileText,
      color: 'indigo',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      iconColor: 'text-indigo-500',
      description: 'Facturas, reportes, etc.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Encabezado con saludo y resumen */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              ¡Hola, {usuario?.nombre_completo?.split(' ')[0] || 'Usuario'}!
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              <span>Bienvenido al panel de control del Sistema de Gestión de Reportes</span>
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <TrendingUp size={20} className="text-blue-500" />
            <span className="text-sm font-medium text-slate-600">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas estadísticas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-300 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.text} mb-1`}>{card.value}</p>
                  <p className="text-xs text-slate-400">{card.description}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                  <card.icon size={24} className={card.iconColor} />
                </div>
              </div>
              {/* Barra de progreso simulada (opcional, solo para decoración) */}
              <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${card.bg.replace('50', '400')} rounded-full`} 
                  style={{ width: `${Math.min(100, (card.value / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección de accesos rápidos o actividad reciente (opcional para mejorar UX) */}
      {!loading && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <ClipboardList size={20} className="text-blue-500" />
              Resumen rápido
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total productos:</span>
                <span className="font-semibold text-slate-700">
                  {stats.farmaceuticos + stats.dispositivos + stats.biologicos}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total órdenes + documentos:</span>
                <span className="font-semibold text-slate-700">
                  {stats.ordenes + stats.documentos}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Clientes activos:</span>
                <span className="font-semibold text-slate-700">{stats.clientes}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-500" />
              Acciones rápidas
            </h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 hover:shadow-sm transition-all active:scale-95">
                Nuevo Cliente
              </button>
              <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 hover:shadow-sm transition-all active:scale-95">
                Nueva Orden
              </button>
              <button className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 hover:shadow-sm transition-all active:scale-95">
                Nuevo Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
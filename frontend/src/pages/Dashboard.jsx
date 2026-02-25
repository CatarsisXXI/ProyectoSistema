import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clientes: 0,
    farmaceuticos: 0,
    dispositivos: 0,
    biologicos: 0,
    ordenes: 0,
    documentos: 0,
  });
  const [loading, setLoading] = useState(true);

  // ── Solo ejecutar cuando el usuario esté disponible ──
  useEffect(() => {
    if (!usuario) return;
    fetchStats();
  }, [usuario]);

  const fetchStats = async () => {
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Hacemos cada petición de forma independiente para que un fallo
    // aislado no detenga el resto del dashboard
    const safeGet = async (url) => {
      try {
        const res = await axios.get(url, { headers });
        return Array.isArray(res.data) ? res.data.length : 0;
      } catch {
        return 0;
      }
    };

    const [clientes, farmaceuticos, dispositivos, biologicos, ordenes, documentos] =
      await Promise.all([
        safeGet('/api/clientes'),
        safeGet('/api/productos/farmaceuticos'),
        safeGet('/api/productos/dispositivos'),
        safeGet('/api/productos/biologicos'),
        safeGet('/api/ordenes'),
        safeGet('/api/documentos'),
      ]);

    setStats({ clientes, farmaceuticos, dispositivos, biologicos, ordenes, documentos });
    setLoading(false);
  };

  const cards = [
    {
      title: 'Clientes',
      value: stats.clientes,
      icon: Users,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconColor: 'text-blue-500',
      barColor: 'bg-blue-400',
      description: 'Total de clientes registrados',
      href: '/clientes',
    },
    {
      title: 'Productos Farmacéuticos',
      value: stats.farmaceuticos,
      icon: Pill,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconColor: 'text-emerald-500',
      barColor: 'bg-emerald-400',
      description: 'Medicamentos y fármacos',
      href: '/productos/farmaceuticos',
    },
    {
      title: 'Dispositivos Médicos',
      value: stats.dispositivos,
      icon: Stethoscope,
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      iconColor: 'text-cyan-500',
      barColor: 'bg-cyan-400',
      description: 'Equipos e instrumentos',
      href: '/productos/dispositivos',
    },
    {
      title: 'Productos Biológicos',
      value: stats.biologicos,
      icon: FlaskConical,
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      iconColor: 'text-purple-500',
      barColor: 'bg-purple-400',
      description: 'Vacunas, sueros, etc.',
      href: '/productos/biologicos',
    },
    {
      title: 'Órdenes de Servicio',
      value: stats.ordenes,
      icon: ShoppingCart,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      iconColor: 'text-amber-500',
      barColor: 'bg-amber-400',
      description: 'Órdenes activas y completadas',
      href: '/ordenes',
    },
    {
      title: 'Documentos Contables',
      value: stats.documentos,
      icon: FileText,
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      iconColor: 'text-indigo-500',
      barColor: 'bg-indigo-400',
      description: 'Facturas, boletas, etc.',
      href: '/documentos',
    },
  ];

  const maxValue = Math.max(...cards.map((c) => c.value), 1);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
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
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-300 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.href)}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100
                         hover:shadow-md hover:border-slate-200 transition-all duration-200
                         hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.text} mb-1`}>{card.value}</p>
                  <p className="text-xs text-slate-400">{card.description}</p>
                </div>
                <div
                  className={`${card.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}
                >
                  <card.icon size={24} className={card.iconColor} />
                </div>
              </div>
              {/* Barra proporcional al valor más alto */}
              <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${card.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(4, (card.value / maxValue) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paneles inferiores */}
      {!loading && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen rápido */}
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
                <span className="text-slate-500">Órdenes + Documentos:</span>
                <span className="font-semibold text-slate-700">
                  {stats.ordenes + stats.documentos}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Clientes registrados:</span>
                <span className="font-semibold text-slate-700">{stats.clientes}</span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-500" />
              Acciones rápidas
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/clientes/nuevo')}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium
                           hover:bg-blue-100 hover:shadow-sm transition-all active:scale-95"
              >
                Nuevo Cliente
              </button>
              <button
                onClick={() => navigate('/ordenes/nuevo')}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium
                           hover:bg-emerald-100 hover:shadow-sm transition-all active:scale-95"
              >
                Nueva Orden
              </button>
              <button
                onClick={() => navigate('/documentos/nuevo')}
                className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium
                           hover:bg-amber-100 hover:shadow-sm transition-all active:scale-95"
              >
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

import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Pill,
  Stethoscope,
  FlaskConical,
  ShoppingCart,
  PlusCircle,
  FileText,
  FilePlus,
  BarChart3,
  LogOut,
} from 'lucide-react';

function Sidebar() {
  const { usuario, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Cabecera con logo e indicador de sector salud */}
      <div className="p-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
          SGR<span className="text-blue-400">+</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Sistema de Gestión de Reportes
        </p>
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Sector Salud
        </p>
      </div>

      {/* Navegación con scroll personalizado */}
      <nav className="flex-1 overflow-y-auto py-5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400">
        {/* Sección Principal */}
        <div className="px-5 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Principal
          </span>
        </div>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <LayoutDashboard
            size={18}
            className="transition-colors text-blue-500 group-hover:text-blue-600"
          />
          <span className="text-sm font-medium">Dashboard</span>
        </NavLink>

        {/* Sección Clientes */}
        <div className="px-5 mt-6 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Clientes
          </span>
        </div>
        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <Users size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Lista de Clientes</span>
        </NavLink>
        <NavLink
          to="/clientes/nuevo"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <UserPlus size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Nuevo Cliente</span>
        </NavLink>

        {/* Sección Productos */}
        <div className="px-5 mt-6 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Productos
          </span>
        </div>
        <NavLink
          to="/productos/farmaceuticos"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <Pill size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Farmacéuticos</span>
        </NavLink>
        <NavLink
          to="/productos/dispositivos"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <Stethoscope size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Dispositivos Médicos</span>
        </NavLink>
        <NavLink
          to="/productos/biologicos"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <FlaskConical size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Productos Biológicos</span>
        </NavLink>

        {/* Sección Órdenes */}
        <div className="px-5 mt-6 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Órdenes
          </span>
        </div>
        <NavLink
          to="/ordenes"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <ShoppingCart size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Lista de Órdenes</span>
        </NavLink>
        <NavLink
          to="/ordenes/nuevo"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <PlusCircle size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Nueva Orden</span>
        </NavLink>

        {/* Sección Documentos */}
        <div className="px-5 mt-6 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Documentos
          </span>
        </div>
        <NavLink
          to="/documentos"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <FileText size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Lista de Documentos</span>
        </NavLink>
        <NavLink
          to="/documentos/nuevo"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <FilePlus size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Nuevo Documento</span>
        </NavLink>

        {/* Sección Reportes */}
        <div className="px-5 mt-6 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reportes
          </span>
        </div>
        <NavLink
          to="/reportes"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-5 py-2.5 mx-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            }`
          }
        >
          <BarChart3 size={18} className="transition-colors text-blue-500 group-hover:text-blue-600" />
          <span className="text-sm font-medium">Reporte Contabilidad</span>
        </NavLink>
      </nav>

      {/* Pie con información de usuario y botón de logout */}
      <div className="p-5 border-t border-slate-200 bg-slate-50/80">
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-700">
            {usuario?.nombre_completo}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{usuario?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] group"
        >
          <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
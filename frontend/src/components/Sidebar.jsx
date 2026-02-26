import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function Sidebar({ expanded = true, onToggle }) {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definición de los elementos de navegación
  const navItems = [
    { section: 'Principal', items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }] },
    { 
      section: 'Clientes', 
      items: [
        { to: '/clientes', icon: Users, label: 'Lista de Clientes' },
        { to: '/clientes/nuevo', icon: UserPlus, label: 'Nuevo Cliente' }
      ] 
    },
    { 
      section: 'Productos', 
      items: [
        { to: '/productos/farmaceuticos', icon: Pill, label: 'Farmacéuticos' },
        { to: '/productos/dispositivos', icon: Stethoscope, label: 'Dispositivos Médicos' },
        { to: '/productos/biologicos', icon: FlaskConical, label: 'Productos Biológicos' }
      ] 
    },
    { 
      section: 'Órdenes', 
      items: [
        { to: '/ordenes', icon: ShoppingCart, label: 'Lista de Órdenes' },
        { to: '/ordenes/nuevo', icon: PlusCircle, label: 'Nueva Orden' }
      ] 
    },
    { 
      section: 'Documentos', 
      items: [
        { to: '/documentos', icon: FileText, label: 'Lista de Documentos' },
        { to: '/documentos/nuevo', icon: FilePlus, label: 'Nuevo Documento' }
      ] 
    },
    { section: 'Reportes', items: [{ to: '/reportes', icon: BarChart3, label: 'Reporte Contabilidad' }] },
  ];

  const NavItem = ({ to, icon: Icon, label }) => {
    const isHovered = hoveredItem === label;
    
    return (
      <div className="relative group">
        <NavLink
          to={to}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 mx-2 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-sm active:scale-[0.98]'
            } ${expanded ? 'py-2.5' : 'py-3 justify-center'}`
          }
          onMouseEnter={() => setHoveredItem(label)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Icon size={18} className="transition-colors text-blue-500 group-hover:text-blue-600 flex-shrink-0" />
          {expanded && <span className="text-sm font-medium truncate">{label}</span>}
        </NavLink>
        
        {/* Tooltip para cuando está contraído */}
        {!expanded && isHovered && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-50">
            {label}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm transition-all duration-300 ${expanded ? 'w-64' : 'w-16'}`}>
      {/* Cabecera con logo e indicador de sector salud */}
      <div className={`p-4 border-b border-slate-200 ${expanded ? '' : 'flex justify-center'}`}>
        {expanded ? (
          <>
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
          </>
        ) : (
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
            SGR<span className="text-blue-400">+</span>
          </h1>
        )}
      </div>

      {/* Botón toggle dentro del sidebar */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 p-1 bg-white border border-slate-200 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 z-10"
      >
        {expanded ? <ChevronLeft size={14} className="text-slate-600" /> : <ChevronRight size={14} className="text-slate-600" />}
      </button>

      {/* Navegación con scroll personalizado */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400">
        {navItems.map((section) => (
          <div key={section.section}>
            {expanded ? (
              <div className="px-4 mb-2 mt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.section}
                </span>
              </div>
            ) : (
              <div className="border-b border-slate-200 my-2 mx-2" />
            )}
            {section.items.map((item) => (
              <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
          </div>
        ))}
      </nav>

      {/* Pie con información de usuario y botón de logout */}
      <div className={`p-3 border-t border-slate-200 bg-slate-50/80 ${expanded ? '' : 'flex flex-col items-center'}`}>
        {expanded ? (
          <>
            <div className="mb-2">
              <p className="text-sm font-semibold text-slate-700 truncate">{usuario?.nombre_completo}</p>
              <p className="text-xs text-slate-500 mt-0.5">{usuario?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] group"
            >
              <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="p-2 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-xl transition-all duration-200"
            >
              <LogOut size={18} />
            </button>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity">
              Cerrar Sesión
            </div>
            <div className="mt-2 text-xs text-slate-500 truncate w-12 text-center">{usuario?.nombre_completo?.split(' ')[0]}</div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

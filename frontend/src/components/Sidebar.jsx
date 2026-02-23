import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const { usuario, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-primary text-white flex flex-col">
      <div className="p-4 border-b border-white/20">
        <h1 className="text-xl font-bold">SGR</h1>
        <p className="text-xs text-white/70">Sistema de Gestión de Reportes</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <span className="text-xs font-semibold text-white/50 uppercase">Principal</span>
        </div>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Dashboard
        </NavLink>

        <div className="px-4 mt-4 mb-2">
          <span className="text-xs font-semibold text-white/50 uppercase">Clientes</span>
        </div>
        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Lista de Clientes
        </NavLink>
        <NavLink
          to="/clientes/nuevo"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Nuevo Cliente
        </NavLink>

        <div className="px-4 mt-4 mb-2">
          <span className="text-xs font-semibold text-white/50 uppercase">Productos</span>
        </div>
        <NavLink
          to="/productos/farmaceuticos"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Farmacéuticos
        </NavLink>
        <NavLink
          to="/productos/dispositivos"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Dispositivos Médicos
        </NavLink>
        <NavLink
          to="/productos/biologicos"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Productos Biológicos
        </NavLink>

        <div className="px-4 mt-4 mb-2">
          <span className="text-xs font-semibold text-white/50 uppercase">Órdenes</span>
        </div>
        <NavLink
          to="/ordenes"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Lista de Órdenes
        </NavLink>
        <NavLink
          to="/ordenes/nuevo"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Nueva Orden
        </NavLink>

        <div className="px-4 mt-4 mb-2">
          <span className="text-xs font-semibold text-white/50 uppercase">Documentos</span>
        </div>
        <NavLink
          to="/documentos"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Lista de Documentos
        </NavLink>
        <NavLink
          to="/documentos/nuevo"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Nuevo Documento
        </NavLink>

        <div className="px-4 mt-4 mb-2">
          <span className="text-xs font-semibold text-white/50 uppercase">Reportes</span>
        </div>
        <NavLink
          to="/reportes"
          className={({ isActive }) =>
            `block px-4 py-2 mx-2 rounded-lg transition-colors ${
              isActive ? 'bg-white/20' : 'hover:bg-white/10'
            }`
          }
        >
          Reporte Contabilidad
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/20">
        <div className="mb-2">
          <p className="text-sm font-medium">{usuario?.nombre_completo}</p>
          <p className="text-xs text-white/70">{usuario?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

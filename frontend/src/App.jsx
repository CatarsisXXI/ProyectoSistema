import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import NuevoCliente from './pages/NuevoCliente';
import EditarCliente from './pages/EditarCliente';
import ProductosFarmaceuticos from './pages/ProductosFarmaceuticos';
import NuevoProductoFarmaceutico from './pages/NuevoProductoFarmaceutico';
import EditarProductoFarmaceutico from './pages/EditarProductoFarmaceutico';
import DispositivosMedicos from './pages/DispositivosMedicos';
import NuevoDispositivoMedico from './pages/NuevoDispositivoMedico';
import EditarDispositivoMedico from "./pages/EditarDispositivoMedico";
import ProductosBiologicos from './pages/ProductosBiologicos';
import NuevoProductoBiologico from './pages/NuevoProductoBiologico';
import EditarProductoBiologico from './pages/EditarProductoBiologico';
import OrdenesServicio from './pages/OrdenesServicio';
import NuevaOrden from './pages/NuevaOrden';
import EditarOrden from './pages/EditarOrden';
import VerOrden from './pages/VerOrden';
import DocumentosContables from './pages/DocumentosContables';
import NuevoDocumento from './pages/NuevoDocumento';
import EditarDocumento from './pages/EditarDocumento'; 
import VerDocumento from './pages/VerDocumento';
import Reportes from './pages/Reportes';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<PrivateRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function PrivateRoutes() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-16'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/nuevo" element={<NuevoCliente />} />
          <Route path="/clientes/editar/:id" element={<EditarCliente />} />
          <Route path="/productos/farmaceuticos" element={<ProductosFarmaceuticos />} />
          <Route path="/productos/farmaceuticos/nuevo" element={<NuevoProductoFarmaceutico />} />
          <Route path="/productos/farmaceuticos/editar/:id" element={<EditarProductoFarmaceutico />} />
          <Route path="/productos/dispositivos" element={<DispositivosMedicos />} />
          <Route path="/productos/dispositivos/nuevo" element={<NuevoDispositivoMedico />} />
          <Route path="/productos/dispositivos/editar/:id" element={<EditarDispositivoMedico />} />
          <Route path="/productos/biologicos" element={<ProductosBiologicos />} />
          <Route path="/productos/biologicos/nuevo" element={<NuevoProductoBiologico />} />
          <Route path="/productos/biologicos/editar/:id" element={<EditarProductoBiologico />} />
          <Route path="/ordenes" element={<OrdenesServicio />} />
          <Route path="/ordenes/nuevo" element={<NuevaOrden />} />
          <Route path="/ordenes/editar/:id" element={<EditarOrden />} />
          <Route path="/ordenes/:id" element={<VerOrden />} />
          <Route path="/ordenes/imprimir/:id" element={<VerOrden />} />
          <Route path="/documentos" element={<DocumentosContables />} />
          <Route path="/documentos/nuevo" element={<NuevoDocumento />} />
          <Route path="/documentos/editar/:id" element={<EditarDocumento />} />
          <Route path="/documentos/ver/:id" element={<VerDocumento />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

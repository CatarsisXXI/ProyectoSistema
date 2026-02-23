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
import OrdenesServicio from './pages/OrdenesServicio';
import NuevaOrden from './pages/NuevaOrden';
import DocumentosContables from './pages/DocumentosContables';
import NuevoDocumento from './pages/NuevoDocumento';
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
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-60 p-6">
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
          <Route path="/ordenes" element={<OrdenesServicio />} />
          <Route path="/ordenes/nuevo" element={<NuevaOrden />} />
          <Route path="/documentos" element={<DocumentosContables />} />
          <Route path="/documentos/nuevo" element={<NuevoDocumento />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

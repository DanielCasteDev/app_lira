import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './auth/login';
import Registro from './auth/registro';
import Olvidaste from './auth/olvidaste';
import Admin from './admin/Dashboard.ad';
import Parent from './parent/Dashboard.parent';
import ConfigAdm from './admin/pages/config';
import UserAdm from './admin/pages/users';
import Registrar_Hijos from './parent/pages/Registrar_hijos';
import Progreso from './child/progreso';
import Inicio from './child/inicio';
import Perfiles from './parent/pages/perfiles';
import Child from './child/dasboard_niño';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true, 
        v7_relativeSplatPath: true, 
      }}
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/olvidaste" element={<Olvidaste />} />

      {/* Rutas admin */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/config" element={<ConfigAdm />} />
        <Route path="/users" element={<UserAdm />} />


      {/* Rutas Papás */}

        <Route path="/parent" element={<Parent />} />
        <Route path="/Registrar_hijos" element={<Registrar_Hijos />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/perfiles" element={<Perfiles />} />


      {/* Rutas Niños */}

      <Route path="/child" element={<Child />} />
      <Route path="/inicio" element={<Inicio />} />


      </Routes>
    </Router>
  );
}

export default App;
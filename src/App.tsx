import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './auth/login';
import Registro from './auth/registro';
import Olvidaste from './auth/olvidaste';
import Admin from './admin/Dashboard.ad';
import Parent from './parent/Dashboard.parent';
import ConfigAdm from './admin/pages/config';
import UserAdm from './admin/pages/users';

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



        <Route path="/parent" element={<Parent />} />


      </Routes>
    </Router>
  );
}

export default App;
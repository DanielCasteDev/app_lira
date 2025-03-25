import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './auth/login';
import Registro from './auth/registro';
import Olvidaste from './auth/olvidaste';
import Admin from './admin/Dashboard.ad';
import Parent from './parent/Dashboard.parent';
import ConfigAdm from './admin/pages/config';
import UserAdm from './admin/pages/users';
import Registrar_Hijos from './parent/pages/Registrar_hijos';
import Cuentos from './child/games/Cuentos';
import Palabras from './child/games/Palabras';
import Perfiles from './parent/pages/perfiles';
import Child from './child/dasboard_niño';
import Restaurar from './auth/restaurar';
import LetrasMagicas from './child/games/letrasmagic';
import Desafios from './child/games/desafios';
import NotFound from './notfound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas (sin protección) */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/olvidaste" element={<Olvidaste />} />
        <Route path="/reset-password/:token" element={<Restaurar />} />

        {/* Rutas de Administrador */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ConfigAdm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserAdm />
            </ProtectedRoute>
          }
        />

        {/* Rutas para Padres */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Parent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Registrar_hijos"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Registrar_Hijos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfiles"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Perfiles />
            </ProtectedRoute>
          }
        />

        {/* Rutas para Niños */}
        <Route
          path="/child"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <Child />
            </ProtectedRoute>
          }
        />
        <Route
          path="/palabras"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <Palabras />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cuentos"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <Cuentos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/letras"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <LetrasMagicas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/desafios"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <Desafios />
            </ProtectedRoute>
          }
        />

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

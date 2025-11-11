import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { updateUserStatus } from '../auth/utils/Data';

export const useAuthMiddleware = (): void => {
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('Token');
    const role = localStorage.getItem('userRole');
    const publicRoutes = ['/', '/registro', '/olvidaste', '/reset-password'];

    if (publicRoutes.includes(location.pathname)) return;

    if (!token) {
      await handleLogout('Por favor, inicia sesión para continuar');
      return;
    }

    if (isTokenExpired(token)) {
      await handleLogout('Tu sesión ha expirado, por favor inicia sesión nuevamente');
      return;
    }

    checkTokenExpirationWarning(token);

    if (!hasAccess(role, location.pathname)) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/');
    }
  }, [location.pathname, navigate]);

  const handleLogout = useCallback(async (message: string): Promise<void> => {
    toast.error(message);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const userId = localStorage.getItem('id_usuario');
    if (userId) await updateUserStatus(userId, false);

    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    checkAuth(); // Ejecuta la verificación inicial
    const interval = setInterval(checkAuth, 60000); // Repite cada minuto

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, [checkAuth]);

  function checkTokenExpirationWarning(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();

      if (expiresIn > 0 && expiresIn < 300000) { // 5 minutos
        toast(`Tu sesión expirará en ${Math.round(expiresIn / 60000)} minutos`, { icon: '⏳' });
      }
    } catch (e) {
      console.warn('No se pudo verificar el tiempo de expiración del token', e);
    }
  }

  function isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }

  function hasAccess(role: string | null, path: string): boolean {
    const roleRoutes: Record<string, string[]> = {
      admin: ['/admin', '/config', '/users', '/notifications', '/estadisticas'],
      parent: ['/parent', '/Registrar_hijos', '/perfiles'],
      child: ['/child', '/palabras', '/cuentos', '/letras', '/desafios'],
    };

    if (!role) return false;
    return roleRoutes[role]?.some(route => path.startsWith(route)) ?? false;
  }
};

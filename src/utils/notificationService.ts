import { API_BASE_URL } from '../api/api_service';

// Obtener la clave pública VAPID
export const getVapidPublicKey = async (): Promise<string> => {
  try {
    console.log('🔑 [NotificationService] Obteniendo clave pública VAPID...');
    const response = await fetch(`${API_BASE_URL}/notifications/vapid-public-key`);
    if (!response.ok) {
      throw new Error('Error al obtener la clave pública VAPID');
    }
    const data = await response.json();
    console.log('✅ [NotificationService] Clave pública VAPID obtenida:', {
      publicKeyLength: data.publicKey?.length,
      publicKeyPreview: data.publicKey?.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    });
    return data.publicKey;
  } catch (error) {
    console.error('❌ [NotificationService] Error al obtener la clave pública VAPID:', error);
    throw error;
  }
};

// Convertir la clave base64 URL a Uint8Array
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Registrar suscripción WebPush
export const registerSubscription = async (subscription: PushSubscription): Promise<void> => {
  const userId = localStorage.getItem('id_usuario');
  const userEmail = localStorage.getItem('userEmail');
  
  try {
    console.log('📝 [NotificationService] Registrando suscripción...', {
      userId,
      userEmail,
      endpoint: subscription.endpoint?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    const token = localStorage.getItem('Token');
    if (!token) {
      console.error('❌ [NotificationService] No hay token de autenticación');
      throw new Error('No hay token de autenticación');
    }

    const subscriptionObject = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };

    console.log('📤 [NotificationService] Enviando suscripción al servidor...', {
      userId,
      endpointLength: subscriptionObject.endpoint.length,
      hasKeys: !!subscriptionObject.keys.p256dh && !!subscriptionObject.keys.auth,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionObject),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [NotificationService] Error al registrar suscripción:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        userId,
        timestamp: new Date().toISOString()
      });
      throw new Error(errorData.message || 'Error al registrar la suscripción');
    }

    const responseData = await response.json();
    console.log('✅ [NotificationService] Suscripción registrada exitosamente:', {
      userId,
      userEmail,
      subscriptionId: responseData.subscription?._id,
      endpoint: subscriptionObject.endpoint.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [NotificationService] Error al registrar la suscripción:', {
      error,
      userId,
      userEmail,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Convertir ArrayBuffer a base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Solicitar permisos de notificación y registrar suscripción
export const requestNotificationPermission = async (): Promise<boolean> => {
  const userId = localStorage.getItem('id_usuario');
  const userEmail = localStorage.getItem('userEmail');
  
  try {
    console.log('🚀 [NotificationService] Iniciando proceso de solicitud de permisos...', {
      userId,
      userEmail,
      timestamp: new Date().toISOString()
    });

    // Verificar soporte del navegador
    if (!('Notification' in window)) {
      console.warn('⚠️ [NotificationService] Este navegador no soporta notificaciones');
      return false;
    }
    console.log('✅ [NotificationService] Navegador soporta notificaciones');

    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ [NotificationService] Este navegador no soporta Service Workers');
      return false;
    }
    console.log('✅ [NotificationService] Navegador soporta Service Workers');

    if (!('PushManager' in window)) {
      console.warn('⚠️ [NotificationService] Este navegador no soporta Push Manager');
      return false;
    }
    console.log('✅ [NotificationService] Navegador soporta Push Manager');

    // Solicitar permiso de notificación
    console.log('🔐 [NotificationService] Solicitando permiso de notificación...');
    const permission = await Notification.requestPermission();
    console.log('📋 [NotificationService] Permiso obtenido:', {
      permission,
      userId,
      timestamp: new Date().toISOString()
    });

    if (permission !== 'granted') {
      console.warn('⚠️ [NotificationService] Permiso de notificación denegado:', {
        permission,
        userId,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    console.log('✅ [NotificationService] Permiso de notificación otorgado');

    // Registrar Service Worker si no está registrado
    console.log('👷 [NotificationService] Verificando Service Worker...');
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('📦 [NotificationService] Registrando Service Worker...');
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      console.log('✅ [NotificationService] Service Worker registrado:', {
        scope: registration.scope,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('✅ [NotificationService] Service Worker ya está registrado:', {
        scope: registration.scope,
        timestamp: new Date().toISOString()
      });
    }

    // Obtener la clave pública VAPID
    console.log('🔑 [NotificationService] Obteniendo clave pública VAPID...');
    const vapidPublicKey = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    console.log('✅ [NotificationService] Clave VAPID convertida a Uint8Array');

    // Suscribirse al servicio de push
    console.log('🔗 [NotificationService] Suscribiéndose al servicio de push...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    console.log('✅ [NotificationService] Suscripción creada localmente:', {
      endpoint: subscription.endpoint?.substring(0, 50) + '...',
      userId,
      timestamp: new Date().toISOString()
    });

    // Registrar la suscripción en el servidor
    console.log('📤 [NotificationService] Registrando suscripción en el servidor...');
    await registerSubscription(subscription);

    console.log('🎉 [NotificationService] Proceso completado exitosamente:', {
      userId,
      userEmail,
      endpoint: subscription.endpoint?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('❌ [NotificationService] Error en el proceso de solicitud de permisos:', {
      error,
      userId,
      userEmail,
      errorMessage: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

// Verificar si el usuario tiene permisos de notificación
export const checkNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

// Enviar notificación a un usuario (solo admin)
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  icon?: string,
  badge?: string,
  data?: any
): Promise<any> => {
  try {
    const token = localStorage.getItem('Token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/send-to-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        icon,
        badge,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al enviar la notificación');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
};

// Enviar notificación a múltiples usuarios (solo admin)
export const sendNotificationToMany = async (
  userIds: string[],
  title: string,
  body: string,
  icon?: string,
  badge?: string,
  data?: any
): Promise<any> => {
  try {
    const token = localStorage.getItem('Token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/send-to-many`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userIds,
        title,
        body,
        icon,
        badge,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al enviar las notificaciones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    throw error;
  }
};

// Obtener usuarios con suscripciones (solo admin)
export const getUsersWithSubscriptions = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('Token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/users-with-subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios con suscripciones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuarios con suscripciones:', error);
    throw error;
  }
};

// Obtener todos los usuarios (solo admin)
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('Token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/all-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};


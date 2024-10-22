import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const PermissionContext = createContext([]);

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchPermissions = async () => {
      const roleId = localStorage.getItem('roleId');
      console.log('roleId from localStorage:', roleId);

      // Lista de rutas públicas
      const publicRoutes = ['/login', '/register', '/forgotPassword', '/resetPassword','/index'];

      if (!roleId && !publicRoutes.includes(location.pathname)) {
        console.error('No roleId found in localStorage');
        setLoading(false);
        setPermissions([]);
        return;
      }

      if (publicRoutes.includes(location.pathname)) {
        setLoading(false);
        setPermissions(['public']);
        return;
      }

      try {
        const permissionsRoleResponse = await axios.get('http://localhost:1056/api/permissionsRole');
        const permissionsResponse = await axios.get('http://localhost:1056/api/permissions');

        const rolePermissions = permissionsRoleResponse.data.filter(pr => pr.roleId === parseInt(roleId));
        const permissionNames = permissionsResponse.data.filter(p => 
          rolePermissions.some(rp => rp.permissionId === p.id)
        ).map(p => p.name);

        console.log('User permissions:', permissionNames);
        setPermissions(permissionNames);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [location]);

  if (loading) {
    return <div>Cargando permisos...</div>;
  }

  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
};

export const PermissionCheck = ({ requiredPermission, children }) => {
  const permissions = usePermissions();
  console.log(`PermissionCheck - Required: ${requiredPermission} Available:`, permissions);

  if (permissions.includes(requiredPermission) || permissions.includes('public')) {
    return <>{children}</>;
  }

  return null;
};
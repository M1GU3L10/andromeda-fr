import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PermissionContext = createContext([]);

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      const roleId = localStorage.getItem('roleId');
      console.log('roleId from localStorage:', roleId);
      if (!roleId) {
        console.error('No roleId found in localStorage');
        setLoading(false);
        navigate('/login');
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
  }, [navigate]);

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

  if (permissions.includes(requiredPermission)) {
    return <>{children}</>;
  }

  return null;
};
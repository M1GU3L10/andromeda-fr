import { useState, useEffect } from 'react';
import axios from 'axios';

export function useUserPermissions() {
  const [userPrivileges, setUserPrivileges] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserPrivileges = async () => {
      try {
        // Use 'roleId' instead of 'userRoleId'
        const roleId = localStorage.getItem('roleId');
        console.log('Retrieved roleId:', roleId);

        if (!roleId) {
          console.error('Role ID not found');
          setError('No role ID found');
          return;
        }

        const response = await axios.get('http://localhost:1056/api/privilege-permission-roles', {
          params: { roleId }
        });

        console.log('Full API Response:', response.data);

        const privileges = response.data.reduce((acc, item) => {
          if (item.Privilege && item.Privilege.name) {
            acc.push(item.Privilege.name);
          }
          return acc;
        }, []);

        console.log('Extracted Privileges:', privileges);

        setUserPrivileges(privileges);
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        setError(error.message || 'Failed to fetch privileges');
      }
    };

    fetchUserPrivileges();
  }, []);

  const hasPrivilege = (privilegeName) => {
    const hasPriv = userPrivileges.includes(privilegeName);
    console.log(`Checking privilege "${privilegeName}":`, hasPriv);
    return hasPriv;
  };

  return { 
    hasPrivilege, 
    userPrivileges,
    error
  };
}
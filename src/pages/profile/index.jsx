import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    // otros campos que necesites
  });
  const navigate = useNavigate();

  // Obtener el token del usuario logueado
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Llama a la API para obtener los datos del usuario logueado
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:1056/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };

    fetchUserData();
  }, [token]);

  // Maneja cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  // Maneja el envío del formulario para actualizar los datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:1056/api/users/updateProfile', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Perfil actualizado correctamente');
      navigate('/profile'); // Redirige al perfil o donde prefieras
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  return (
    <div>
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Correo:
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            disabled // Puede ser que no quieras permitir la edición del email
          />
        </label>
        <br />
        <label>
          Teléfono:
          <input
            type="text"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
          />
        </label>
        <br />
        {/* Agrega otros campos según sea necesario */}
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditProfile;

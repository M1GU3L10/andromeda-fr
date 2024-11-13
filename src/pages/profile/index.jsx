import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Input, IconButton, Card, CardHeader, CardContent, Typography, Alert, AlertTitle } from '@mui/material';  // Importa Alert y AlertTitle aquí
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios'; // Asegúrate de importar axios
import bcrypt from 'bcryptjs'; // Asegúrate de importar bcrypt

export default function EnhancedProfileEditor() {
  const url = 'http://localhost:1056/api/users';
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    status: 'A',
    roleId: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    phone: false,
  });

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      setIsLoggedIn(true);
      fetchUserData(userId);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
      setError('No has iniciado sesión. Por favor, inicia sesión para ver tu perfil.');
    }
  };

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/${userId}`);
      setUserData(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    handleValidation(name, value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    handleValidation('password', e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some(error => error !== '')) {
      showAlert('¡Advertencia!', 'Por favor, corrija los errores en el formulario', 'warning');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const dataToUpdate = { ...userData };
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        dataToUpdate.password = hashedPassword;
      }

      const emailExists = await checkExistingEmail(dataToUpdate.email.trim());
      const phoneExists = await checkExistingPhone(dataToUpdate.phone.trim());

      if (emailExists && dataToUpdate.email !== userData.email) {
        showAlert('¡Advertencia!', 'El correo electrónico ya está registrado', 'warning');
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (phoneExists && dataToUpdate.phone !== userData.phone) {
        showAlert('¡Advertencia!', 'El número de teléfono ya está registrado', 'warning');
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      const response = await axios.put(`${url}/${userData.id}`, dataToUpdate);
      if (response.status === 200) {
        showAlert('¡Éxito!', 'Perfil actualizado exitosamente', 'success');
        if (password) {
          setPassword('');
          setShowPassword(false);
        }
        fetchUserData(userData.id);
      }
    } catch (err) {
      showAlert('¡Error!', 'Error al actualizar el perfil', 'error');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const showAlert = (title, message, type) => {
    return (
      <Alert variant={type === 'error' ? 'destructive' : type}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    );
  };

  const checkExistingEmail = async (email) => {
    try {
      const response = await axios.get(`${url}/check-email/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkExistingPhone = async (phone) => {
    try {
      const response = await axios.get(`${url}/check-phone/${phone}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    }
  };

  const validateName = (value) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(value) ? '' : 'El nombre solo debe contener letras';
  };

  const validateEmail = (value) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(value) ? '' : 'El correo no es válido';
  };

  const validatePassword = (value) => {
    if (value === '') return '';
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(value) ? '' : 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
  };

  const validatePhone = (value) => {
    const regex = /^\d{10}$/;
    return regex.test(value) ? '' : 'El teléfono debe contener 10 números';
  };

  const handleValidation = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    handleValidation(name, e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-white shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <Typography className="text-2xl font-bold text-center">Mi Perfil</Typography>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center p-4 bg-white shadow-md">
            <div className="flex items-center space-x-4">
              {/* Avatar con iniciales, estilo círculo */}
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                <span>{userData.name ? userData.name.charAt(0).toUpperCase() : ''}</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold">{userData.name}</h2>
                <p className="text-sm text-gray-500">{userData.role}</p> {/* Esto es opcional para mostrar el rol */}
              </div>
            </div>
          </div>






          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <Input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.name && errors.name !== ''}
                  helperText={touched.name && errors.name}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                <Input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.email && errors.email !== ''}
                  helperText={touched.email && errors.email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <div className="flex items-center">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={touched.password && errors.password !== ''}
                  helperText={touched.password && errors.password}
                />
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </IconButton>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <Input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                error={touched.phone && errors.phone !== ''}
                helperText={touched.phone && errors.phone}
              />
            </div>

            <div className="text-center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

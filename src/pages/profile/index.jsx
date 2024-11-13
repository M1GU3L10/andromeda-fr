import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Container, Grid } from '@mui/material';

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
      const response = await fetch(`${url}/${userId}`);
      const data = await response.json();
      setUserData(data);
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
        dataToUpdate.password = password;
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

      const response = await fetch(`${url}/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (response.ok) {
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

  const showAlert = (title, message, severity) => {
    return (
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    );
  };

  const checkExistingEmail = async (email) => {
    try {
      const response = await fetch(`${url}/check-email/${email}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkExistingPhone = async (phone) => {
    try {
      const response = await fetch(`${url}/check-phone/${phone}`);
      const data = await response.json();
      return data.exists;
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box textAlign="center" mt={8}>
        <h2>Acceso Denegado</h2>
        <p>{error}</p>
      </Box>
    );
  }
 
  return (
    <Container maxWidth="md" sx={{ py: 8 }}> {/* Aumentado el padding vertical */}
      <Card elevation={3}>
        <CardHeader
          title="Mi Perfil"
          subheader="Gestiona tu información personal"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center',
            py: 3, // Aumentado el padding vertical del header
            '& .MuiCardHeader-subheader': {
              color: 'white',
            },
          }}
        />
        <CardContent sx={{ mt: 4 }}> {/* Añadido margen superior */}
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}> {/* Aumentado el margen inferior */}
            <Box
              sx={{
                width: 120, // Aumentado el tamaño
                height: 120, // Aumentado el tamaño
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem', // Aumentado el tamaño de la letra
                fontWeight: 'bold',
                mb: 2, // Añadido margen inferior
              }}
            >
              {userData.name ? userData.name.charAt(0).toUpperCase() : ''}
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}> {/* Aumentado el espaciado entre elementos */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  sx={{ mb: 2 }} // Añadido margen inferior
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ mb: 2 }} // Añadido margen inferior
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  sx={{ mb: 3 }} // Aumentado margen inferior
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                  sx={{ mb: 4 }} // Aumentado margen inferior
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}> {/* Aumentados márgenes */}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
                    sx={{ minWidth: 200, py: 1.5 }} // Aumentado el padding vertical del botón
                  >
                    {isSubmitting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Guardando...</span>
                      </Box>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
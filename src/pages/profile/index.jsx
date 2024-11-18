import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EnhancedProfileEditor() {
  const url = 'http://localhost:1056/api/users';
  const urlp = 'http://localhost:1056/api/users/profile';
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
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, corrija los errores en el formulario',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
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
        Swal.fire({
          title: '¡Advertencia!',
          text: 'El correo electrónico ya está registrado',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (phoneExists && dataToUpdate.phone !== userData.phone) {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'El número de teléfono ya está registrado',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${urlp}/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (response.ok) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Perfil actualizado exitosamente',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        if (password) {
          setPassword('');
          setShowPassword(false);
        }
      } else {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Perfil actualizado exitosamente',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    } catch (err) {
      Swal.fire({
        title: '¡Error!',
        text: 'Error al actualizar el perfil',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
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
    const regex = /^[A-Za-z\s]{3,}$/;
    return regex.test(value) ? '' : 'El nombre debe contener al menos 3 letras';
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-5">
        <h2>Acceso Denegado</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Card>
        <Card.Header className="bg-primary text-white text-center py-4">
          <h2>Mi Perfil</h2>
          <p>Gestiona tu información personal</p>
        </Card.Header>
        <Card.Body className="mt-4">
          <div className="text-center mb-5">
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#007bff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '0 auto',
              }}
            >
              {userData.name ? userData.name.charAt(0).toUpperCase() : ''}
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.email && !!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && !!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="phone">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.phone && !!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} className="text-center mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
                  style={{ minWidth: 200, padding: '10px 0' }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
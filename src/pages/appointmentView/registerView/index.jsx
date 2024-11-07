'use client'

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Menu, MenuItem, Button, Breadcrumbs, Chip } from '@mui/material';
import { emphasize, styled } from '@mui/material/styles';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import { FcCalendar } from "react-icons/fc";
import { FaUserClock } from "react-icons/fa";
import { IoSearch, IoTrashSharp } from "react-icons/io5";
import { FaPlus } from 'react-icons/fa';
import HomeIcon from '@mui/icons-material/Home';
import { toast } from 'react-toastify';
import { MyContext } from '../../../App.js';
import logo from '../../../assets/images/logo-light.png';
import axios from 'axios';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor = theme.palette.mode === 'light'
    ? theme.palette.grey[100]
    : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

export default function Component() {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        Init_Time: '',
        Date: '',
        clienteId: '',
        appointmentDetails: []
    });

    const urlAppointments = 'http://localhost:1056/api/appointment';
    const urlUsers = 'http://localhost:1056/api/users';
    const urlServices = 'http://localhost:1056/api/services';

    const MySwal = withReactContent(Swal);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        checkLoginStatus();
        getUsers();
        getServices();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const storedEmail = localStorage.getItem('userName');
        const idRole = localStorage.getItem('roleId');
        if (token && storedEmail && idRole) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
            setUserRole(idRole);
        } else {
            setIsLoggedIn(false);
            setUserEmail('');
            setUserRole('');
        }
    };

    const getUsers = async () => {
        try {
            const response = await axios.get(urlUsers);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const getServices = async () => {
        try {
            const response = await axios.get(urlServices);
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('roleId');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserEmail('');
        handleMenuClose();
        toast.error('Sesion cerrada', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            onClose: () => navigate('/index')
        });
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handledashboard = () => {
        context.setIsHideSidebarAndHeader(false);
        navigate('/services');
    };

    const getUserInitial = () => {
        return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        validateField(name, value);
    };

    const validateField = (name, value) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: value.trim() === '' ? 'Este campo es obligatorio' : undefined
        }));
    };

    const handleServiceAdd = () => {
        setFormData(prevData => ({
            ...prevData,
            appointmentDetails: [
                ...prevData.appointmentDetails,
                { serviceId: '', empleadoId: '' }
            ]
        }));
    };

    const handleServiceRemove = (index) => {
        setFormData(prevData => ({
            ...prevData,
            appointmentDetails: prevData.appointmentDetails.filter((_, i) => i !== index)
        }));
    };

    const handleDetailChange = (index, field, value) => {
        setFormData(prevData => {
            const newDetails = [...prevData.appointmentDetails];
            if (newDetails[index]) {
                newDetails[index] = { ...newDetails[index], [field]: value };
            }
            return { ...prevData, appointmentDetails: newDetails };
        });

        setErrors(prevErrors => {
            const newDetailErrors = { ...(prevErrors.appointmentDetails || {}) };
            if (!newDetailErrors[index]) {
                newDetailErrors[index] = {};
            }
            newDetailErrors[index][field] = value ? undefined : 'Este campo es obligatorio';
            return { ...prevErrors, appointmentDetails: newDetailErrors };
        });
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (typeof formData[key] === 'string' && !formData[key].trim()) {
                newErrors[key] = 'Este campo es obligatorio';
            }
        });

        formData.appointmentDetails.forEach((detail, index) => {
            if (!detail.serviceId || !detail.empleadoId) {
                if (!newErrors.appointmentDetails) newErrors.appointmentDetails = {};
                newErrors.appointmentDetails[index] = {
                    serviceId: !detail.serviceId ? 'Este campo es obligatorio' : undefined,
                    empleadoId: !detail.empleadoId ? 'Este campo es obligatorio' : undefined
                };
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const appointmentData = {
                Init_Time: formData.Init_Time + ':00',
                Date: formData.Date,
                status: 'pendiente',
                clienteId: parseInt(formData.clienteId, 10),
                appointmentDetails: formData.appointmentDetails.map(detail => ({
                    serviceId: parseInt(detail.serviceId, 10),
                    empleadoId: parseInt(detail.empleadoId, 10)
                }))
            };

            const response = await axios.post(urlAppointments, appointmentData);
            console.log("Appointment registered:", response.data);

            MySwal.fire({
                icon: 'success',
                title: 'Cita registrada exitosamente',
                text: 'La cita ha sido creada correctamente.',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                navigate('/appointmentview');
            });

            setFormData({
                Init_Time: '',
                Date: '',
                clienteId: '',
                appointmentDetails: []
            });
        } catch (error) {
            console.error("Error registering appointment:", error);
            MySwal.fire({
                icon: 'error',
                title: 'Error al registrar la cita',
                text: error.response?.data?.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
                showConfirmButton: true
            });
        }
    };

    return (
        <div className="appointment-register-container">
            <header className={`header-index1 ${isScrolled ? 'abajo' : ''}`}>
                <Link to="/" className="d-flex align-items-center logo-index">
                    <img src={logo} alt="Logo" />
                    <span className="ml-2">Barberia Orion</span>
                </Link>
                
                <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
                    <nav className="navBar-index">
                        <Link to="/index" onClick={() => setIsNavOpen(false)}>INICIO</Link>
                        <Link to="/appointmentView">CITAS</Link>
                        <Link to="/shop" onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
                        <Link to="/contact" onClick={() => setIsNavOpen(false)}>CONTACTO</Link>
                    </nav>
        
                    <div className="auth-buttons">
                        {isLoggedIn && userEmail ? (
                            <div className="user-menu">
                                <Button onClick={handleMenuClick} className="userLoginn"
                                    startIcon={
                                        <Avatar sx={{ width: 32, height: 32, backgroundColor: '#b89b58' }}>
                                            {getUserInitial()}
                                        </Avatar>
                                    }
                                >
                                    {userEmail}
                                </Button>
                                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} className="menu-landingPage">
                                    {userRole === '1' || userRole === '2' ? (
                                        <MenuItem onClick={handledashboard} className="menu-item-landingPage">
                                            <GrUserAdmin /> Administrar
                                        </MenuItem>
                                    ) : (
                                        <MenuItem>Carrito</MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout} className="menu-item-landingPage">
                                        <GiExitDoor /> Cerrar Sesión
                                    </MenuItem>
                                </Menu>
                            </div>
                        ) : (
                            <Button variant="contained" className="book-now-btn" onClick={handleLogin}>
                                Iniciar sesión
                            </Button>
                        )}
                    </div>
                </div>
            </header>
        
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    
        
                    <div className="card border-0 p-3 d-flex colorTransparent mt-3">
                        <div className="row">
                            <div className="col-sm-7">
                                <div className="card-detail shadow border-0">
                                    <div className="row p-3">
                                        <div className="bcg-w col-sm-7 d-flex align-items-center">
                                            <span className="Title">Detalle de cita</span>
                                        </div>
                                        <div className="col-sm-5 d-flex align-items-center justify-content-end">
                                            <div className="searchBox position-relative d-flex align-items-center">
                                                <IoSearch className="mr-2" />
                                                <input type="text" placeholder="Buscar..." className="form-control" />
                                            </div>
                                        </div>
                                    </div>
        
                                    <div className="table-responsive mt-3 w-80 p-3">
                                        <table className="table table-bordered table-hover v-align table-striped">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Servicio</th>
                                                    <th>Empleado</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.appointmentDetails.map((detail, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <Form.Select
                                                                value={detail.serviceId}
                                                                onChange={(e) => handleDetailChange(index, 'serviceId', e.target.value)}
                                                                isInvalid={errors.appointmentDetails?.[index]?.serviceId}
                                                            >
                                                                <option value="">Seleccionar servicio</option>
                                                                {services.map(service => (
                                                                    <option key={service.id} value={service.id}>{service.name}</option>
                                                                ))}
                                                            </Form.Select>
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors.appointmentDetails?.[index]?.serviceId}
                                                            </Form.Control.Feedback>
                                                        </td>
                                                        <td>
                                                            <Form.Select
                                                                value={detail.empleadoId}
                                                                onChange={(e) => handleDetailChange(index, 'empleadoId', e.target.value)}
                                                                isInvalid={errors.appointmentDetails?.[index]?.empleadoId}
                                                            >
                                                                <option value="">Seleccionar empleado</option>
                                                                {users.filter(user => user.roleId === 2).map(employee => (
                                                                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                                                                ))}
                                                            </Form.Select>
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors.appointmentDetails?.[index]?.empleadoId}
                                                            </Form.Control.Feedback>
                                                        </td>
                                                        <td>
                                                            <Button color="error" className="delete" onClick={() => handleServiceRemove(index)}>
                                                                <IoTrashSharp />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
        
                                        <Button 
                                            onClick={handleServiceAdd}
                                            className="btn-add-service"
                                        >
                                            <FaPlus />
                                        </Button>
                                    </div>
                                </div>
                            </div>
        
                            <div className="col-sm-5">
                                <div className="card-detail shadow border-0">
                                    <span className="Title">Info de cita</span>
                                    <Form className="form p-4" onSubmit={handleSubmit}>
                                        <Form.Group as={Row} className="mb-3">
                                            <Col sm="12">
                                                <Form.Label>Hora de inicio</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="Init_Time"
                                                    value={formData.Init_Time}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.Init_Time}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.Init_Time}
                                                </Form.Control.Feedback>
                                            </Col>
                                        </Form.Group>
        
                                        <Form.Group as={Row} className="mb-3">
                                            <Col sm="12">
                                                <Form.Label>Fecha</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="Date"
                                                    value={formData.Date}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.Date}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.Date}
                                                </Form.Control.Feedback>
                                            </Col>
                                        </Form.Group>
        
                                        <Form.Group as={Row} className="mb-3">
                                            <Col sm="12">
                                                <Form.Label>Cliente</Form.Label>
                                                <Form.Select
                                                    name="clienteId"
                                                    value={formData.clienteId}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.clienteId}
                                                >
                                                    <option value="">Seleccionar cliente</option>
                                                    {users.filter(user => user.roleId === 3).map(cliente => (
                                                        <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.clienteId}
                                                </Form.Control.Feedback>
                                            </Col>
                                        </Form.Group>
        
                                        <Button type="submit" className="btn-register">
                                            Registrar
                                        </Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
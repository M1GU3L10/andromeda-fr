import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FcCalendar } from "react-icons/fc";
import { FaUserClock } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";

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

const RegisterAppointment = () => {
    const urlAppointments = 'http://localhost:1056/api/appointment';
    const urlUsers = 'http://localhost:1056/api/users';
    const urlServices = 'http://localhost:1056/api/services';

    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        Init_Time: '',
        Finish_Time: '',
        Date: '',
        clienteId: '',
        appointmentDetails: []
    });

    useEffect(() => {
        getUsers();
        getServices();
    }, []);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleServiceAdd = () => {
        setFormData({
            ...formData,
            appointmentDetails: [
                ...formData.appointmentDetails,
                { serviceId: '', empleadoId: '' }
            ]
        });
    };

    const handleServiceRemove = (index) => {
        const newDetails = formData.appointmentDetails.filter((_, i) => i !== index);
        setFormData({ ...formData, appointmentDetails: newDetails });
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...formData.appointmentDetails];
        newDetails[index][field] = parseInt(value, 10);
        setFormData({ ...formData, appointmentDetails: newDetails });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const appointmentData = {
                Init_Time: formData.Init_Time + ':00', // Ensure seconds are included
                Finish_Time: formData.Finish_Time + ':00', // Ensure seconds are included
                Date: formData.Date,
                status: 'pendiente',
                clienteId: parseInt(formData.clienteId, 10),
                appointmentDetails: formData.appointmentDetails.map(detail => ({
                    serviceId: parseInt(detail.serviceId, 10),
                    empleadoId: parseInt(detail.empleadoId, 10)
                }))
            };

            // Log the data being sent
            console.log('Data being sent:', JSON.stringify(appointmentData, null, 2));

            const response = await axios.post(urlAppointments, appointmentData);
            console.log("Appointment registered:", response.data);
            alert("Cita registrada exitosamente.");
            setFormData({
                Init_Time: '',
                Finish_Time: '',
                Date: '',
                clienteId: '',
                appointmentDetails: []
            });
        } catch (error) {
            console.error("Error registering appointment:", error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
                alert(`Error al registrar la cita. ${error.response.data.message || 'Por favor, inténtalo de nuevo.'}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("Error request:", error.request);
                alert("No se recibió respuesta del servidor. Por favor, inténtalo de nuevo más tarde.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                alert("Error al procesar la solicitud. Por favor, inténtalo de nuevo.");
            }
        }
    };
    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Registrar Cita</span>
                    </div>
                    <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
                        <div role="presentation">
                            <Breadcrumbs aria-label="breadcrumb">
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Home"
                                    icon={<HomeIcon fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Servicios"
                                    icon={<FaUserClock fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    label="Citas"
                                    icon={<FcCalendar fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card border-0 p-3 d-flex colorTransparent'>
                    <div className='row'>
                        <div className='col-sm-7'>
                            <div className='card-detail shadow border-0'>
                                <div className='row p-3'>
                                    <div className='bcg-w col-sm-7 d-flex align-items-center'>
                                        <div className="position-relative d-flex align-items-center">
                                            <span className='Title'>Detalle de cita</span>
                                        </div>
                                    </div>
                                    <div className='col-sm-5 d-flex align-items-center justify-content-end'>
                                        <div className="searchBox position-relative d-flex align-items-center">
                                            <IoSearch className="mr-2" />
                                            <input type="text" placeholder='Buscar...' className='form-control' />
                                        </div>
                                    </div>
                                </div>
                                <div className='table-responsive mt-3 w-80'>
                                    <table className='table table-bordered table-hover v-align table-striped '>
                                        <thead className='table-light'>
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
                                                        >
                                                            <option value="">Seleccionar servicio</option>
                                                            {services.map(service => (
                                                                <option key={service.id} value={service.id}>{service.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            value={detail.empleadoId}
                                                            onChange={(e) => handleDetailChange(index, 'empleadoId', e.target.value)}
                                                        >
                                                            <option value="">Seleccionar empleado</option>
                                                            {users.filter(user => user.roleId === 2).map(employee => (
                                                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                    <td>
                                                        <div className='d-flex align-items-center'>
                                                            <Button color='error' className='delete' onClick={() => handleServiceRemove(index)}><IoTrashSharp /></Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <Button onClick={handleServiceAdd} className='primary'><FaPlus /> Agregar Servicio</Button>
                                </div>
                            </div>
                        </div>
                        <div className='col-sm-5'>
                            <div className='card-detail shadow border-0'>
                                <div className="cont-title w-100">
                                    <span className='Title'>Info de cita</span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <div className="d-flex align-items-center w-100 p-4">
                                        <Form className='form' onSubmit={handleSubmit}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Col sm="6">
                                                    <Form.Label>Hora de inicio</Form.Label>
                                                    <Form.Control
                                                        type="time"
                                                        name="Init_Time"
                                                        value={formData.Init_Time}
                                                        onChange={handleInputChange}
                                                    />
                                                </Col>
                                                <Col sm="6">
                                                    <Form.Label>Hora de finalización</Form.Label>
                                                    <Form.Control
                                                        type="time"
                                                        name="Finish_Time"
                                                        value={formData.Finish_Time}
                                                        onChange={handleInputChange}
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label>Fecha</Form.Label>
                                                <Col sm="12">
                                                    <Form.Control
                                                        type="date"
                                                        name="Date"
                                                        value={formData.Date}
                                                        onChange={handleInputChange}
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label>Cliente</Form.Label>
                                                <Col sm="12">
                                                    <Form.Select
                                                        name="clienteId"
                                                        value={formData.clienteId}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Seleccionar cliente</option>
                                                        {users.filter(user => user.roleId === 3).map(cliente => (
                                                            <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>
                                            </Form.Group>
                                            <div className="btn-save">
                                                <Button type='submit'>Registrar Cita</Button>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterAppointment;

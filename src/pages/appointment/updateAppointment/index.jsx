import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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

const UpdateAppointment = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const urlAppointments = 'http://localhost:1056/api/appointment';
    const urlUsers = 'http://localhost:1056/api/users';
    const urlServices = 'http://localhost:1056/api/services';

    const MySwal = withReactContent(Swal);
    const [errors, setErrors] = useState({
        Init_Time: false,
        Finish_Time: false,
        Date: false,
        clienteId: false,
        status: false,
        appointmentDetails: [] // Inicializa como un array para manejar múltiples detalles
    });
    
    const newErrors = {};

    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        Init_Time: '',
        Finish_Time: '',
        Date: '',
        Total: '',
        tiempo_de_la_cita: '',
        status: '',
        clienteId: '',
        appointmentDetails: []
    });

    useEffect(() => {
        getUsers();
        getServices();
        if (appointmentId) {
            getAppointmentData();
        }
    }, [appointmentId]);

    const getAppointmentData = async () => {
        try {
            const response = await axios.get(`${urlAppointments}/${appointmentId}`);
            const appointment = response.data;
            setFormData({
                Init_Time: appointment.Init_Time.slice(0, 5),
                Finish_Time: appointment.Finish_Time.slice(0, 5),
                Date: appointment.Date,
                Total: appointment.Total,
                tiempo_de_la_cita: appointment.tiempo_de_la_cita,
                status: appointment.status,
                clienteId: appointment.clienteId.toString(),
                appointmentDetails: appointment.DetailAppointments.map(detail => ({
                    serviceId: detail.serviceId.toString(),
                    empleadoId: detail.empleadoId.toString()
                }))
            });
        } catch (error) {
            console.error("Error fetching appointment data:", error);
            alert("Error al cargar los datos de la cita.");
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        // Actualizar el estado del formulario
        setFormData({
            ...formData,
            [name]: value
        });
    
        // Validar en tiempo real
        const newErrors = { ...errors };
        if (!value.trim()) {
            newErrors[name] = true; // Si el campo está vacío, marca error
        } else {
            delete newErrors[name]; // Si el campo tiene valor, quita el error
        }
    
        // Actualiza el estado de los errores
        setErrors(newErrors);
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
        newDetails[index][field] = value;
        setFormData({ ...formData, appointmentDetails: newDetails });
    
        // Validar en tiempo real
        const newErrors = { ...errors };
        if (field === 'serviceId' && !value) {
            newErrors.appointmentDetails[index] = { ...newErrors.appointmentDetails[index], serviceId: true };
        } else if (field === 'empleadoId' && !value) {
            newErrors.appointmentDetails[index] = { ...newErrors.appointmentDetails[index], empleadoId: true };
        } else {
            delete newErrors.appointmentDetails[index][field]; // Si el campo tiene valor, quita el error
        }
    
        setErrors(newErrors);
    };
    

    const validateDetails = () => {
        const newErrors = { ...errors, appointmentDetails: [] }; // Resetea los errores de appointmentDetails
        let isValid = true; // Variable para controlar la validez de los detalles
    
        formData.appointmentDetails.forEach((detail, index) => {
            const detailErrors = {};
            if (!detail.serviceId) {
                detailErrors.serviceId = true;
                isValid = false; // Marca como inválido si hay un error
            }
            if (!detail.empleadoId) {
                detailErrors.empleadoId = true;
                isValid = false; // Marca como inválido si hay un error
            }
    
            newErrors.appointmentDetails[index] = detailErrors;
        });
    
        setErrors(newErrors);
    
        return isValid; // Retorna si todos los detalles son válidos
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
       // Revisa cada clave en formData
        Object.keys(formData).forEach((key) => {
            const value = formData[key];

            // Solo llama a trim si el valor es una cadena
            if (typeof value === 'string') {
                if (value.trim() === '') {
                    errors[key] = 'Este campo es obligatorio'; // Mensaje de error
                }
            } else if (Array.isArray(value)) {
                // Validación adicional si es un array
                if (value.length === 0) {
                    errors[key] = 'Debe haber al menos un servicio'; // Mensaje de error
                } else {
                    // Validación de los elementos dentro del array
                    value.forEach((detail, index) => {
                        if (!detail.serviceId) {
                            errors[`appointmentDetails[${index}].serviceId`] = 'Servicio requerido';
                        }
                        if (!detail.empleadoId) {
                            errors[`appointmentDetails[${index}].empleadoId`] = 'Empleado requerido';
                        }
                    });
                }
            }
        });

        if (Object.keys(errors).length > 0) {
            setErrors(errors); // Actualiza el estado con errores
            return; // Detiene el envío si hay errores
        }
        try {
            const appointmentData = {
                Init_Time: formData.Init_Time + ':00',
                Finish_Time: formData.Finish_Time + ':00',
                Date: formData.Date,
                Total: formData.Total,
                tiempo_de_la_cita: formData.tiempo_de_la_cita,
                status: formData.status,
                clienteId: parseInt(formData.clienteId, 10),
                appointmentDetails: formData.appointmentDetails.map(detail => ({
                    serviceId: parseInt(detail.serviceId, 10),
                    empleadoId: parseInt(detail.empleadoId, 10)
                }))
            };
    
            let response;
            if (appointmentId) {
                // Actualización de cita
                response = await axios.put(`${urlAppointments}/${appointmentId}`, appointmentData);
                console.log("Appointment updated:", response.data);
    
                // SweetAlert2 success alert y redirección
                MySwal.fire({
                    icon: 'success',
                    title: 'Cita actualizada exitosamente',
                    text: 'La cita ha sido actualizada correctamente.',
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => {
                    navigate('/appointment'); // Redirige a la lista de citas
                });
            } else {
                // Registro de nueva cita
                response = await axios.post(urlAppointments, appointmentData);
                console.log("Appointment registered:", response.data);
    
                // SweetAlert2 success alert y redirección
                MySwal.fire({
                    icon: 'success',
                    title: 'Cita registrada exitosamente',
                    text: 'La cita ha sido creada correctamente.',
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => {
                    navigate('/appointments'); // Redirige a la lista de citas
                });
            }
        } catch (error) {
            console.error("Error processing appointment:", error);
    
            let errorMessage = 'Por favor, inténtalo de nuevo.';
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor. Por favor, inténtalo de nuevo más tarde.';
            }
    
            // SweetAlert2 error alert
            MySwal.fire({
                icon: 'error',
                title: 'Error al procesar la cita',
                text: errorMessage,
                showConfirmButton: true
            });
        }
    };

    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>{appointmentId ? 'Modificar Cita' : 'Crear Cita'}</span>
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
                                                            isInvalid={errors.appointmentDetails[index]?.serviceId}
                                                        >
                                                            <option value="">Seleccionar servicio</option>
                                                            {services.map(service => (
                                                                <option key={service.id} value={service.id}>{service.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                        <Form.Control.Feedback type="invalid">
                                                            Este campo es obligatorio.
                                                        </Form.Control.Feedback>
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            value={detail.empleadoId}
                                                            onChange={(e) => handleDetailChange(index, 'empleadoId', e.target.value)}
                                                            isInvalid={errors.appointmentDetails[index]?.empleadoId}
                                                        >
                                                            <option value="">Seleccionar empleado</option>
                                                            {users.filter(user => user.roleId === 2).map(employee => (
                                                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                        <Form.Control.Feedback type="invalid">
                                                            Este campo es obligatorio.
                                                        </Form.Control.Feedback>
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
                                    <div className="d-flex justify-content-start mt-4 mb-3 px-3">
                                        <Button 
                                            onClick={handleServiceAdd}
                                            style={{
                                                backgroundColor: '#198754', // Color de fondo verde
                                                color: 'white',           // Color del texto (icono) blanco
                                                margin: '5px',           // Márgenes alrededor del botón
                                                border: '2px solid #198754', // Borde negro de 2px
                                                borderRadius: '5px',     // Bordes redondeados
                                                padding: '10px',          // Relleno interno
                                                display: 'flex',          // Para alinear el icono centrado
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <FaPlus />
                                        </Button>

                                    </div>
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
                                                        isInvalid={errors.Init_Time}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Este campo es obligatorio.
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col sm="6">
                                                    <Form.Label>Hora de finalización</Form.Label>
                                                    <Form.Control
                                                        type="time"
                                                        name="Finish_Time"
                                                        value={formData.Finish_Time}
                                                        onChange={handleInputChange}
                                                        isInvalid={errors.Finish_Time}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Este campo es obligatorio.
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label>Fecha</Form.Label>
                                                <Col sm="6">
                                                    <Form.Control
                                                        type="date"
                                                        name="Date"
                                                        value={formData.Date}
                                                        onChange={handleInputChange}
                                                        isInvalid={errors.Date}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Este campo es obligatorio.
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col sm="6">
                                                    <Form.Select
                                                        name="clienteId"
                                                        value={formData.clienteId}
                                                        onChange={handleInputChange}
                                                        isInvalid={errors.clienteId}
                                                    >
                                                        <option value="">Cliente</option>
                                                        {users.filter(user => user.roleId === 3).map(cliente => (
                                                            <option key={cliente.id} value={cliente.id}>{cliente.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        Este campo es obligatorio.
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label>Total</Form.Label>
                                                <Col sm="6">
                                                    <Form.Control
                                                        type="number"
                                                        name="Total"
                                                        value={formData.Total}
                                                        onChange={handleInputChange}
                                                    />
                                                </Col>
                                                <Col sm="6">
                                                    <Form.Control
                                                        type="time"
                                                        name="tiempo_de_la_cita"
                                                        value={formData.tiempo_de_la_cita}
                                                        onChange={handleInputChange}
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label>Estado</Form.Label>
                                                <Col sm="12">
                                                    <Form.Select
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleInputChange}
                                                        isInvalid={errors.status}
                                                    >
                                                        <option value="">Seleccionar estado</option>
                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="completada">Completada</option>
                                                        <option value="cancelada">Cancelada</option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        Este campo es obligatorio.
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Form.Group>
                                            <div className="btn-save d-flex justify-content-end">
                                                <Button type='submit' style={{
                                            backgroundColor: '#198754', // Color de fondo verde
                                            color: 'white',           // Color del texto (icono) blanco
                                            margin: '5px',           // Márgenes alrededor del botón
                                            border: '2px solid #198754', // Borde negro de 2px
                                            borderRadius: '5px',     // Bordes redondeados
                                            padding: '5px',          // Relleno interno
                                            display: 'flex',          // Para alinear el icono centrado
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>{appointmentId ? 'Actualizar' : 'Registrar Cita'}</Button>
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

export default UpdateAppointment;
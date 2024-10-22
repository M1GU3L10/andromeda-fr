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
import { FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';

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

export default function RegisterAppointment() {
  const urlAppointments = 'http://localhost:1056/api/appointment';
  const urlUsers = 'http://localhost:1056/api/users';
  const urlServices = 'http://localhost:1056/api/services';

  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    Init_Time: '',
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
        navigate('/appointment');
      });

      setFormData({
        Init_Time: '',
        Finish_Time: '',
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

        <div className='card border-0 p-3 d-flex colorTransparent mt-3'>
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

                <div className='table-responsive mt-3 w-80 P-3'>
                  <table className='table table-bordered table-hover v-align table-striped'>
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
                        backgroundColor: '#198754',
                        color: 'white',
                        margin: '5px',
                        border: '2px solid #198754',
                        borderRadius: '5px',
                        padding: '10px',
                        display: 'flex',
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
                <div className="cont-title w-100 p-3">
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
                            isInvalid={!!errors.Init_Time}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.Init_Time}
                          </Form.Control.Feedback>
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
                            isInvalid={!!errors.Date}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.Date}
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>

                      <Form.Group as={Row} className="mb-3">
                        <Form.Label>Cliente</Form.Label>
                        <Col sm="12">
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

                      <div className="btn-save d-flex justify-content-end">
                        <Button type='submit' className='btn btn-success' style={{
                          backgroundColor: '#198754',
                          color: 'white',
                          margin: '5px',
                          border: '2px solid #198754',
                          borderRadius: '5px',
                          padding: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>Registrar</Button>
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
}
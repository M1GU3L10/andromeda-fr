import React, { useEffect, useRef, useState, useContext } from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import { MyContext } from '../../App';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FaEye } from "react-icons/fa";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Form } from 'react-bootstrap';
import Button from '@mui/material/Button';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FaMoneyBillWave } from 'react-icons/fa';
import { BsCalendar2DateFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import esLocale from "@fullcalendar/core/locales/es";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor = theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800];
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

const Appointment = () => {
    const urlUsers = 'http://localhost:1056/api/users';
    const urlAppointment = 'http://localhost:1056/api/appointment';
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const { isToggleSidebar } = useContext(MyContext);
    const [appointmentId, setAppointmentId] = useState(null);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [programming, setProgramming] = useState([]);
    const [id, setId] = useState('');
    const [Init_Time, setInit_Time] = useState('');
    const [Finish_Time, setFinish_Time] = useState('');
    const [Date, setDate] = useState('');
    const [clienteid, setClienteid] = useState('');
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState({});
    const [saleDetails, setSaleDetails] = useState([]);
    const [selectedView, setSelectedView] = useState('dayGridMonth');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');
    const urlSales = 'http://localhost:1056/api/sales'; // Agregar URL de ventas


    useEffect(() => {
        const roleId = localStorage.getItem('roleId');
        const currentUserId = localStorage.getItem('userId');
        setUserRole(roleId);
        setUserId(currentUserId);
    }, []);

    const getUserName = (users, clienteId) => {
        const user = users.find(user => user.id === clienteId);
        return user ? user.name : 'Desconocido';
    };

    const handleViewChange = (newView) => {
        setSelectedView(newView);
        if (calendarRef.current) {
            calendarRef.current.getApi().changeView(newView);
        }
    };

    const handleEmployeeChange = (event) => {
        setSelectedEmployee(event.target.value);
    };

    const filteredEvents = selectedEmployee
        ? events.filter(event => event.title === selectedEmployee)
        : events;

    const handleCloseDetailModal = () => setShowDetailModal(false);

    const [errors, setErrors] = useState({
        Init_Time: '',
        Finish_Time: '',
        Date: '',
        clienteId: '',
        appointmentDetails: []
    });

    const [touched, setTouched] = useState({
        Init_Time: false,
        Finish_Time: false,
        Date: false,
        clienteId: false,
        appointmentDetails: false
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, programmingResponse,
salesResponse] = await Promise.all([
                    axios.get(urlUsers),
                    axios.get(urlAppointment),
                    axios.get(urlSales)
                ]);

                const usersData = userResponse.data;
                const programmingData = programmingResponse.data;
                const salesData = salesResponse.data;

                setUsers(usersData);

                // Crear un mapa de appointmentId a empleadoId
                const appointmentEmployeeMap = {};
                salesData.forEach(sale => {
                    sale.SaleDetails.forEach(detail => {
                        if (detail.appointmentId && detail.empleadoId) {

appointmentEmployeeMap[detail.appointmentId] = detail.empleadoId;
                        }
                    });
                });

                let transformedEvents = programmingData.map(event => ({
                    id: event.id.toString(),
                    title: event.clienteId.toString(),
                    start: `${event.Date.split('T')[0]}T${event.Init_Time}`,
                    end: `${event.Date.split('T')[0]}T${event.Finish_Time}`,
                    extendedProps: {
                        status: event.status,
                        Total: event.Total,
                        Init_Time: event.Init_Time,
                        Finish_Time: event.Finish_Time,
                        Date: event.Date,
                        time_appointment: event.time_appointment,
                        empleadoId: appointmentEmployeeMap[event.id]
                    }
                }));

                // Filtrar eventos según el rol
                if (userRole === '2') { // Rol de empleado
                    transformedEvents = transformedEvents.filter(event =>
                        event.extendedProps.empleadoId?.toString() === userId
                    );
                }

                setEvents(transformedEvents);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [userRole, userId]);

    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);  // Agregar un pequeño retraso antes de disparar el evento resize
    }, [isToggleSidebar]);

    ///detalle venta

    const getSaleDetailsByAppointmentId = async (id) => {
        try {
          const response = await axios.get(`${urlAppointment}/sale-details/${id}`);
          setSaleDetails(response.data);
        } catch (error) {
          console.error('Error fetching sale details:', error);
          setSaleDetails([]);
        }
      };

    const getProgramming = async () => {
        try {
            const [programmingResponse, salesResponse] = await Promise.all([
                axios.get(urlAppointment),
                axios.get(urlSales)
            ]);

            const programmingData = programmingResponse.data;
            const salesData = salesResponse.data;

            const appointmentEmployeeMap = {};
            salesData.forEach(sale => {
                sale.SaleDetails.forEach(detail => {
                    if (detail.appointmentId && detail.empleadoId) {
                        appointmentEmployeeMap[detail.appointmentId] =
detail.empleadoId;
                    }
                });
            });

            let transformedEvents = programmingData.map(event => ({
                id: event.id.toString(),
                title: event.clienteId.toString(),
                start: `${event.Date.split('T')[0]}T${event.Init_Time}`,
                end: `${event.Date.split('T')[0]}T${event.Finish_Time}`,
                extendedProps: {
                    status: event.status,
                    Total: event.Total,
                    Init_Time: event.Init_Time,
                    Finish_Time: event.Finish_Time,
                    time_appointment: event.time_appointment,
                    Date: event.Date,
                    empleadoId: appointmentEmployeeMap[event.id]
                }
            }));

            if (userRole === '2') {
                transformedEvents = transformedEvents.filter(event =>
                    event.extendedProps.empleadoId?.toString() === userId
                );
            }

            setEvents(transformedEvents);
        } catch (error) {
            console.error('Error fetching programming:', error);
        }
    };


    const handleDateClick = (arg) => {
        navigate('/appointmentRegister', { state: { date: arg.dateStr } });
    };



    const FiltrarUsers = () => {
        return users.filter(user => user.roleId === 3);
    };

    const EventComponent = ({ info, setAppointmentId }) => {
        const [isHovered, setIsHovered] = useState(false);
        const [anchorEl, setAnchorEl] = useState(null);
        const [isMenuOpen, setIsMenuOpen] = useState(false);

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
            setIsMenuOpen(true);
        };

        const handleClose = () => {
            setAnchorEl(null);
            setIsMenuOpen(false);
        };


        //buscar el nmbre del id

        const getServiceById = async (id) => {
            // Suponiendo que tienes una API que devuelve un servicio por ID
            const response = await axios.get(`http://localhost:1056/api/services/${id}`);
            return response.data.name;
        };

        const getEmployeeById = async (id) => {
            // Suponiendo que tienes una API que devuelve un empleado por ID
            const response = await axios.get(`http://localhost:1056/api/users/${id}`);
            return response.data.name;  // Devuelve el nombre del empleado
        };

        //

        const handleViewClick = async () => {
            setAppointmentId(info.event.id);
            
           
            const userName = await getUserName(users, parseInt(info.event.title));

            setDetailData({
                title: userName || 'Cliente Desconocido',
                start: info.event.Init_Time,  // Usar la combinación de fecha y hora
                end: info.event.Finish_Time,
                Date: info.event.extendedProps.Date,
                status: info.event.extendedProps.status,
                Init_Time: info.event.extendedProps.Init_Time,
                Finish_Time: info.event.extendedProps.Finish_Time,
                time_appointment: info.event.extendedProps.time_appointment,
                Total: info.event.extendedProps.Total
            });
            await getSaleDetailsByAppointmentId(info.event.id);
            setShowDetailModal(true);
            handleClose();
        };


        return (
            <div
                className='programming-content'
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    if (!isMenuOpen) {
                        handleClose();
                    }
                }}
                onClick={handleClick}
            >
                {!isHovered ? (
                    <span className='span-programming'>{getUserName(users, parseInt(info.event.title))}</span>
                ) : (
                    <span className='span-programming'>{info.event.extendedProps.status}-{info.event.extendedProps.Finish_Time}</span>

                )}

                <Menu
                    className='Menu-programming'
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        onMouseEnter: () => setIsMenuOpen(true),
                        onMouseLeave: handleClose,
                        style: {
                            maxHeight: 48 * 4.5,
                        },
                    }}        
                >
                    <MenuItem className='Menu-programming-item' onClick={handleViewClick}>
                        <Button color='primary' className='primary'>
                            <FaEye />
                        </Button>
                    </MenuItem>
                </Menu>
            </div>
        );
    };
    const handleClose = () => setShowModal(false);

    const validateStartTime = (value) => {
        if (!value) {
            return 'La hora de inicio es requerida';
        }
        return '';
    };

    const validateEndTime = (value, startTime) => {
        if (!value) {
            return 'La hora de fin es requerida';
        }
        if (startTime && value <= startTime) {
            return 'La hora de fin debe ser mayor que la hora de inicio';
        }
        return '';
    };

    const validateDate = (value) => {
        if (!value) {
            return 'La fecha es requerida';
        }
        return '';
    };

    const validateUserId = (value) => {
        if (!value) {
            return 'Debe seleccionar un usuario';
        }
        return '';
    };

    const handleValidation = (name, value) => {
        let error = '';
        switch (name) {
            case 'startTime':
                error = validateStartTime(value);
                break;
            case 'endTime':
                error = validateEndTime(value);
                break;
            case 'day':
                error = validateDate(value);
                break;
            case 'userId':
                error = validateUserId(value);
                break;
            default:
                break;
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
        handleValidation(name, e.target.value);
    };


    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Citas</span>
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
                                    label="Salidas"
                                    icon={<FaMoneyBillWave fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Citas"
                                    icon={<BsCalendar2DateFill fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card shadow border-0 p-3'>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                        <div>
                            <Form.Select
                                value={selectedView}
                                onChange={(e) => handleViewChange(e.target.value)}
                                style={{ width: 'auto', display: 'inline-block', marginRight: '10px' }}
                            >
                                <option value="dayGridMonth">Mes</option>
                                <option value="timeGridWeek">Semana</option>
                                <option value="timeGridDay">Día</option>
                            </Form.Select>
                            <Form.Select
                                value={selectedEmployee}
                                onChange={handleEmployeeChange}
                                style={{ width: 'auto', display: 'inline-block' }}
                            >
                                <option value="">Todos los clientes</option>
                                {FiltrarUsers().map(user => (
                                    <option key={user.id} value={user.id.toString()}>{user.name}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>
                    <div className='table-responsive mt-3'>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView={selectedView}
                            locale="es"
                            locales={[esLocale]}
                            events={filteredEvents}
                            eventContent={(info) => <EventComponent info={info} setAppointmentId={setAppointmentId} />}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: ''
                            }}
                            dateClick={handleDateClick}
                        />
                    </div>
                </div>
            </div>
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de la <i class="fa fa-credit-card" aria-hidden="true"></i></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5 className="border-bottom pb-2">Informaciòn de la cita</h5>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Cliente:</strong> {detailData.title}</p>
                <p><strong>Fecha:</strong> {detailData.Date}</p>
                <p><strong>Hora inicio:</strong> {detailData.Init_Time}</p>
                <p><strong>Hora fin:</strong> {detailData.Finish_Time}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Duraciòn de la cita:</strong> {detailData.time_appointment}<strong> Minutos</strong></p>
                <p><strong>Total:</strong> {detailData.Total}</p>
                <p><strong>Estado:</strong> {detailData.status}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="border-bottom pb-2">Detalle de la venta</h5>
            {saleDetails.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Nombre</th>
                      <th>Cantidad</th>
                      <th>Precio unit</th>
                      <th>Total</th>
                      <th>Empleado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleDetails.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.type}</td>
                        <td>{detail.productName}</td>
                        <td>{detail.quantity}</td>
                        <td>${detail.price.toLocaleString()}</td>
                        <td>${detail.total.toLocaleString()}</td>
                        <td>{detail.employeeName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No se encuentran productos en esta cita.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
                                Cerrar
                            </Button>
        </Modal.Footer>
      </Modal>
        </div>
    );
};

export default Appointment;
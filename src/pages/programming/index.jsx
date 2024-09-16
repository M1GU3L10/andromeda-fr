import React, { useEffect, useRef, useState, useContext } from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaUserCog } from "react-icons/fa";
import { RxScissors } from "react-icons/rx";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import { MyContext } from '../../App';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Form, Col, Row } from 'react-bootstrap';
import Button from '@mui/material/Button';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { show_alerta } from '../../assets/functions'



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

const EventComponent = ({ info }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        setIsMenuOpen(true); // Abrir el menú
    };

    const handleClose = () => {
        setAnchorEl(null);
        setIsMenuOpen(false); // Cerrar el menú
    };

    const handleEdit = () => {
        console.log("Editar evento:", info.event);
        handleClose();
    };

    const handleView = () => {
        console.log("Ver detalles del evento:", info.event);
        handleClose();
    };

    const handleDelete = () => {
        console.log("Eliminar evento:", info.event);
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
                    handleClose(); // Cerrar el menú si no está abierto
                }
            }}
            onClick={handleClick}  // Abrir el menú al hacer clic
        >
            {!isHovered ? (
                <span className='span-programming'>{info.event.title}</span>
            ) : (
                <span className='span-programming'>{info.event.extendedProps.startTime}-{info.event.extendedProps.endTime}</span>
            )}

            {/* Menu component */}
            <Menu
                className='Menu-programming'
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    onMouseEnter: () => setIsMenuOpen(true), // Mantener abierto cuando el mouse entra
                    onMouseLeave: handleClose, // Cerrar cuando el mouse sale
                    style: {
                        maxHeight: 48 * 4.5,
                    },
                }}
            >

                <MenuItem className='Menu-programming-item' onClick={handleEdit}>
                    <Button color='primary' className='primary'>
                        <FaEye />
                    </Button>
                </MenuItem>
                <MenuItem className='Menu-programming-item' onClick={handleView}>
                    <Button color="secondary" className='secondary'>
                        <FaPencilAlt />
                    </Button>
                </MenuItem>
                <MenuItem className='Menu-programming-item' onClick={handleDelete}>
                    <Button color='error' className='delete'>
                        <IoTrashSharp />
                    </Button>
                </MenuItem>
            </Menu>
        </div>
    );
};

const Programming = () => {
    const urlUsers = 'http://localhost:1056/api/users';
    const urlProgramming = 'http://localhost:1056/api/programming';
    const calendarRef = useRef(null);
    const { isToggleSidebar } = useContext(MyContext);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [programming, setProgramming] = useState([]);
    const [id, setId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [day, setDay] = useState('');
    const [userid, setUserid] = useState('');
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState({});



    const handleCloseDetailModal = () => setShowDetailModal(false);

    const [errors, setErrors] = useState({
        startTime: '',
        endTime: '',
        day: '',
        userid: '',
    });

    const [touched, setTouched] = useState({
        startTime: false,
        endTime: false,
        day: false,
        tiuseridme: false,
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, programmingResponse] = await Promise.all([
                    axios.get(urlUsers),
                    axios.get(urlProgramming),
                ]);

                const usersData = userResponse.data;
                const programmingData = programmingResponse.data;

                setUsers(usersData);

                const transformedEvents = programmingData.map(event => ({
                    id: event.id.toString(),
                    title: `${getUserName(usersData, event.userId)}`,
                    start: `${event.day}T${event.startTime}`,
                    end: `${event.day}T${event.endTime}`,
                    extendedProps: {
                        status: event.status,
                        startTime: event.startTime,
                        endTime: event.endTime,
                    }
                }));

                setEvents(transformedEvents);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);  // Agregar un pequeño retraso antes de disparar el evento resize
    }, [isToggleSidebar]);

    const getProgramming = async () => {
        try {
            const response = await axios.get(urlProgramming);
            const programmingData = response.data;
            const transformedEvents = programmingData.map(event => ({
                id: event.id.toString(),
                title: `${getUserName(users, event.userId)}`,
                start: `${event.day}T${event.startTime}`,
                end: `${event.day}T${event.endTime}`,
                extendedProps: {
                    status: event.status,
                    startTime: event.startTime,
                    endTime: event.endTime,
                }
            }));
            setEvents(transformedEvents);
        } catch (error) {
            console.error('Error fetching programming:', error);
        }
    };

    const getUserName = (users, userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : 'Desconocido';
    };

    const FiltrarUsers = () => {
        return users.filter(user => user.roleId === 2);
    }

    const EventComponent = ({ info }) => {
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

        const handleEditClick = () => {
            handleEdit(info.event);
            handleClose();
        };

        const handleViewClick = () => {
            setDetailData({
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                startTime: info.event.extendedProps.startTime,
                endTime: info.event.extendedProps.endTime,
            });
            setShowDetailModal(true);
            handleClose();
        };

        const handleDeleteClick = () => {
            deleteProgramming(info.event.id, info.event.title);
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
                    <span className='span-programming'>{info.event.title}</span>
                ) : (
                    <span className='span-programming'>
                        {info.event.extendedProps.startTime.slice(0, 5)} - {info.event.extendedProps.endTime.slice(0, 5)}
                    </span>

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
                    <MenuItem className='Menu-programming-item' onClick={handleEditClick}>
                        <Button color="secondary" className='secondary'>
                            <FaPencilAlt />
                        </Button>
                    </MenuItem>
                    <MenuItem className='Menu-programming-item' onClick={handleDeleteClick}>
                        <Button color='error' className='delete'>
                            <IoTrashSharp />
                        </Button>
                    </MenuItem>
                </Menu>
            </div>
        );
    };


    const handleEdit = (event) => {
        // Extraer los valores del evento
        const { id, extendedProps, start, end } = event;


        const startDate = start ? new Date(start) : new Date();
        //si viene vacio enddate se asignara un valor mayor por una hora a start si quiere se puede quitar
        const endDate = end ? new Date(end) : new Date(startDate.getTime() + 3600000);

        const formatTime = (date) => {
            return date.toTimeString().slice(0, 5);
        };

        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        // Asigna los valores a los estados del formulario
        setId(id || '');
        setStartTime(formatTime(startDate));
        setEndTime(formatTime(endDate));
        setDay(formatDate(startDate));
        setUserid(userid);


        setTitle('Editar Programación');
        setOperation(2);  // Indicar que es una operación de edición

        setShowModal(true);
    };

    const openModal = (op, date = null, id = '', start = '', end = '', userid = '') => {
        setId(id);
        setStartTime(start ? start.slice(0, 5) : '');
        setEndTime(end ? end.slice(0, 5) : '');
        setDay(date ? date.toISOString().split('T')[0] : '');
        setUserid(userid ? userid.toString() : '');
        setOperation(op);

        setTitle(op === 1 ? 'Registrar Programación' : 'Editar Programación');
        setShowModal(true);
    }

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleValidation(name, value);

        switch (name) {
            case 'startTime':
                setStartTime(value);
                break;
            case 'endTime':
                setEndTime(value);
                break;
            case 'date':
                setDay(value);
                break;
            case 'userId':
                setUserid(value)
                break;
            default:
                break;
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
        handleValidation(name, e.target.value);
    };

    const validar = async () => {

        if (errors.startTime || !startTime.trim()) {
            show_alerta(errors.startTime || 'Por favor, Seleccione una hora de inicio.', 'warning');
            return;
        }

        if (errors.endTime || !endTime.trim()) {
            show_alerta(errors.endTime || 'Por favor, Seleccione una hora de fin.', 'warning');
            return;
        }

        if (errors.day || !day.trim()) {
            show_alerta(errors.day || 'Por favor, Seleccione un dia.', 'warning');
            return;
        }

        if (errors.userid || !userid.trim()) {
            show_alerta(errors.userid || 'Por favor, Seleccione un usuario.', 'warning');
            return;
        }

        const isValidStartTime = !validateEndTime(startTime);
        const isValidEndTime = !validateEndTime(endTime);
        const isValidDate = !validateDate(day);
        const isValidUser = !validateUserId(userid);

        if (!isValidStartTime) show_alerta(errors.startTime, 'warning');
        else if (!isValidEndTime) show_alerta(errors.endTime, 'warning');
        else if (!isValidDate) show_alerta(errors.day, 'warning');
        else if (!isValidUser) show_alerta(errors.userid, 'warning');
        else {
            const parametros = {
                id: id,
                startTime: `${startTime}:00`,
                endTime: `${endTime}:00`,
                day: day,
                userId: userid,
            };

            const isUpdate = operation === 2;
            const metodo = isUpdate ? 'PUT' : 'POST';
            enviarSolicitud(metodo, parametros);
        }
    };

    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${urlProgramming}/${parametros.id}` : urlProgramming;
        try {
            await axios({ method: metodo, url: urlWithId, data: parametros });
            show_alerta('Operación exitosa', 'success');
            if (metodo === 'PUT' || metodo === 'POST') {
                document.getElementById('btnCerrar').click();
            }
            getProgramming();
            console.log(parametros);
        } catch (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
            console.log(parametros);
        }
    };

    const deleteProgramming = async (id, userid) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: 'Estas seguro que desea eliminar la programacion del empleado ' + userid + '?',
            icon: 'question',
            text: 'No se podrá dar marcha atras',
            showCancelButton: true,
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setId(id);
                enviarSolicitud('DELETE', { id: id })
            } else {
                show_alerta('La programacion no fue eliminado', 'info')
            }
        })
    }

    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Programación de empleados</span>
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
                                    icon={<RxScissors fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Programación"
                                    icon={<FaUserCog fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card shadow border-0 p-3'>
                    <div className='table-responsive mt-3'>
                        <FullCalendar
                            ref={calendarRef}
                            initialView="dayGridMonth"
                            events={events}
                            eventContent={(info) => <EventComponent info={info} />}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            dateClick={(info) => openModal(1, info.date)}
                        />
                    </div>
                </div>
            </div>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col sm="6">
                                <Form.Group className="mb-3">
                                    <Form.Label className='required'>Hora de inicio</Form.Label>
                                    <Form.Control
                                        type="time"
                                        id="startTime"
                                        name="startTime"
                                        placeholder="Inicio"
                                        value={startTime}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.startTime}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.startTime}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm="6">
                                <Form.Group className="mb-3">
                                    <Form.Label className='required'>Hora de fin</Form.Label>
                                    <Form.Control
                                        type="time"
                                        id="endTime"
                                        name="endTime"
                                        placeholder="Fin"
                                        value={endTime}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.endTime}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.endTime}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col sm="6">
                                <Form.Group className="mb-3">
                                    <Form.Label className='required'>Día</Form.Label>
                                    <Form.Control
                                        type="date"
                                        id="date"
                                        name="date"
                                        placeholder="Fecha"
                                        value={day}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.date}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.date}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm="6">
                                <Form.Group className="mb-3">
                                    <Form.Label className='required'>Usuario</Form.Label>
                                    <Form.Select
                                        id='userId'
                                        name="userId"
                                        value={userid}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.userid}
                                    >
                                        <option value="">Seleccionar usuario</option>
                                        {FiltrarUsers().map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.userid}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        className='btn-sucess'
                        onClick={() => validar()}>
                        Guardar
                    </Button>

                    <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showDetailModal} onHide={handleCloseDetailModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles de la Programación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Empleado:</strong> {detailData.title}</p>
                    <p><strong>Fecha:</strong> {detailData.start ? new Date(detailData.start).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Hora de inicio:</strong> {detailData.startTime}</p>
                    <p><strong>Hora de fin:</strong> {detailData.endTime}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseDetailModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Programming;
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
import Button from '@mui/material/Button';

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
    const menuRef = useRef(null); // Referencia para el menú

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            className='programming-content'
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}  // Abrir el menú al hacer clic
        >
            {!isHovered ? (
                <span className='span-programming'>{info.event.title}</span>
            ) : (
                <span className='span-programming'>{info.event.extendedProps.startTime}-{info.event.extendedProps.endTime}</span>
            )}

            {/* Menu component */}
            <Menu
                ref={menuRef} // Asignar la referencia al menú
                className='Menu-programming'
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 48 * 4.5,
                    },
                }}
            >
                <MenuItem className='Menu-programming-item' onClick={handleEdit}><Button color='primary' className='primary'><FaEye /></Button></MenuItem>
                <MenuItem className='Menu-programming-item' onClick={handleView}><Button color="secondary" className='secondary'><FaPencilAlt /></Button></MenuItem>
                <MenuItem className='Menu-programming-item' onClick={handleDelete}><Button color='error' className='delete' ><IoTrashSharp /></Button></MenuItem>
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

    const getUserName = (users, userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : 'Desconocido';
    };

    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Programacion de empleados</span>
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
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            eventContent={(info) => <EventComponent info={info} />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Programming;

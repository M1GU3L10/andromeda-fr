import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App.js';
import logo from '../../assets/images/logo-light.png';
import { Avatar, Menu, MenuItem, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import axios from 'axios';
import { Form } from 'react-bootstrap';



const Index = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedView, setSelectedView] = useState('dayGridMonth');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState({});

    const urlUsers = 'http://localhost:1056/api/users';
    const urlAppointment = 'http://localhost:1056/api/appointment';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        context.setThemeMode(false)
        checkLoginStatus();
        fetchData();
    }, [context]);

    const fetchData = async () => {
        try {
            const [userResponse, programmingResponse] = await Promise.all([
                axios.get(urlUsers),
                axios.get(urlAppointment),
            ]);
    
            const usersData = userResponse.data;
            const programmingData = programmingResponse.data.filter(event => event.clienteId.toString() === localStorage.getItem('userId'));
    
            setUsers(usersData);
            
            const transformedEvents = programmingData.map(event => ({
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
                    DetailAppointments: event.DetailAppointments,
                }
            }));
    
            setEvents(transformedEvents);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const storedEmail = localStorage.getItem('userName');
        const idRole = localStorage.getItem('roleId');
        const userId = localStorage.getItem('userId');
        if (token && storedEmail && idRole && userId) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
            setUserRole(idRole);
        } else {
            setIsLoggedIn(false);
            setUserEmail('');
            setUserRole('');
        }
    };
    
    

    const handleLogin = () => {
        navigate('/login');
    };

    const handledashboard = () => {
        context.setIsHideSidebarAndHeader(false);
        navigate('/services');
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
        localStorage.removeItem('userEmail');
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

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const getUserInitial = () => {
        return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
    };

    const handleDateClick = (arg) => {
        navigate('/registerview', { state: { date: arg.dateStr } });
    };

    const handleViewChange = (newView) => {
        setSelectedView(newView);
        if (calendarRef.current) {
            calendarRef.current.getApi().changeView(newView);
        }
    };

    const getUserName = (users, clienteId) => {
        const user = users.find(user => user.id === clienteId);
        return user ? user.name : 'Desconocido';
    };

    // Event Component for the calendar
    const EventComponent = ({ info }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <div
                className='programming-content'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {!isHovered ? (
                    <span className='span-programming'>{getUserName(users, parseInt(info.event.title))}</span>
                ) : (
                    <span className='span-programming'>{info.event.extendedProps.Init_Time}-{info.event.extendedProps.Finish_Time}</span>
                )}
            </div>
        );
    };

    return (
        <>
            <header className={`header-index1 ${isScrolled ? 'abajo' : ''}`}>
                <Link to={'/'} className='d-flex align-items-center logo-index'>
                    <img src={logo} alt="Logo" />
                    <span className='ml-2'>Barberia Orion</span>
                </Link>
                <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
                    <nav className='navBar-index'>
                        <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
                        <Link to='/appointmentView'>CITAS</Link>
                        <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
                        <Link to='/contact' onClick={() => setIsNavOpen(false)}>CONTACTO</Link>
                    </nav>

                    <div className="auth-buttons">
                        {isLoggedIn && userEmail ? (
                            <div className="user-menu">
                                <Button
                                    onClick={handleMenuClick}
                                    className="userLoginn"
                                    startIcon={
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                backgroundColor: '#b89b58'
                                            }}
                                        >
                                            {getUserInitial()}
                                        </Avatar>
                                    }
                                >
                                    {userEmail}
                                </Button>
                                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} className='menu-landingPage'>
                                    {userRole == 1 || userRole == 2 ? (
                                        <MenuItem onClick={handledashboard} className='menu-item-landingPage'><GrUserAdmin />Administrar</MenuItem>
                                    ) : (
                                        <MenuItem>Carrito</MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout} className='menu-item-landingPage'><GiExitDoor />Cerrar Sesión</MenuItem>
                                </Menu>
                            </div>
                        ) : (
                            <Button
                                variant="contained"
                                className="book-now-btn"
                                onClick={handleLogin}
                            >
                                Iniciar sesión
                            </Button>
                        )}
                    </div>
                </div>
            </header>

                    <div className='d-flex justify-content-between align-items-center mb-3 mt-5 p-5'>
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
                        </div>
                    </div>
                    <div className='table-responsive mt-3 p-5'>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView={selectedView}
                            events={events}
                            eventContent={(info) => <EventComponent info={info} />}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: ''
                            }}
                            dateClick={handleDateClick}
                        />
                    </div>
            
        </>
    );
};

export default Index;
'use client'

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
import esLocale from '@fullcalendar/core/locales/es';
import { GrUser } from 'react-icons/gr';
import axios from 'axios';

import { Modal, Form } from 'react-bootstrap';
import { FaEye } from "react-icons/fa";


export default function CalendarioBarberia({ info }) {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isToggleSidebar } = useContext(MyContext);
  const [userId, setUserId] = useState('');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedView, setSelectedView] = useState('dayGridMonth');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [saleDetails, setSaleDetails] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const urlSales = 'http://localhost:1056/api/sales';
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

  const getSaleDetailsByAppointmentId = async (id) => {
    try {
      const response = await axios.get(`${urlAppointment}/sale-details/${id}`);
      setSaleDetails(response.data);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      setSaleDetails([]);
    }
  };

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


  const handleViewClick = async (info) => {
    if (!info || !info.event) {
      console.error('Event is undefined');
      return;
    }

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

  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };
  const filteredEvents = selectedEmployee
    ? events.filter(event => event.title === selectedEmployee)
    : events;

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
    toast.error('Sesión cerrada', {
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
  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
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

  return (
    <div className="min-h-screen bg-gray-50">

      <header className={`header-index1 ${isScrolled ? 'abajo' : ''}`}>
        <Link to={'/'} className='d-flex align-items-center logo-index'>
          <img src={logo} alt="Logo" />
          <span className='ml-2'>Barberia Orion</span>
        </Link>
        <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
          <nav className='navBar-index'>
            <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
            {
              userRole == 1 || userRole == 3 && (<Link to='/appointmentView'>CITAS</Link>)
            }
            <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>

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
                    <MenuItem onClick={handledashboard} className='menu-item-landingPage'>
                      <GrUserAdmin /> Administrar
                    </MenuItem>
                  ) : (
                    <MenuItem></MenuItem>
                  )}
                  <MenuItem component={Link} to='/profileview' onClick={() => setIsNavOpen(false)} className='menu-item-landingPage'>
                    <GrUser /> Mi perfil
                  </MenuItem>
                  <MenuItem onClick={handleLogout} className='menu-item-landingPage'>
                    <GiExitDoor /> Cerrar Sesión
                  </MenuItem>
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
      <br /><br /><br /><br /><br />
      {/* Contenedor Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-[#b89b58]/20">
          <div className="p-6">
            <Form.Select
              value={selectedView}
              onChange={(e) => handleViewChange(e.target.value)}
              className="w-40 bg-black text-white border border-[#b89b58] rounded-lg shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b89b58] focus:border-transparent transition-all duration-200 cursor-pointer appearance-none hover:bg-[#b89b58]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b89b58'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              <option value="dayGridMonth" className="bg-black text-white hover:bg-[#b89b58]">
                Mes
              </option>
              <option value="timeGridWeek" className="bg-black text-white hover:bg-[b89b58]">
                Semana
              </option>
              <option value="timeGridDay" className="bg-black text-white hover:bg-[#b89b58]">
                Día
              </option>
            </Form.Select>


          </div>
          <div className="table-responsive mt-3">
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
                right: '',
              }}
              dateClick={handleDateClick}
            />
          </div>

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
              <Button
                onClick={handleViewClick}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <FaEye size={20} color="#b89b58" />
              </Button>

            </MenuItem>
          </Menu>

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




      <style jsx global>{`
  .calendar-container {
    background: #1a1a1a;
  }

  .fc {
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 100%;
    background: #1a1a1a;
    color: #fff;
  }
    

  .fc .fc-toolbar {
    padding: 1rem;
    margin-bottom: 0;
    background: #1a1a1a;
  }

  .fc .fc-toolbar-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #ffffff !important;
    text-transform: capitalize;
  }

  .fc .fc-button {
    background-color: #2d2d2d !important;
    border: 1px solid #b89b58 !important;
    color: #b89b58 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .fc .fc-button:hover {
    background-color: #b89b58 !important;
    color: #1a1a1a !important;
    transform: translateY(-1px);
  }

  .fc .fc-button-primary:not(:disabled).fc-button-active,
  .fc .fc-button-primary:not(:disabled):active {
    background-color: #b89b58 !important;
    color: #1a1a1a !important;
    border-color: #b89b58 !important;
  }

  .fc-theme-standard td,
  .fc-theme-standard th {
    border-color: #333333;
  }

  .fc-theme-standard .fc-scrollgrid {
    border-color: #333333;
  }

  .fc .fc-day {
    background: #1a1a1a;
    transition: background-color 0.2s ease;
  }

  .fc .fc-day:hover {
    background-color: #2d2d2d;
  }

  .fc .fc-day-today {
    background-color: rgba(184, 155, 88, 0.1) !important;
  }

  .fc .fc-day-today .fc-daygrid-day-number {
    color: #b89b58;
    font-weight: bold;
  }

  .fc .fc-daygrid-day-number {
    color: #ffffff;
    padding: 0.5rem;
    transition: color 0.2s ease;
  }

  .fc .fc-daygrid-day:hover .fc-daygrid-day-number {
    color: #b89b58;
  }

  .fc .fc-col-header-cell {
    background: #2d2d2d;
    color: #ffffff !important;
    font-weight: 600;
    padding: 1rem 0;
    text-transform: uppercase;
    font-size: 0.875rem;
  }

  .programming-content {
    
    color: #1a1a1a;
   
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
 
  }

  .programming-content:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }

  .span-programming {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fc-day-other {
    background: #161616;
  }

  .fc-day-other .fc-daygrid-day-number {
    color: #666666;
  }

  @media (max-width: 640px) {
    .fc .fc-toolbar {
      flex-direction: column;
      gap: 1rem;
    }

    .fc .fc-toolbar-title {
      font-size: 1.25rem;
    }

    .fc .fc-button {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
  }

  /* Time Grid Specific Styles */
  .fc-timegrid-slot {
    background: #1a1a1a;
    border-color: #333333 !important;
  }

  .fc-timegrid-axis {
    background: #2d2d2d;
    color: #b89b58;
  }

  .fc .fc-timegrid-axis-cushion {
    color: #b89b58;
  }

  .fc .fc-timegrid-slot-label-cushion {
    color: #b89b58;
  }

  /* Week/Day View Specific */
  .fc-timegrid-event {
    background: #b89b58;
    border: none;
    padding: 0.25rem;
  }

  .fc-timegrid-now-indicator-line {
    border-color: #b89b58;
  }

  .fc-timegrid-now-indicator-arrow {
    border-color: #b89b58;
    color: #b89b58;
  }
`}</style>

    </div>


  );


}
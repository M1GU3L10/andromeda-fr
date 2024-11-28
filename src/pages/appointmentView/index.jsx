'use client'

import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App.js';
import { Calendar, Clock, Users, CheckCircle2, DollarSign } from 'lucide-react';
import logo from '../../assets/images/logo-light.png';
import { Avatar, Menu, MenuItem, Button, Card } from '@mui/material';
import { toast } from 'react-toastify';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Swal from 'sweetalert2';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import { GrUser } from 'react-icons/gr';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
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
      start: info.event.Init_Time,
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
        const [userResponse, programmingResponse, salesResponse] = await Promise.all([
          axios.get(urlUsers),
          axios.get(urlAppointment),
          axios.get(urlSales)
        ]);

        const usersData = userResponse.data;
        const programmingData = programmingResponse.data;
        const salesData = salesResponse.data;

        setUsers(usersData);

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
            empleadoId: appointmentEmployeeMap[event.id] || '',
            DetailAppointments: event.DetailAppointments,
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
    }, 300);
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
  const convertTo12HourFormat = (time) => {
    if (!time) return 'Hora no disponible'; // Devuelve un texto predeterminado si el tiempo no está definido

    const [hours, minutes] = time.split(':').map(Number); // Divide la hora en partes
    const period = hours >= 12 ? 'PM' : 'AM'; // Determina si es AM o PM
    const standardHours = hours % 12 || 12; // Convierte a formato de 12 horas
    return `${standardHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const EventComponent = ({ info }) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
      setIsClicked(!isClicked);
    };

    const handleViewClickWrapper = () => {
      handleViewClick(info);
    };
    const convertTo12HourFormat = (time) => {
      const [hours, minutes] = time.split(':').map(Number); // Divide la hora en partes
      const period = hours >= 12 ? 'PM' : 'AM'; // Determina si es AM o PM
      const standardHours = hours % 12 || 12; // Convierte a formato de 12 horas
      return `${standardHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };


    return (
      <div
        className='programming-content'
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onClick={handleClick}
      >
        <span className='span-programming'>{getUserName(users, parseInt(info.event.title))}</span>
        {isClicked && (
          <Button
            onClick={handleViewClickWrapper}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginLeft: '8px'
            }}
          >
            <FaEye size={20} color="#000000" />
          </Button>
        )}
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
                  <MenuItem onClick={handleLogout} className='menu
-item-landingPage'>
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-[#b89b58]/20">
          <div className="logo-container">
            <Form.Select
              value={selectedView}
              onChange={(e) => handleViewChange(e.target.value)}
              className="view-selector"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b89b58'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem",
              }}
            >
              <option value="dayGridMonth" className="view-selector-option">
                Mes
              </option>
              <option value="timeGridWeek" className="view-selector-option">
                Semana
              </option>
              <option value="timeGridDay" className="view-selector-option">
                Día
              </option>
            </Form.Select>
          </div>

          <div className="table-responsive mt-3">
            <FullCalendar
              ref={calendarRef}
              locale={esLocale}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              events={filteredEvents}
              initialView={selectedView}
              dateClick={handleDateClick}
              eventContent={(info) => <EventComponent info={info} />}
              locales={[esLocale]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
            />
          </div>
        </div>

        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
          backdrop="static"
          keyboard={true}
          centered
          className="appointment-detail-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center text-gold">
              <i className="fa fa-credit-card me-2" aria-hidden="true"></i>
              Detalle de la Cita
            </Modal.Title>
          </Modal.Header>
          

          <Modal.Body className="custom-modal-body">
            <div className="mb-4">
              <h5 className="border-bottom pb-2 text-gold">Mi cita</h5>
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Fecha:</strong> {detailData.Date}
                  </p>
                  <p>
                    <strong>Hora inicio:</strong> {convertTo12HourFormat(detailData.Init_Time)}
                  </p>
                  <p>
                    <strong>Hora fin:</strong> {convertTo12HourFormat(detailData.Finish_Time)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Duración de la cita:</strong> {detailData.time_appointment}
                    <strong> Minutos</strong>
                  </p>
                  <p>
                    <strong>Total:</strong> {detailData.Total}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="border-bottom pb-2 text-gold">Detalle de la Venta</h5>
              {saleDetails.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover align-middle">
                    <thead className="table-gold">
                      <tr>
                        <th>Tipo</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
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
                          <td>{detail.employeeName || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted fst-italic">
                  No se encuentran productos en esta cita.
                </p>
              )}
            </div>

            <div className="mt-4 text-end">
              <button
                className="btn btn-danger"
                onClick={() =>
                  Swal.fire({
                    title: '¿Estás seguro?',
                    text: "¡No podrás revertir esta acción!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, cancelar cita',
                    cancelButtonText: 'No, mantener cita',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // Aquí iría la lógica para cancelar la cita
                      Swal.fire(
                        'Cita cancelada',
                        'Tu cita ha sido cancelada.',
                        'success'
                      );
                    }
                  })
                }
              >
                Cancelar cita
              </button>
            </div>
          </Modal.Body>


        </Modal>
      </div>


      <style jsx global>{`
 * {
    box-sizing: border-box;
}

.calendar-container {
    position: relative;
    background: #1a1a1a;
    border-radius: 20px;
    box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.2), 
        inset 0 0 15px rgba(255, 255, 255, 0.05),
        0 5px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    perspective: 1000px;
    transition: all 0.4s ease;
    transform: translateY(0);
}

.calendar-container:hover {
    transform: translateY(-15px);
    box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.3), 
        inset 0 0 20px rgba(255, 255, 255, 0.1),
        0 20px 40px rgba(0, 0, 0, 0.2);
}

.fc {
    font-family: system-ui, -apple-system, sans-serif;
    background: transparent;
    color: #ffffff;
}

.fc .fc-toolbar {
    padding: 1.5rem;
    background: #1a1a1a;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

.fc .fc-toolbar-title {
    font-size: 2rem;
    font-weight: 700;
    color: #fff !important;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.fc .fc-button {
    background-color: #2d2d2d !important;
    border: 1px solid #b89b58 !important;
    color: #b89b58 !important;
    box-shadow: 
        0 4px 6px rgba(0, 0, 0, 0.1), 
        inset 0 0 10px rgba(255, 255, 255, 0.05);
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    border-radius: 10px;
}

.fc .fc-button:hover {
    background-color: #b89b58 !important;
    color: #1a1a1a !important;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 
        0 6px 10px rgba(0, 0, 0, 0.2), 
        inset 0 0 15px rgba(0, 0, 0, 0.1);
}

.fc-theme-standard .fc-scrollgrid {
    border-color: #333333;
    background: #1a1a1a;
    border-radius: 15px;
}

.fc .fc-day {
    background: #1a1a1a;
    transition: all 0.3s ease;
}

.fc .fc-day:hover,
.fc .fc-day.fc-day-today:hover {
    background: #2d2d2d;
    transform: translateY(-5px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    z-index: 10;
    position: relative;
}

.fc .fc-day-today {
    background: rgba(184, 155, 88, 0.1) !important;
    border-radius: 10px;
}

.fc .fc-day-today .fc-daygrid-day-number {
    color: #b89b58;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.fc .fc-daygrid-day-number {
    color: #ffffff;
    padding: 0.7rem;
    transition: all 0.3s ease;
    border-radius: 8px;
}

.fc .fc-daygrid-day:hover .fc-daygrid-day-number {
    color: #b89b58;
}

.fc .fc-col-header-cell {
    background: #2d2d2d;
    color: #fff !important;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}

.fc-day-other {
    background: #161616;
}

.fc-day-other .fc-daygrid-day-number {
    color: #666666;
}

@media (max-width: 640px) {
    .calendar-container:hover {
        transform: translateY(-10px);
    }
}

/* Estilos específicos para este modal que no interferirán con otras modales */
.appointment-detail-modal .modal-content {
    background-color: #f4f4f4;
    color: #333;
    border-radius: 15px;
    border: 2px solid #a38928;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.appointment-detail-modal .modal-header {
    border-bottom: 2px solid #a38928;
    background-color: #f9f9f9;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}

.appointment-detail-modal .modal-title {
    color: #a38928;
    display: flex;
    align-items: center;
    font-weight: 600;
}

.appointment-detail-modal .modal-title i {
    margin-right: 10px;
    color: #a38928;
}

.appointment-detail-modal .btn-close {
    background-color: rgba(163, 137, 40, 0.1);
    border-radius: 50%;
    opacity: 0.7;
}

.appointment-detail-modal .btn-close:hover {
    background-color: rgba(163, 137, 40, 0.2);
    opacity: 1;
}

.appointment-detail-modal .modal-body {
    background-color: #ffffff;
    padding: 1.5rem;
}

.appointment-detail-modal h5 {
    color: #a38928;
    border-bottom-color: #a38928 !important;
}

.appointment-detail-modal .table {
    background-color: #ffffff;
    color: #333;
}

.appointment-detail-modal .table thead {
    background-color: #f1f1f1;
    color: #a38928;
}

.appointment-detail-modal .table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(163, 137, 40, 0.05);
}

.appointment-detail-modal .table-hover tbody tr:hover {
    background-color: rgba(163, 137, 40, 0.1);
}

.appointment-detail-modal .text-gold {
    color: #a38928 !important;
}
.view-button {
    background: none;
    border: none;
    color: gold;
    cursor: pointer;
}

.view-button:hover {
    color: darkgoldenrod;
}
.calendar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(145deg, #1e1e2e, #161623);
  border-radius: 20px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.2), 
    inset 0 0 15px rgba(255, 255, 255, 0.05),
    0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  perspective: 1000px;
  transition: all 0.4s ease;
  transform: translateY(0);
}

.calendar-container:hover {
  transform: translateY(-15px);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3), 
    inset 0 0 20px rgba(255, 255, 255, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.2);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: linear-gradient(90deg, rgba(30, 30, 46, 0.8), rgba(22, 22, 35, 0.8));
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.calendar-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.view-selector {
  background-color: #000000;
  color: #b89b58;
  border: 1px solid #b89b58/30;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  appearance-none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b89b58'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-selector:hover {
  background-color: #00000;
  color: #b89b58;
  transform: translateY(-2px) scale(0.97);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2), 
    inset 0 0 15px rgba(0, 0, 0, 0.1);
}

.calendar-content {
  width: 100%;
  background: #1a1a1a;
  border-radius: 15px;
  padding: 1.5rem;
}
`}</style>

    </div>


  );


}
import React, { useEffect, useRef, useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaUserCog } from "react-icons/fa";
import { RxScissors } from "react-icons/rx";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import axios from 'axios';
import { Modal, Form } from 'react-bootstrap';
import Button from '@mui/material/Button';
import { FaEye } from "react-icons/fa";

const Programming = () => {
  const urlAppointments = 'http://localhost:1056/api/appointment';
  const urlUsers = 'http://localhost:1056/api/users';
  const urlSales = 'http://localhost:1056/api/sales';
  const urlAbsences = 'http://localhost:1056/api/absences';
  const calendarRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [selectedView, setSelectedView] = useState('dayGridMonth');
  const [userRole, setUserRole] = useState(null);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    setUserRole(parseInt(storedUserRole));

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, appointmentResponse, salesResponse, absencesResponse] = await Promise.all([
        axios.get(urlUsers),
        axios.get(urlAppointments),
        axios.get(urlSales),
        axios.get(urlAbsences)
      ]);

      const clientsData = userResponse.data.filter(user => user.roleId === 3);
      setClients(clientsData);

      const appointmentsData = appointmentResponse.data;
      const salesData = salesResponse.data;
      const absencesData = absencesResponse.data;

      // Transform appointments
      const transformedAppointments = appointmentsData.map(appointment => ({
        id: appointment.id.toString(),
        title: `Cita con ${getClientName(clientsData, appointment.clienteId)}`,
        start: `${appointment.Date}T${appointment.Init_Time}`,
        end: `${appointment.Date}T${appointment.Finish_Time}`,
        backgroundColor: '#3788d8',
        extendedProps: {
          type: 'appointment',
          clienteId: appointment.clienteId,
          status: appointment.status,
          total: appointment.Total,
          saleDetails: salesData.find(sale => sale.appointmentId === appointment.id)?.SaleDetails || []
        }
      }));

      // Transform absences
      const transformedAbsences = absencesData.map(absence => ({
        id: `absence-${absence.id}`,
        title: `Ausente`,
        start: `${absence.date}T${absence.startTime}`,
        end: `${absence.date}T${absence.endTime}`,
        backgroundColor: '#3788d8',
        extendedProps: {
          type: 'absence',
          description: absence.description,
          status: absence.status,
          userId: absence.userId
        }
      }));

      // Combine all events
      const allEvents = [...transformedAppointments, ...transformedAbsences];
      setAllEvents(allEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getClientName = (clients, clientId) => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : 'Desconocido';
  };

  const handleViewChange = (newView) => {
    setSelectedView(newView);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView);
    }
  };

  const handleEventClick = (clickInfo) => {
    const eventType = clickInfo.event.extendedProps.type;
    
    if (eventType === 'absence') {
      setDetailData({
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        description: clickInfo.event.extendedProps.description,
        status: clickInfo.event.extendedProps.status,
        type: 'absence'
      });
    } else {
      setDetailData({
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        status: clickInfo.event.extendedProps.status,
        total: clickInfo.event.extendedProps.total,
        saleDetails: clickInfo.event.extendedProps.saleDetails,
        type: 'appointment'
      });
    }
    
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => setShowDetailModal(false);

  const EventComponent = ({ info }) => {
    return (
      <div className='appointment-content'>
        <span className='span-appointment'>{info.event.title}</span>
        {userRole === 1 && (
          <Button color='primary' className='view-button' onClick={() => handleEventClick(info)}>
            <FaEye />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-5'>
            <span className='Title'>Citas y Ausencias</span>
          </div>
          <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
            <Breadcrumbs aria-label="breadcrumb">
              <Chip component="a" href="#" label="Home" icon={<HomeIcon fontSize="small" />} />
              <Chip component="a" href="#" label="Servicios" icon={<RxScissors fontSize="small" />} />
              <Chip component="a" href="#" label="Citas" icon={<FaUserCog fontSize="small" />} />
            </Breadcrumbs>
          </div>
        </div>
        <div className='card shadow border-0 p-3'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
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
          <div className='table-responsive mt-3'>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={selectedView}
              events={allEvents}
              eventContent={(info) => <EventComponent info={info} />}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
            />
          </div>
        </div>
      </div>
      <Modal show={showDetailModal} onHide={handleCloseDetailModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {detailData.type === 'absence' ? 'Detalles de la Ausencia' : 'Detalles de la Cita'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailData.type === 'absence' ? (
            <>
              <p><strong>Descripción:</strong> {detailData.description}</p>
              <p><strong>Fecha:</strong> {detailData.start ? new Date(detailData.start).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Hora de inicio:</strong> {detailData.start ? new Date(detailData.start).toLocaleTimeString() : 'N/A'}</p>
              <p><strong>Hora de fin:</strong> {detailData.end ? new Date(detailData.end).toLocaleTimeString() : 'N/A'}</p>
              <p><strong>Estado:</strong> {detailData.status}</p>
            </>
          ) : (
            <>
              <p><strong>Cliente:</strong> {detailData.title}</p>
              <p><strong>Fecha:</strong> {detailData.start ? new Date(detailData.start).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Hora de inicio:</strong> {detailData.start ? new Date(detailData.start).toLocaleTimeString() : 'N/A'}</p>
              <p><strong>Hora de fin:</strong> {detailData.end ? new Date(detailData.end).toLocaleTimeString() : 'N/A'}</p>
              <p><strong>Estado:</strong> {detailData.status}</p>
              <p><strong>Total:</strong> ${detailData.total}</p>
              {detailData.saleDetails && detailData.saleDetails.length > 0 && (
                <>
                  <h5>Detalles de la venta:</h5>
                  <ul>
                    {detailData.saleDetails.map((detail, index) => (
                      <li key={index}>
                        {detail.serviceId ? `Servicio ID: ${detail.serviceId}` : `Producto ID: ${detail.id_producto}`} - 
                        Cantidad: {detail.quantity}, Precio: ${detail.unitPrice}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outlined" onClick={handleCloseDetailModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Programming;
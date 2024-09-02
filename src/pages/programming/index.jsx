import React, { useEffect, useRef, useState } from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaUserCog } from "react-icons/fa";
import { RxScissors } from "react-icons/rx";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';


const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
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

const Programming = () => {
    const urlUsers= 'http://localhost:1056/api/users'
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [users, SetUsers] = useState([])
    const [selectedEvent, setSelectedEvent] = useState(null);


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                getUsers();
                const response = await fetch('http://localhost:1056/api/programming');
                const data = await response.json();

                const transformedEvents = data.map(event => ({
                    id: event.id.toString(),
                    title: `${userName(event.userId)}`,
                    start: `${event.day}T${event.startTime}`,
                    end: `${event.day}T${event.endTime}`,
                    extendedProps: {
                        status: event.status
                    }
                }));

                setEvents(transformedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
        
    }, []);

    const getUsers = async () => {
        const response = await axios.get(urlUsers)
        SetUsers(response.data)
    }

    const userName = (userId) =>{
        const user = users.find(user => user.id === userId)
        return user ? user.name : 'Desconocido'
    }

    const FiltrarUsers = () => {
        return users.filter(user => user.roleId === 2);
    }

    const handleMenuClick = (event, eventData) => {
        setAnchorEl(event.currentTarget);
        setSelectedEvent(eventData);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedEvent(null);
    };

    const handleEdit = () => {
        handleMenuClose();
    };

    const handleView = () => {
        handleMenuClose();
    };

    const handleDelete = () => {
        handleMenuClose();
    };

    const eventRender = (info) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{info.event.title}</span>
                <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => handleMenuClick(event, info.event)}
                >
                    <MoreVertIcon />
                </IconButton>
            </div>
        );
    };

    return (
        <>
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
                        <div className='row'>
                            
                        </div>
                        <div className='table-responsive mt-3'>
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin]}
                                initialView="dayGridMonth"
                                events={events}
                                eventContent={eventRender} // Usa eventRender para personalizar la celda del evento
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleView}>Ver</MenuItem>
                <MenuItem onClick={handleEdit}>Editar</MenuItem>
                <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
            </Menu>
        </>
    );
}

export default Programming;

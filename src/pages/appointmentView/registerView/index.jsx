'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaPlus, FaMinus } from "react-icons/fa";
import { IoSearch, IoTrashSharp } from "react-icons/io5";
import Button from '@mui/material/Button';
import Header from './Header1';
import { useNavigate } from 'react-router-dom';
import { Form, Col, Row, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { show_alerta } from '../../../assets/functions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsCalendar2DateFill } from 'react-icons/bs';
import CustomTimeSelector from '../../sales/registerSales/CustomTimeSelector/CustomTimeSelector';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';

export default function Component() {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState([]);
    const [minTime, setMinTime] = useState("07:00");
    const [maxTime, setMaxTime] = useState("21:00");
    const [timeSlots, setTimeSlots] = useState([]);
    const [prevState, setPrevState] = useState([]);

    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);
    const [saleInfo, setSaleInfo] = useState({
        Billnumber: '',
        SaleDate: new Date().toISOString().split('T')[0],
        total_price: 0,
        status: 'Pendiente',
        id_usuario: '',
        appointmentData: {
            Init_Time: '',
            Finish_Time: '',
            Date: new Date().toISOString().split('T')[0],
            time_appointment: 0
        },
        saleDetails: []
    });
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [occupiedSlots, setOccupiedSlots] = useState([]);

    const [errors, setErrors] = useState({});
    const urlServices = 'http://localhost:1056/api/services';
    const urlUsers = 'http://localhost:1056/api/users';
    const [subtotalProducts, setSubtotalProducts] = useState(0);
    const [selectedProducts, setSelectedProducts] = useState(() => {
        const saved = localStorage.getItem('selectedProducts');
        return saved ? JSON.parse(saved) : [];
    });
    const [subtotalServices, setSubtotalServices] = useState(0);
    const [absences, setAbsences] = useState([]);
    const urlAbsences = 'http://localhost:1056/api/absences';
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
            setIsLoggedIn(true);
            setSaleInfo(prevState => ({ ...prevState, id_usuario: userId }));
            fetchInitialData(userId);
        } else {
            setIsLoggedIn(false);
            setLoading(false);
            show_alerta('No has iniciado sesión. Por favor, inicia sesión para crear una cita.', 'warning');
        }
    };

    const [state, setState] = useState({
        saleDetails: [],
        otherFields: {}
    });

    const generateTimeSlots = () => {
        const slots = [];
        const [minHour, minMinute] = minTime.split(':').map(Number);
        const [maxHour, maxMinute] = maxTime.split(':').map(Number);

        for (let hour = minHour; hour <= maxHour; hour++) {
            const startMinute = (hour === minHour) ? minMinute : 0;
            const endMinute = (hour === maxHour) ? maxMinute : 59;

            for (let minute = startMinute; minute <= endMinute; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (timeString <= maxTime) {
                    slots.push(timeString);
                }
            }
        }
        return slots;
    };

    const isSlotOccupied = (timeSlot) => {
        return occupiedSlots?.some(slot => {
            const slotStart = new Date(`${currentDate}T${slot.startTime}`);
            const slotEnd = new Date(`${currentDate}T${slot.endTime}`);
            const currentSlot = new Date(`${currentDate}T${timeSlot}`);
            return currentSlot >= slotStart && currentSlot < slotEnd;
        });
    };

    const isSlotInPast = (timeSlot) => {
        const now = new Date();
        const slotTime = new Date(`${currentDate}T${timeSlot}`);
        return slotTime < now;
    };

    const fetchInitialData = async (userId) => {
        try {
            await Promise.all([
                getUsers(),
                getProducts(),
                getServices(),
                getAbsences(),
                getAppointments()
            ]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setLoading(false);
            show_alerta('Error al cargar los datos iniciales', 'error');
        }
    };

    useEffect(() => {
        const randomNumber = Math.floor(100 + Math.random() * 900).toString();
        setSaleInfo((prevState) => ({ ...prevState, Billnumber: randomNumber }));
    }, []);

    const getAbsences = async () => {
        try {
            const response = await axios.get(urlAbsences);
            setAbsences(response.data);
        } catch (error) {
            console.error("Error fetching absences:", error);
        }
    };

    const updateFinishTime = (startTime, duration) => {
        if (startTime) {
            const [hours, minutes] = startTime.split(':').map(Number);
            const endDate = new Date(2000, 0, 1, hours, minutes + duration);
            const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

            setSaleInfo(prevState => ({
                ...prevState,
                appointmentData: {
                    ...prevState.appointmentData,
                    Finish_Time: endTime
                }
            }));
        }
    };

    const getUsers = async () => {
        const response = await axios.get(urlUsers);
        setUsers(response.data);
    };

    const getProducts = async () => {
        try {
            const response = await axios.get('http://localhost:1056/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
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

    const getAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:1056/api/appointment');
            setAppointments(response.data);
            updateOccupiedSlots(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const updateOccupiedSlots = (appointmentsData) => {
        const occupied = appointmentsData.map(appointment => ({
            startTime: appointment.Init_Time,
            endTime: appointment.Finish_Time
        }));
        setOccupiedSlots(occupied);
    };

    const handleProductSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedProducts.some(sp => sp.id === product.id)
    );

    useEffect(() => {
        setTimeSlots(generateTimeSlots());
    }, [minTime, maxTime]);

    const addProduct = (product) => {
        const existingProduct = selectedProducts.find(p => p.id === product.id);
        if (existingProduct) {
            if (existingProduct.quantity + 1 > product.Stock) {
                show_alerta(`No hay suficiente stock para ${product.Product_Name}`, 'error');
                return;
            }
            const updatedProducts = selectedProducts.map(p =>
                p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
            );
            setSelectedProducts(updatedProducts);
            calculateTotals(updatedProducts, saleInfo.saleDetails);
        } else {
            const updatedProducts = [...selectedProducts, { ...product, quantity: 1 }];
            setSelectedProducts(updatedProducts);
            calculateTotals(updatedProducts, saleInfo.saleDetails);
        }
    };

    const removeProduct = (productId) => {
        const updatedProducts = selectedProducts.filter(p => p.id !== productId);
        setSelectedProducts(updatedProducts);
        calculateTotals(updatedProducts, saleInfo.saleDetails);
    };

    const validateAppointmentTime = () => {
        const now = new Date();
        const appointmentDate = new Date(saleInfo.appointmentData.Date);
        const appointmentTime = new Date(saleInfo.appointmentData.Date + 'T' + saleInfo.appointmentData.Init_Time);

        if (appointmentDate.toDateString() === now.toDateString()) {
            if (appointmentTime <= now) {
                return {
                    isValid: false,
                    message: 'No se puede elegir una hora anterior a la actual para citas en el mismo día'
                };
            }
        }

        const startTime = parseInt(saleInfo.appointmentData.Init_Time.split(':')[0]);
        if (startTime < 7 || startTime >= 21) {
            return {
                isValid: false,
                message: 'Las citas solo se pueden agendar entre las 7:00 AM y las 9:00 PM'
            };
        }

        return { isValid: true };
    };

    const validateAppointmentAvailability = () => {
        const newAppointmentStart = new Date(saleInfo.appointmentData.Date + 'T' + saleInfo.appointmentData.Init_Time);
        const newAppointmentEnd = new Date(saleInfo.appointmentData.Date + 'T' + saleInfo.appointmentData.Finish_Time);

        for (const appointment of appointments) {
            const existingStart = new Date(appointment.Date + 'T' + appointment.Init_Time);
            const existingEnd = new Date(appointment.Date + 'T' + appointment.Finish_Time);

            if (
                (newAppointmentStart >= existingStart && newAppointmentStart < existingEnd) ||
                (newAppointmentEnd > existingStart && newAppointmentEnd <= existingEnd) ||
                (newAppointmentStart <= existingStart && newAppointmentEnd >= existingEnd)
            ) {
                return {
                    isValid: false,
                    message: 'El horario seleccionado ya está ocupado por otra cita'
                };
            }
        }

        return { isValid: true };
    };

    const updateQuantity = (productId, change) => {
        const product = products.find(p => p.id === productId);
        const updatedProducts = selectedProducts.map(p => {
            if (p.id === productId) {
                const newQuantity = Math.max(1, p.quantity + change);
                if (newQuantity > product.Stock) {
                    Swal.fire('Error', `No hay suficiente stock para ${product.Product_Name}`, 'error');
                    return p;
                }
                return { ...p, quantity: newQuantity };
            }
            return p;
        });
        setSelectedProducts(updatedProducts);
        calculateTotals(updatedProducts, saleInfo.saleDetails);
    };

    const calculateTotals = (currentProducts, currentSaleDetails) => {
        const productDetails = currentProducts.map(product => ({
            quantity: product.quantity,
            unitPrice: product.Price,
            total_price: product.Price * product.quantity,
            id_producto: product.id,
            empleadoId: null,
            serviceId: null
        }));

        const productsSubtotal = productDetails.reduce((sum, item) => sum + item.total_price, 0);

        const serviceDetails = currentSaleDetails.filter(detail =>
            detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
        );

        const servicesSubtotal = serviceDetails.reduce((sum, detail) => {
            if (detail.serviceId) {
                const service = services.find(s => s.id === parseInt(detail.serviceId));
                return sum + (service ? service.price : 0);
            }
            return sum;
        }, 0);

        setSubtotalProducts(productsSubtotal);
        setSubtotalServices(servicesSubtotal);

        const totalDuration = serviceDetails.reduce((sum, detail) => {
            if (detail.serviceId) {
                const service = services.find(s => s.id === parseInt(detail.serviceId));
                return sum + (service ? service.time : 0);
            }
            return sum;
        }, 0);

        setSaleInfo(prevState => ({
            ...prevState,
            saleDetails: [...productDetails, ...serviceDetails],
            total_price: productsSubtotal + servicesSubtotal,
            appointmentData: {
                ...prevState.appointmentData,
                time_appointment: totalDuration
            }
        }));

        // Fix: Check if prevState.appointmentData exists before accessing Init_Time
        if (prevState.appointmentData && prevState.appointmentData.Init_Time) {
            updateFinishTime(prevState.appointmentData.Init_Time, totalDuration);
        }
    };

    const handleAddService = () => {
        setServices((prevState) => [
            ...prevState,
        ]);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSaleInfo(prevState => {
            if (name === 'SaleDate') {
                return {
                    ...prevState,
                    [name]: value,
                    appointmentData: {
                        ...prevState.appointmentData,
                        Date: value
                    }
                };
            }
            return {
                ...prevState,
                [name]: value
            };
        });
        validateField(name, value);
    };

    const handleAppointmentChange = (event) => {
        const { name, value } = event.target;
        setSaleInfo(prevState => ({
            ...prevState,
            appointmentData: {
                ...prevState.appointmentData,
                [name]: value
            }
        }));

        if (name === 'Init_Time') {
            updateFinishTime(value, saleInfo.appointmentData.time_appointment);
        }
    };

    const validateField = (fieldName, value) => {
        let newErrors = { ...errors };

        switch (fieldName) {
            case 'Billnumber':
                if (value.length === 0) {
                    newErrors.Billnumber = 'El número de Comprobante es requerido';
                } else if (value.length !== 3) {
                    newErrors.Billnumber = 'El número de Comprobante debe tener exactamente 3 dígitos';
                } else if (!/^\d+$/.test(value)) {
                    newErrors.Billnumber = 'El número de Comprobante debe contener solo dígitos';
                } else {
                    newErrors.Billnumber = '';
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleServiceRemove = (index) => {
        setSaleInfo(prevState => {
            const serviceDetails = prevState.saleDetails.filter(detail =>
                detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
            );

            const updatedServiceDetails = serviceDetails.filter((_, i) => i !== index);

            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            const allDetails = [...productDetails, ...updatedServiceDetails];
            const totalPrice = allDetails.reduce((sum, item) => sum + (item.total_price || 0), 0);

            return {
                ...prevState,
                saleDetails: allDetails,
                total_price: totalPrice
            };
        });
    };

    const validateEmployeeAvailability = () => {
        const appointmentDate = saleInfo.appointmentData.Date;
        const appointmentStart = saleInfo.appointmentData.Init_Time;
        const appointmentEnd = saleInfo.appointmentData.Finish_Time;

        const serviceDetails = saleInfo.saleDetails.filter(detail =>
            detail.serviceId !== null && detail.empleadoId !== null
        );

        for (const detail of serviceDetails) {
            const employee = users.find(user => user.id === parseInt(detail.empleadoId));
            if (!employee) continue;

            const hasAbsence = absences.some(absence =>
                absence.userId === parseInt(detail.empleadoId) &&
                absence.date === appointmentDate &&
                absence.startTime <= appointmentEnd &&
                absence.endTime >= appointmentStart
            );

            if (hasAbsence) {
                return {
                    isValid: false,
                    message: `El empleado ${employee.name} tiene una ausencia registrada para este horario`
                };
            }
        }

        return { isValid: true };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isLoggedIn) {
            show_alerta('Debes iniciar sesión para crear una cita', 'warning');
            return;
        }

        validateField('Billnumber', saleInfo.Billnumber);

        if (errors.Billnumber) {
            show_alerta('Por favor, corrija los errores antes de continuar', 'warning');
            return;
        }

        if (saleInfo.saleDetails.length === 0) {
            show_alerta('Debe agregar al menos un servicio', 'warning');
            return;
        }

        const { isValid: isEmployeeAvailable, message: employeeMessage } = validateEmployeeAvailability();
        if (!isEmployeeAvailable) {
            show_alerta(employeeMessage, 'error');
            return;
        }

        const { isValid: isTimeValid, message: timeMessage } = validateAppointmentTime();
        if (!isTimeValid) {
            show_alerta(timeMessage, 'error');
            return;
        }

        const { isValid: isAppointmentAvailable, message: appointmentMessage } = validateAppointmentAvailability();
        if (!isAppointmentAvailable) {
            show_alerta(appointmentMessage, 'error');
            return;
        }

        const hasServicesWithEmployees = saleInfo.saleDetails.some(detail =>
            detail.serviceId !== null && detail.empleadoId !== null
        );

        if (hasServicesWithEmployees &&
            (!saleInfo.appointmentData.Init_Time ||
                !saleInfo.appointmentData.Finish_Time)) {
            show_alerta('Debe especificar el horario de la cita para los servicios', 'warning');
            return;
        }

        try {
            await axios.post('http://localhost:1056/api/sales', saleInfo);
            show_alerta('Cita registrada con éxito', 'success');
            setSaleInfo({
                Billnumber: '',
                SaleDate: new Date().toISOString().split('T')[0],
                total_price: 0,
                status: 'Pendiente',
                id_usuario: saleInfo.id_usuario,
                appointmentData: {
                    Init_Time: '',
                    Finish_Time: '',
                    Date: new Date().toISOString().split('T')[0],
                    time_appointment: 0
                },
                saleDetails: []
            });
            setSelectedProducts([]);

            navigate('/index');
        } catch (error) {
            console.error('Error al registrar la venta:', error);
            show_alerta('Error al registrar la venta', 'error');
        }
    };

    const handleServiceAdd = () => {
        setSaleInfo(prevState => {
            const serviceDetails = prevState.saleDetails.filter(detail =>
                detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
            );

            const newServiceDetail = {
                quantity: 1,
                unitPrice: 0,
                total_price: 0,
                id_producto: null,
                empleadoId: null,
                serviceId: null
            };

            const updatedServiceDetails = [...serviceDetails, newServiceDetail];

            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            return {
                ...prevState,
                saleDetails: [...productDetails, ...updatedServiceDetails]
            };
        });
    };

    const handleAddProduct = () => {
        setState((prevState) => {
            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            return {
                ...prevState,
                saleDetails: [...prevState.saleDetails, ...productDetails]
            };
        });
    };

    useEffect(() => {
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    }, [selectedProducts]);

    const handleServiceChange = (index, field, value) => {
        setSaleInfo(prevState => {
            const serviceDetails = prevState.saleDetails.filter(detail =>
                detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
            );

            if (serviceDetails[index]) {
                serviceDetails[index] = { ...serviceDetails[index], [field]: value };

                if (field === 'serviceId') {
                    const service = services.find(s => s.id === parseInt(value));
                    if (service) {
                        serviceDetails[index].unitPrice = service.price;
                        serviceDetails[index].total_price = service.price;
                        serviceDetails[index].quantity = 1;
                        setSelectedService(service);
                    }
                }
            }

            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            const allDetails = [...productDetails, ...serviceDetails];

            const totalDuration = serviceDetails.reduce((sum, detail) => {
                if (detail.serviceId) {
                    const service = services.find(s => s.id === parseInt(detail.serviceId));
                    return sum + (service ? service.time : 0);
                }
                return sum;
            }, 0);

            const productsSubtotal = productDetails.reduce((sum, item) => sum + item.total_price, 0);
            const servicesSubtotal = serviceDetails.reduce((sum, detail) => {
                if (detail.serviceId) {
                    const service = services.find(s => s.id === parseInt(detail.serviceId));
                    return sum + (service ? service.price : 0);
                }
                return sum;
            }, 0);

            setSubtotalProducts(productsSubtotal);
            setSubtotalServices(servicesSubtotal);

            updateFinishTime(prevState.appointmentData.Init_Time, totalDuration);

            return {
                ...prevState,
                saleDetails: allDetails,
                total_price: productsSubtotal + servicesSubtotal,
                appointmentData: {
                    ...prevState.appointmentData,
                    time_appointment: totalDuration
                }
            };
        });
    };

    const productDetails = selectedProducts.map(product => ({
        quantity: product.quantity,
        unitPrice: product.Price,
        total_price: product.Price * product.quantity,
        id_producto: product.id,
        empleadoId: null,
        serviceId: null
    }));

    const isTimeSlotOccupied = (date, time) => {
        return appointments.some(appointment =>
            appointment.Date === date &&
            appointment.Init_Time <= time &&
            appointment.Finish_Time > time
        );
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours > 0) {
            return `${hours} hora${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `y ${remainingMinutes} minutos` : ''}`;
        }
        return `${minutes} minutos`;
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!isLoggedIn) {
        return (
            <div>
                <p>Debes iniciar sesión para crear una cita.</p>
                {/* Add a login button or redirect to login page */}
            </div>
        );
    }

    return (
        <>
            <Header />
            <br /><br /><br /><br />
            <div className='card border-0 p-3 d-flex colorTransparent mt-9' style={{ backgroundColor: '#1a1a1a', color: '#ffd700' }}>
                <div className='row'>
                    <div className='col-sm-6'>
                        <div className='row p-3'></div>
                        <div className='card-detail shadow-lg border-0 mb-4 rounded-lg' style={{ backgroundColor: '#2a2a2a' }}>
                            <div className="cont-title w-100 bg-gradient-to-r from-yellow-600 to-yellow-800 p-4">
                                <span className='Title text-black text-xl font-bold d-flex align-items-center'>
                                    <i className="bi bi-scissors me-2"></i>
                                    Servicios y Productos
                                </span>
                            </div>
                            <div className='p-4'>
                                <h5 className="mb-3 text-gold">Servicios</h5>
                                <Table responsive bordered hover className="table-striped" style={{ color: '#ffd700' }}>
                                    <thead className='bg-light'>
                                        <tr>
                                            <th>Servicio</th>
                                            <th>Barbero</th>
                                            <th>Duración</th>
                                            <th>Precio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {saleInfo.saleDetails.filter(detail => detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)).map((detail, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <Form.Select
                                                        value={detail.serviceId || ''}
                                                        onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                                                        className="form-select border rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Seleccione un servicio</option>
                                                        {services.map(service => (
                                                            <option key={service.id} value={service.id}>{service.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Form.Select
                                                        value={detail.empleadoId || ''}
                                                        onChange={(e) => handleServiceChange(index, 'empleadoId', e.target.value)}
                                                        className="form-select border rounded-lg shadow-sm"
                                                    >
                                                        <option value="">Seleccione el barbero</option>
                                                        {users
                                                            .filter(user => {
                                                                if (user.roleId !== 2) return false;
                                                                const appointmentDate = saleInfo.appointmentData.Date;
                                                                const appointmentStart = saleInfo.appointmentData.Init_Time;
                                                                const appointmentEnd = saleInfo.appointmentData.Finish_Time;
                                                                if (!appointmentDate || !appointmentStart || !appointmentEnd) return true;
                                                                const hasAbsence = absences.some(absence => {
                                                                    return absence.userId === user.id &&
                                                                        absence.date === appointmentDate &&
                                                                        absence.startTime <= appointmentEnd &&
                                                                        absence.endTime >= appointmentStart;
                                                                });
                                                                return !hasAbsence;
                                                            })
                                                            .map(employee => (
                                                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                                                            ))}
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    {detail.serviceId ? formatDuration(services.find(s => s.id === parseInt(detail.serviceId))?.time || 0) : '-'}
                                                </td>
                                                <td>
                                                    {detail.serviceId ? `$${services.find(s => s.id === parseInt(detail.serviceId))?.price.toFixed(2)}` : '-'}
                                                </td>
                                                <td>
                                                    <div className='d-flex align-items-center justify-content-center'>
                                                        <button
                                                            onClick={() => handleServiceRemove(index)}
                                                            className="btn btn-danger btn-sm rounded-circle"
                                                        >
                                                            <IoTrashSharp />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className="d-flex justify-content-start mt-3">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={handleServiceAdd}
                                            variant="contained"
                                            style={{ backgroundColor: '#ffd700', color: '#000' }}
                                            startIcon={<FaPlus />}
                                        >
                                            Agregar Servicio
                                        </Button>
                                    </motion.div>
                                </div>

                                <div className='mt-4'>
                                    <h5 className="mb-3 text-gold">Productos</h5>
                                    <div className="mb-3">
                                        <Form.Group>
                                            <Form.Label className='text-gold'>Buscar Productos</Form.Label>
                                            <div className="d-flex">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Buscar productos..."
                                                    value={searchTerm}
                                                    onChange={handleProductSearch}
                                                    className="form-control border rounded-lg shadow-sm"
                                                />
                                                <IoSearch className="search-icon position-absolute end-0 top-50 translate-middle-y me-2" />
                                            </div>
                                        </Form.Group>
                                        {searchTerm && (
                                            <div className="search-results mt-2 border rounded-lg shadow-sm">
                                                {filteredProducts.map(product => (
                                                    <div
                                                        key={product.id}
                                                        className="search-result-item p-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => addProduct(product)}
                                                    >
                                                        {product.Product_Name} - Stock: {product.Stock}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Table responsive bordered hover className="table-striped" style={{ color: '#ffd700' }}>
                                        <thead className='bg-light'>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio unt</th>
                                                <th>Subtotal</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedProducts.map(product => (
                                                <tr key={product.id}>
                                                    <td>{product.Product_Name}</td>
                                                    <td>{product.quantity}</td>
                                                    <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</td>
                                                    <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price * product.quantity)}</td>
                                                    <td>
                                                        <div className='d-flex align-items-center justify-content-center'>
                                                            <Button color='error' className='delete me-2' onClick={() => removeProduct(product.id)}><IoTrashSharp /></Button>
                                                            <div className='actions-quantity'>
                                                                <Button className='primary me-1' onClick={() => updateQuantity(product.id, 1)}><FaPlus /></Button>
                                                                <Button className='primary' onClick={() => updateQuantity(product.id, -1)}><FaMinus /></Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                <div className='d-flex justify-content-between align-items-center mt-4'>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="contained"
                                            style={{ backgroundColor: '#ffd700', color: '#000' }}
                                            onClick={handleAddProduct}
                                            startIcon={<FaPlus />}
                                        >
                                            Agregar Producto
                                        </Button>
                                    </motion.div>
                                    <div className='Monto-content'>
                                        <span className='valor font-weight-bold text-gold'>Subtotal Productos: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalProducts)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className='col-sm-6'>
                    <div className='row p-3'></div>
                    <div className='card-detail shadow-lg border-0 mb-4 rounded-lg' style={{ backgroundColor: '#2a2a2a' }}>
                        <div className="cont-title w-100 bg-gradient-to-r from-yellow-600 to-yellow-800 p-4">
                            <span className='Title text-black text-xl font-bold'>Información de cita</span>
                        </div>
                        <div className='d-flex align-items-center'>
                            <div className="d-flex align-items-center w-100 p-4">
                                <Form className='form w-100'>
                                    <Form.Group as={Row} className="mb-4">
                                        <Col sm="6" className="mb-3">
                                            <Form.Label className="fw-bold mb-2 text-gold">Fecha de cita</Form.Label>
                                            <div className="position-relative">
                                                <DatePicker
                                                    selected={new Date(saleInfo.appointmentData.Date)}
                                                    onChange={(date) => handleAppointmentChange({
                                                        target: {
                                                            name: 'Date',
                                                            value: date.toISOString().split('T')[0]
                                                        }
                                                    })}
                                                    className="form-control border rounded-lg shadow-sm"
                                                    minDate={new Date()}
                                                    style={{ backgroundColor: '#2a2a2a', color: '#ffd700' }}
                                                />
                                                <BsCalendar2DateFill className="position-absolute end-3 top-50 translate-middle-y text-gold" />
                                            </div>
                                        </Col>
                                        <Col sm="6" className="mb-3">
                                            <Form.Label className="fw-bold mb-2 text-gold">Hora inicio</Form.Label>
                                            <div className="position-relative">
                                                <CustomTimeSelector
                                                    name="Init_Time"
                                                    value={saleInfo.appointmentData.Init_Time}
                                                    onChange={(time) => handleAppointmentChange({
                                                        target: {
                                                            name: 'Init_Time',
                                                            value: time
                                                        }
                                                    })}
                                                    className="form-control border rounded-lg shadow-sm"
                                                    style={{ backgroundColor: '#2a2a2a', color: '#ffd700' }}
                                                />
                                                <i className="bi bi-clock position-absolute end-3 top-50 translate-middle-y text-gold"></i>
                                            </div>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Col sm="6" className="mb-3">
                                            <Form.Label className="fw-bold mb-2 text-gold">Hora fin (estimada)</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="text"
                                                    name="Finish_Time"
                                                    value={saleInfo.appointmentData.Finish_Time}
                                                    readOnly
                                                    className="form-control border rounded-lg shadow-sm bg-dark text-gold"
                                                />
                                                <i className="bi bi-clock position-absolute end-3 top-50 translate-middle-y text-gold"></i>
                                            </div>
                                        </Col>
                                        <Col sm="6" className="mb-3">
                                            <Form.Label className="fw-bold mb-2 text-gold">Duración total</Form.Label>
                                            <div className="bg-dark p-2 rounded-lg border shadow-sm">
                                                <span className="fw-bold text-gold">
                                                    {formatDuration(saleInfo.appointmentData.time_appointment)}
                                                </span>
                                            </div>
                                        </Col>
                                    </Form.Group>
                                </Form>
                            </div>
                        </div>
                    </div>
                    <div className='card-detail shadow-lg border-0 mb-4 rounded-lg' style={{ backgroundColor: '#2a2a2a' }}>
                        <div className="cont-title w-100 bg-gradient-to-r from-yellow-600 to-yellow-800 p-4">
                            <span className='Title text-black text-xl font-bold'>Resumen de la cita</span>
                        </div>
                        <div className='p-4'>
                            <Table responsive bordered hover className="table-striped" style={{ color: '#ffd700' }}>
                                <tbody>
                                    <tr>
                                        <th>Subtotal Servicios:</th>
                                        <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalServices)}</td>
                                    </tr>
                                    <tr>
                                        <th>Subtotal Productos:</th>
                                        <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalProducts)}</td>
                                    </tr>
                                    <tr>
                                        <th>Total:</th>
                                        <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saleInfo.total_price)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
            <div className='d-flex justify-content-end mt-4'>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="contained"
                        style={{
                            backgroundColor: '#2a2a2a',
                            color: '#ffd700',
                            marginRight: '10px',
                            minWidth: '150px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}
                        onClick={() => navigate('/index')}
                    >
                        Cancelar
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="contained"
                        style={{
                            backgroundColor: '#ffd700',
                            color: '#000',
                            minWidth: '150px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}
                        onClick={handleSubmit}
                    >
                        Guardar Cita
                    </Button>
                </motion.div>
            </div>
       
        </>
    );
}


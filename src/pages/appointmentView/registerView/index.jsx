import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaPlus, FaMinus } from "react-icons/fa";
import { IoSearch, IoTrashSharp } from "react-icons/io5";
import Button from '@mui/material/Button';
import Header from './Header1';
import { Form, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { show_alerta } from '../../../assets/functions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsCalendar2DateFill } from 'react-icons/bs';
import './styles.css';
import { style } from '@mui/system';

export default function Component() {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState([]);
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
            time_appointment: 60
        },
        saleDetails: []
    });
    const [errors, setErrors] = useState({});
    const urlServices = 'http://localhost:1056/api/services';
    const urlUsers = 'http://localhost:1056/api/users';
    const [subtotalProducts, setSubtotalProducts] = useState(0);
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
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const handleProductSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedProducts.some(sp => sp.id === product.id)
    );

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

        setSaleInfo(prevState => ({
            ...prevState,
            saleDetails: [...productDetails, ...serviceDetails],
            total_price: productsSubtotal + servicesSubtotal
        }));
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

        if (appointmentDate.getDay() === 1) { // 1 represents Monday
            return {
                isValid: false,
                message: 'No se pueden reservar citas para los lunes'
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
                    message: 'El horario seleccionado ya esta ocupado por otra cita '
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
            show_alerta('Por favor, seleecione otro dia los lunes no estamos disponibles', 'warning');
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
                    time_appointment: 60
                },
                saleDetails: []
            });
            setSelectedProducts([]);
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

    function generateBillNumber() {
        const randomBillNumber = Math.floor(10000000 + Math.random() * 90000000);
        console.log(`Número de comprobante generado: ${randomBillNumber}`);
        return randomBillNumber;
    }

    function processSaleInfo() {
        const billNumber = generateBillNumber();
        console.log(`Procesando el número de comprobante: ${billNumber}`);
        return billNumber;
    }

    const generatedBillNumber = processSaleInfo();
    console.log(`Número de comprobante final: ${generatedBillNumber}`);

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

                        // Automatically set the end time based on service duration
                        const startTime = prevState.appointmentData.Init_Time;
                        if (startTime) {
                            const [hours, minutes] = startTime.split(':').map(Number);
                            const endDate = new Date(2000, 0, 1, hours, minutes + service.time);
                            const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

                            return {
                                ...prevState,
                                appointmentData: {
                                    ...prevState.appointmentData,
                                    Finish_Time: endTime
                                },
                                saleDetails: [...prevState.saleDetails.slice(0, index), serviceDetails[index], ...prevState.saleDetails.slice(index + 1)]
                            };
                        }
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

            return {
                ...prevState,
                saleDetails: allDetails,
                total_price: productsSubtotal + servicesSubtotal
            };
        });
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

    const isTimeSlotOccupied = (date, time) => {
        return appointments.some(appointment =>
            appointment.Date === date &&
            appointment.Init_Time <= time &&
            appointment.Finish_Time > time
        );
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
            <div className='card border-0 p-3 d-flex colorTransparent mt-9'>
                <div className='row'>
                    <div className='col-sm-6'>
                        <div className='row p-3'></div>
                        <div className='card-detail shadow border-0 mb-9'>
                            <div className='bcg-w col-sm-12 p-3'>
                                <div className="position-relative d-flex align-items-center">
                                    <span className='Tittle'>Servicios</span>
                                </div>
                            </div>
                            <div className='table-responsive p-3'>
                                <table className='table table-bordered table-hover v-align table-striped'>
                                    <thead className='table-light'>
                                        <tr>
                                            <th>Servicio</th>
                                            <th>Empleado</th>
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
                                                    >
                                                        <option value="">Seleccionar servicio</option>
                                                        {services.map(service => (
                                                            <option key={service.id} value={service.id}>{service.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Form.Select
                                                        value={detail.empleadoId || ''}
                                                        onChange={(e) => handleServiceChange(index, 'empleadoId', e.target.value)}
                                                    >
                                                        <option value="">Seleccionar empleado</option>
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
                                                    <div className='d-flex align-items-center'>
                                                        <Button color='error' className='delete' onClick={() => handleServiceRemove(index)}><IoTrashSharp /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="d-flex justify-content-start mt-9 px-3">
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
                            <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                                <span className='valor'>Total de la cita: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalServices)}</span>
                            </div>
                        </div>
                    </div>

                    <div className='col-sm-6'>
                        <div className='card-detail shadow border-0 mb-4'>
                            <div className="cont-title w-100">
                                <span className='Title'>Reserva de cita</span>
                            </div>
                            <div className='d-flex align-items-center'>
                                <div className="d-flex align-items-center w-100 p-4">
                                    <Form className='form w-100'>
                                        <Form.Group as={Row} className="mb-3">
                                            <Col sm="6">
                                                <Form.Label>Hora de reserva</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="Init_Time"
                                                    value={saleInfo.appointmentData.Init_Time}
                                                    onChange={handleAppointmentChange}
                                                    className={isTimeSlotOccupied(saleInfo.SaleDate, saleInfo.appointmentData.Init_Time) ? 'occupied-time-slot' : ''}
                                                    disabled={isTimeSlotOccupied(saleInfo.SaleDate, saleInfo.appointmentData.Init_Time)}
                                                />
                                            </Col>
                                            <Col sm="6">
                                                <Form.Label>Hora fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="Finish_Time"
                                                    value={saleInfo.appointmentData.Finish_Time}
                                                    onChange={handleAppointmentChange}
                                                    readOnly
                                                />
                                            </Col>
                                            <Col sm="6">
                                                <Form.Label className='required'>Dia de reserva</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="SaleDate"
                                                    value={saleInfo.SaleDate}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Form.Group>
                                    </Form>
                                </div>
                            </div>
                        </div>
                        <div className='spacing d-flex align-items-center footer-total'>
                            <div className="row">
                                <div className="col-sm-6 d-flex align-items-center justify-content-start padding-monto">
                                </div>
                                <div className="col-sm-5 d-flex align-items-center justify-content-end">
                                    <div className='d-flex align-items-center justify-content-end'>
                                        <Button
                                            variant="secondary"
                                            className='btn-red'
                                            id='btn-red'
                                            href="/index"
                                            style={{ minWidth: '100px' }}
                                        >
                                            Cerrar
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className='btn-sucess'
                                            onClick={handleSubmit}
                                            style={{ minWidth: '100px' }}
                                        >
                                            Guardar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          

        </>

    );
}


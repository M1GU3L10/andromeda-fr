import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { IoTrashSharp } from "react-icons/io5";
import Header from './Header1';
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Form, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { show_alerta } from '../../../assets/functions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsCalendar2DateFill } from 'react-icons/bs';



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

    useEffect(() => {
        getUsers();
        getProducts();
        getServices();
        getAbsences();
    }, []);

    useEffect(() => {
        // Generar un número aleatorio de 3 dígitos al cargar el componente
        const randomNumber = Math.floor(100 + Math.random() * 900).toString(); // Número de 3 dígitos
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
        // Calculate products subtotal
        const productDetails = currentProducts.map(product => ({
            quantity: product.quantity,
            unitPrice: product.Price,
            total_price: product.Price * product.quantity,
            id_producto: product.id,
            empleadoId: null,
            serviceId: null
        }));

        const productsSubtotal = productDetails.reduce((sum, item) => sum + item.total_price, 0);

        // Get service details
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

        // Update all totals at once
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
            // Si el campo que cambia es SaleDate, actualizamos también la fecha de la cita
            if (name === 'SaleDate') {
                return {
                    ...prevState,
                    [name]: value,
                    appointmentData: {
                        ...prevState.appointmentData,
                        Date: value // Sincronizamos la fecha de la cita con la fecha de venta
                    }
                };
            }
            // Para otros campos, mantenemos el comportamiento original
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
                    newErrors.Billnumber = 'El número de Combrobante es requerido';
                } else if (value.length !== 3) {
                    newErrors.Billnumber = 'El número de Combrobante debe tener exactamente 3 dígitos';
                } else if (!/^\d+$/.test(value)) {
                    newErrors.Billnumber = 'El número de Combrobante debe contener solo dígitos';
                } else {
                    newErrors.Billnumber = '';
                }
                break;
            case 'id_usuario':
                if (!value) {
                    newErrors.id_usuario = 'Debe seleccionar un cliente';
                } else {
                    newErrors.id_usuario = '';
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

        // Verificar cada servicio que tenga un empleado asignado
        const serviceDetails = saleInfo.saleDetails.filter(detail =>
            detail.serviceId !== null && detail.empleadoId !== null
        );

        for (const detail of serviceDetails) {
            const employee = users.find(user => user.id === parseInt(detail.empleadoId));
            if (!employee) continue;

            // Buscar si hay alguna ausencia que se superponga
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

        validateField('Billnumber', saleInfo.Billnumber);
        validateField('id_usuario', saleInfo.id_usuario);

        if (errors.Billnumber || errors.id_usuario) {
            show_alerta('Por favor, corrija los errores antes de enviar', 'warning');
            return;
        }

        if (saleInfo.saleDetails.length === 0) {
            show_alerta('Debe agregar al menos un producto o servicio al detalle de la venta', 'warning');
            return;
        }

        // Verificar la disponibilidad de los empleados antes de guardar
        const { isValid, message } = validateEmployeeAvailability();
        if (!isValid) {
            show_alerta(message, 'error');
            return;
        }

        // Verificar que los servicios con empleados tengan horario asignado
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
            show_alerta('Venta registrada con éxito', 'success');
            setSaleInfo({
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

            // Combine with product details
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
        // Genera un número aleatorio de 8 dígitos
        const randomBillNumber = Math.floor(10000000 + Math.random() * 90000000);
        console.log(`Número de comprobante generado: ${randomBillNumber}`);
        return randomBillNumber;
    }

    function processSaleInfo() {
        // Genera el número de comprobante internamente
        const billNumber = generateBillNumber();

        // Simula el procesamiento del número de comprobante
        console.log(`Procesando el número de comprobante: ${billNumber}`);

        // Retorna el número generado
        return billNumber;
    }

    // Ejemplo de uso
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

            // Calculate subtotals
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

            // Combine with product details
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

    
    return (
        <>
            <Header />
            <br /><br /><br /><br />
            <div className='card border-0 p-3 d-flex colorTransparent mt-9'>
                <div className='row'>
                    {/* Products Card */}
                    <div className='col-sm-6'>
                        <div className='row p-3'></div>
        
                        {/* Services Card */}
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
        
                    {/* Sale Info Card */}
                    <div className='col-sm-6'>
        
                        {/* Appointment Time Card */}
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
                                                />
                                            </Col>
                                            <Col sm="6">
                                                <Form.Label>Hora fin</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    name="Finish_Time"
                                                    value={saleInfo.appointmentData.Finish_Time}
                                                    onChange={handleAppointmentChange}
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
                                        <Form.Group className="mb-3">
                                            <Form.Label className='required'>Cliente</Form.Label>
                                            <Form.Select
                                                name="id_usuario"
                                                value={saleInfo.id_usuario}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.id_usuario}
                                            >
                                                <option value="">Seleccionar cliente</option>
                                                {users.filter(user => user.roleId === 3).map(user => (
                                                    <option key={user.id} value={user.id}>{user.name}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.id_usuario}
                                            </Form.Control.Feedback>
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
                                            href="/appointmentView"
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
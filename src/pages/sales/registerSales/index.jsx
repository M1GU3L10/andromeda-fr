import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FcSalesPerformance } from "react-icons/fc";
import { FaMoneyBillWave } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Form, Col, Row } from 'react-bootstrap';
import { FaBroom } from 'react-icons/fa';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.06),
    },
    '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.12),
    },
}));

const RegisterSales = () => {
    const [sales, setSales] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [saleInfo, setSaleInfo] = useState({
        Billnumber: '',
        SaleDate: new Date().toISOString().split('T')[0],
        id_usuario: '',
    });

    useEffect(() => {
        getUsers();
        getProducts();
    }, []);

    const getUsers = async () => {
        try {
            const response = await axios.get('http://localhost:1056/api/users');
            setUsers(response.data.filter(user => user.roleId === 3));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const getProducts = async () => {
        try {
            const response = await axios.get('http://localhost:1056/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleProductSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addProduct = (product) => {
        const existingProduct = selectedProducts.find(p => p.id === product.id);
        if (existingProduct) {
            setSelectedProducts(selectedProducts.map(p =>
                p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
    };

    const removeProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const updateQuantity = (productId, change) => {
        setSelectedProducts(selectedProducts.map(p =>
            p.id === productId ? { ...p, quantity: Math.max(1, p.quantity + change) } : p
        ));
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, product) => total + (product.Price * product.quantity), 0);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSaleInfo({ ...saleInfo, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const saleData = {
            ...saleInfo,
            total_price: calculateTotal(),
            status: 'Completada', // Agregar el estado por defecto aquí
            saleDetails: selectedProducts.map(product => ({
                quantity: product.quantity,
                id_producto: product.id
            }))
        };

        try {
            await axios.post('http://localhost:1056/api/sales', saleData);
            alert('Venta registrada con éxito');
            // Resetear el formulario y los productos seleccionados
            setSaleInfo({
                Billnumber: '',
                SaleDate: new Date().toISOString().split('T')[0],
                id_usuario: '',
            });
            setSelectedProducts([]);
        } catch (error) {
            console.error('Error al registrar la venta:', error);
            alert('Error al registrar la venta');
        }
    };


    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Registrar Ventas</span>
                    </div>
                    <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
                        <Breadcrumbs aria-label="breadcrumb">
                            <StyledBreadcrumb component="a" href="#" label="Home" icon={<HomeIcon fontSize="small" />} />
                            <StyledBreadcrumb component="a" href="#" label="Salidas" icon={<FaMoneyBillWave fontSize="small" />} />
                            <StyledBreadcrumb component="a" href="#" label="Ventas" icon={<FcSalesPerformance fontSize="small" />} />
                        </Breadcrumbs>
                    </div>
                </div>
                <div className='card border-0 p-3 d-flex colorTransparent'>
                    <div className='row'>
                        <div className='col-sm-7'>
                            <div className='card-detail shadow border-0'>
                                <div className='row p-3'>
                                    <div className='bcg-w col-sm-7 d-flex align-items-center'>
                                        <div className="position-relative d-flex align-items-center">
                                            <span className='Title'>Detalle de venta</span>
                                        </div>
                                    </div>
                                    <div className='col-sm-5 d-flex align-items-center justify-content-end'>
                                        <div className="searchBox position-relative d-flex align-items-center">
                                            <IoSearch className="mr-2" />
                                            <input
                                                type="text"
                                                placeholder='Buscar producto...'
                                                className='form-control'
                                                value={searchTerm}
                                                onChange={handleProductSearch}
                                            />
                                        </div>
                                    </div>
                                    {/* Product search results */}
                                    <div className='d-flex aline-items-center justify-content-end'>
                                        <div className="product-search-results">
                                            {searchTerm && filteredProducts.map(product => (
                                                <div key={product.id} className="product-item shadow border-0" onClick={() => addProduct(product)}>
                                                    {product.Product_Name} - ${product.Price}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className='table-responsive mt-3 w-80'>
                                    <table className='table table-bordered table-hover v-align table-striped '>
                                        <thead className='table-light'>
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
                                                    <td>{product.Price}</td>
                                                    <td>{product.Price * product.quantity}</td>
                                                    <td>
                                                        <div className='d-flex align-items-center position-static'>
                                                            <Button color='error' className='delete' onClick={() => removeProduct(product.id)}><IoTrashSharp /></Button>
                                                            <div className='actions-quantity'>
                                                                <Button className='primary' onClick={() => updateQuantity(product.id, 1)}><FaPlus /></Button>
                                                                <Button className='primary' onClick={() => updateQuantity(product.id, -1)}><FaMinus /></Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                                    <span className='Monto'>Total:</span>
                                    <span className='valor'>${calculateTotal()}</span>
                                </div>
                            </div>
                        </div>
                        <div className='col-sm-5'>
                            <div className='card-detail shadow border-0'>
                                <div className="cont-title w-100">
                                    <span className='Title'>Info de venta</span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <div className="d-flex align-items-center w-100 p-4">
                                        <Form className='form' onSubmit={handleSubmit}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Col sm="6">
                                                    <Form.Label># Factura</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="Billnumber"
                                                        value={saleInfo.Billnumber}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </Col>
                                                <Col sm="6">
                                                    <Form.Label>Fecha venta</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="SaleDate"
                                                        value={saleInfo.SaleDate}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Cliente</Form.Label>
                                                <Form.Select
                                                    name="id_usuario"
                                                    value={saleInfo.id_usuario}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Seleccionar cliente</option>
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.id}>{user.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className='d-flex align-items-center justify-content-end'>
                                                <Button variant="primary" type="submit" className='btn-sucess'>
                                                    Guardar
                                                </Button>
                                                <Button variant="secondary" className='btn-red' href="/Sales">
                                                    Cerrar
                                                </Button>
                                                {/* <Button variant="warning" className='btn-clear' onClick={() => {
                                                    setSaleInfo({
                                                        Billnumber: '',
                                                        SaleDate: new Date().toISOString().split('T')[0],
                                                        id_usuario: '',
                                                    });
                                                    setSelectedProducts([]);
                                                }}>
                                                    <FaBroom style={{ marginRight: '5px' }} />
                                                    
                                                </Button> */}
                                            </Form.Group>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterSales;
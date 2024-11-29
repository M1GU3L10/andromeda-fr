import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { IoCart } from "react-icons/io5";
import { FaCartPlus } from "react-icons/fa6";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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

const RegisterShopping = () => {
    const urlShopping = 'http://localhost:1056/api/shopping';
    const urlSuppliers = 'http://localhost:1056/api/suppliers';
    const urlProducts = 'http://localhost:1056/api/products';
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [shoppingDetails, setShoppingDetails] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        purchaseDate: new Date().toISOString().split("T")[0],
        supplierId: '',
    });

    useEffect(() => {
        getSuppliers();
        getProducts();
        loadSavedData();
    }, []);

    const getSuppliers = async () => {
        try {
            const response = await axios.get(urlSuppliers);
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error al obtener proveedores', error);
        }
    };

    const getProducts = async () => {
        try {
            const response = await axios.get(urlProducts);
            setProducts(response.data);
        } catch (error) {
            console.error('Error al obtener productos', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'purchaseDate') {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate > today) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se puede registrar compras para fechas futuras.',
                });
                return;
            }
        }
        setFormData({ ...formData, [name]: value });
        saveData({ ...formData, [name]: value }, shoppingDetails);
    };

    const handleProductSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !shoppingDetails.some(item => item.product_id === product.id)
    );

    const addProductToDetails = (product) => {
        const newShoppingDetails = [...shoppingDetails, {
            product_id: product.id,
            Product_Name: product.Product_Name,
            quantity: 1,
            unitPrice: parseFloat(product.Price),
            total_price: parseFloat(product.Price)
        }];
        setShoppingDetails(newShoppingDetails);
        saveData(formData, newShoppingDetails);
        setSearchTerm('');
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity > 50) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La cantidad no puede ser mayor a 50.',
            });
            return;
        }
        setShoppingDetails(shoppingDetails.map(item => {
            if (item.product_id === productId) {
                const validQuantity = Math.max(1, Math.min(50, newQuantity));
                const newTotalPrice = item.unitPrice * validQuantity;
                return { ...item, quantity: validQuantity, total_price: newTotalPrice };
            }
            return item;
        }));
    };

    const handleUnitPriceChange = (productId, event) => {
        const newUnitPrice = parseFloat(event.target.value) || 0;
        setShoppingDetails(shoppingDetails.map(item => {
            if (item.product_id === productId) {
                const newTotalPrice = newUnitPrice * item.quantity;
                return { ...item, unitPrice: newUnitPrice, total_price: newTotalPrice };
            }
            return item;
        }));
    };

    const handleQuantityChange = (productId, event) => {
        const newQuantity = parseInt(event.target.value) || 1;
        updateQuantity(productId, newQuantity);
    };

    const removeProduct = (productId) => {
        const updatedDetails = shoppingDetails.filter(item => item.product_id !== productId);
        setShoppingDetails(updatedDetails);
        saveData(formData, updatedDetails);
    };

    const calculateTotal = () => {
        return shoppingDetails.reduce((total, item) => total + item.total_price, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.purchaseDate || !formData.supplierId || shoppingDetails.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, complete todos los campos y agregue al menos un producto.',
            });
            return;
        }

        const shoppingData = {
            ...formData,
            status: "completada",
            shoppingDetails: shoppingDetails.map(({ Product_Name, ...item }) => item)
        };

        try {
            await axios.post(urlShopping, shoppingData);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Compra registrada con éxito',
            }).then(() => {
                navigate('/Shopping');
            });

            setFormData({ code: '', purchaseDate: '', supplierId: '' });
            setShoppingDetails([]);
        } catch (error) {
            console.error('Error al registrar la compra', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al registrar la compra',
            });
        }
    };

    const saveData = (formData, shoppingDetails) => {
        localStorage.setItem('shoppingFormData', JSON.stringify({ formData, shoppingDetails }));
    };

    const loadSavedData = () => {
        const savedData = localStorage.getItem('shoppingFormData');
        if (savedData) {
            const { formData: savedFormData, shoppingDetails: savedShoppingDetails } = JSON.parse(savedData);
            setFormData(savedFormData);
            setShoppingDetails(savedShoppingDetails);
        }
    };

    const handleClose = () => {
        localStorage.removeItem('shoppingFormData');
        navigate('/Shopping');
    };

    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Registrar Compra</span>
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
                                    label="Ingresos"
                                    icon={<IoCart fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    label="Compras"
                                    icon={<FaCartPlus fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card border-0 p-3 d-flex colorTransparent'>
                    <div className='row'>
                        <div className='col-sm-7'>
                            <div className='card-detail shadow border-0'>
                                <div className='row p-3'>
                                    <div className='bcg-w col-sm-7 d-flex align-items-center'>
                                        <div className="position-relative d-flex align-items-center">
                                            <span className='Title'>Detalle de compra</span>
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
                                    <div className='d-flex aline-items-center justify-content-end'>
                                        <div className="product-search-results">
                                            {searchTerm && filteredProducts.map(product => (
                                                <div key={product.id} className="product-item shadow border-0" onClick={() => addProductToDetails(product)}>
                                                    {product.Product_Name} - ${product.Price}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className='table-responsive mt-3 p-3'>
                                    <table className='table table-bordered table-hover v-align table-striped'>
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
                                            {shoppingDetails.map((item) => (
                                                <tr key={item.product_id}>
                                                    <td>{item.Product_Name}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.product_id, e)}
                                                            min="1"
                                                            max="50"
                                                            className="form-control"
                                                            style={{ width: '65px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleUnitPriceChange(item.product_id, e)}
                                                            className="form-control"
                                                            style={{ width: '110px' }}
                                                        />
                                                    </td>
                                                    <td>{item.total_price.toFixed(2)}</td>
                                                    <td>
                                                        <div className='d-flex align-items-center'>
                                                            <Button color='error' className='delete' onClick={() => removeProduct(item.product_id)}><IoTrashSharp /></Button>
                                                            <div className='actions-quantity'>
                                                                <Button className='primary' onClick={() => updateQuantity(item.product_id, item.quantity + 1)}><FaPlus /></Button>
                                                                <Button className='primary' onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}><FaMinus /></Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                                    <span className='valor'>Total: ${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className='col-sm-5'>
                            <div className='card-detail shadow border-0'>
                                <div className="cont-title w-100">
                                    <span className='Title'>Info de compra</span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <div className="d-flex align-items-center w-100 p-4">
                                        <Form className='form' onSubmit={handleSubmit}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Col sm="6">
                                                    <Form.Label>Codigo</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Ingrese el código"
                                                        name="code"
                                                        value={formData.code}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </Col>
                                                <Col sm="6">
                                                    <Form.Label>Fecha Compra</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        placeholder="Fecha Compra"
                                                        name="purchaseDate"
                                                        value={formData.purchaseDate}
                                                        onChange={handleInputChange}
                                                        max={new Date().toISOString().split("T")[0]}
                                                        required
                                                    />
                                                </Col>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Proveedor</Form.Label>
                                                <Form.Select
                                                    name="supplierId"
                                                    value={formData.supplierId}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Seleccionar proveedor</option>
                                                    {suppliers.map((supplier) => (
                                                        <option key={supplier.id} value={supplier.id}>
                                                            {supplier.Supplier_Name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className='d-flex align-items-center justify-content-end'>
                                                <Button variant="secondary" className='btn-red' onClick={handleClose}>
                                                    Cerrar
                                                </Button>
                                                <Button variant="primary" type="submit" className='btn-sucess'>
                                                    Guardar
                                                </Button>
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
}

export default RegisterShopping;


import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Logout from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';


import axios from 'axios';
import {
    TextField,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Typography,
    CircularProgress,
    Badge,
    ListItemAvatar,
    Avatar,
    Alert,
    Snackbar
} from '@mui/material';
import { ShoppingCart, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import './shop.css';

export default function Component() {
    // Mover todas las declaraciones de estado al principio
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');
    const [cart, setCart] = useState({});
    const [total, setTotal] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const context = useContext(MyContext);
    const navigate = useNavigate();

    const open = Boolean(anchorEl);

    useEffect(() => {
        calculateTotal();
    }, [cart, products]);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        fetchProducts();
    }, [context]);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        checkLoginStatus();
    }, [context]);
    useEffect(() => {
        // Lógica para cargar productos, manejar errores, etc.
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:1056/api/products');
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError('Error al cargar los productos.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const storedEmail = localStorage.getItem('userName');
        if (token && storedEmail) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
        } else {
            setIsLoggedIn(false);
            setUserEmail('');
        }
    };
    const calculateTotal = () => {
        let sum = 0;
        Object.entries(cart).forEach(([productId, quantity]) => {
            const product = products.find(p => p.id === parseInt(productId));
            if (product) {
                sum += product.Price * quantity;
            }
        });
        setTotal(sum);
    };

    const fetchProducts = async () => {
        setLoading(true); // Inicia el estado de carga
    
        try {
            const response = await axios.get('http://localhost:1056/api/products');
            
            // Filtra los productos activos
            const activeProducts = response.data.filter(product => product.status === 'A');
            setProducts(activeProducts); // Establece los productos activos en el estado
        } catch (err) {
            // Manejo de errores
            setError('Error al cargar los productos. Por favor, intente más tarde.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false); // Finaliza el estado de carga
        }
    };
    

    const addToCart = (product) => {
        if (product.Stock <= 0) {
            setAlertMessage('Producto agotado');
            setAlertSeverity('warning');
            return;
        }

        setCart(prevCart => {
            const currentQuantity = prevCart[product.id] || 0;
            if (currentQuantity + 1 > product.Stock) {
                setAlertMessage(`No puedes agregar más de ${product.Stock} unidades de este producto.`);
                setAlertSeverity('warning');
                return prevCart;
            }
            setAlertMessage('Producto agregado al carrito');
            setAlertSeverity('success');
            return {
                ...prevCart,
                [product.id]: currentQuantity + 1
            };
        });
    };

    const handleShowOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:1056/api/orders`);
            const orders = response.data;
    
            if (orders.length > 0) {
                // Generar HTML para mostrar los pedidos en formato de tabla
                const ordersList = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Pedido ID</th>
                                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Total</th>
                                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Estado</th>
                                <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Expira el</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => {
                                const tokenExpiration = new Date(order.Token_Expiration);
                                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                                const formattedExpiration = tokenExpiration.toLocaleDateString('es-ES', options);
                                
                                return `
                                    <tr>
                                        <td style="border: 1px solid #ccc; padding: 8px;">${order.id || 'Sin ID'}</td>
                                        <td style="border: 1px solid #ccc; padding: 8px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.total_price)}</td>
                                        <td style="border: 1px solid #ccc; padding: 8px;">${order.status || 'Desconocido'}</td>
                                        <td style="border: 1px solid #ccc; padding: 8px;">${formattedExpiration}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
    
                Swal.fire({
                    title: 'Tus Pedidos',
                    html: ordersList,
                    icon: 'info',
                    customClass: {
                        popup: 'swal-popup', // Puedes aplicar estilos adicionales aquí si lo deseas
                    },
                    showCloseButton: true,
                });
            } else {
                Swal.fire('No tienes pedidos realizados.');
            }
        } catch (error) {
            console.error("Error al mostrar los pedidos:", error);
            Swal.fire('Error', 'Hubo un problema al obtener tus pedidos.', 'error');
        }
    };
    

    const increaseQuantity = (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;

        setCart(prevCart => {
            const currentQuantity = prevCart[productId] || 0;
            if (currentQuantity + 1 > product.Stock) {
                setAlertMessage(`No puedes agregar más de ${product.Stock} unidades de este producto.`);
                setAlertSeverity('warning');
                return prevCart;
            }
            setAlertMessage('Cantidad aumentada');
            setAlertSeverity('success');
            return {
                ...prevCart,
                [productId]: currentQuantity + 1
            };
        });
    };

    const decreaseQuantity = (productId) => {
        setCart(prevCart => {
            const currentQuantity = prevCart[productId];
            if (currentQuantity <= 1) {
                const newCart = { ...prevCart };
                delete newCart[productId];
                setAlertMessage('Producto eliminado del carrito');
                setAlertSeverity('info');
                return newCart;
            }
            setAlertMessage('Cantidad disminuida');
            setAlertSeverity('info');
            return {
                ...prevCart,
                [productId]: currentQuantity - 1
            };
        });
    };

    const clearCart = () => {
        setCart({});
        setAlertMessage('Carrito vacío');
        setAlertSeverity('info');
    };

    const handleCheckout = async () => {
        // Validar que haya al menos un producto en el carrito
        if (Object.keys(cart).length === 0) {
            Swal.fire('Error', 'Debes seleccionar al menos un producto antes de realizar el pedido.', 'error');
            return; // Salir de la función
        }

        // Validar que todos los productos en el carrito tengan stock suficiente
        const orderDetails = Object.entries(cart).map(([productId, quantity]) => ({
            quantity: quantity, // Cantidad del producto
            id_producto: parseInt(productId) // Convertir el ID del producto a entero
        }));

        const invalidProducts = orderDetails.filter(detail => {
            const product = products.find(p => p.id === detail.id_producto);
            return !product || product.Stock < detail.quantity || detail.quantity <= 0; // Verificar stock y cantidad
        });

        // Si hay productos inválidos, mostrar alerta y detener la ejecución
        if (invalidProducts.length > 0) {
            Swal.fire('Error', 'Hay productos en el carrito que no cumplen con los requisitos. Asegúrate de que la cantidad sea mayor a 0 y que haya suficiente stock.', 'error');
            return; // Salir de la función
        }

        try {
            // Obtener la fecha y hora actual
            const now = new Date();
            const orderDateTime = now.toISOString().split('T'); // Obtener fecha y hora en formato ISO
            const orderDate = orderDateTime[0]; // Fecha en formato YYYY-MM-DD
            const orderTime = orderDateTime[1].split('.')[0]; // Hora en formato HH:mm:ss

            // Calcular la fecha de vencimiento del token (3 días después)
            const expirationDate = new Date(now);
            expirationDate.setDate(expirationDate.getDate() + 3); // Agregar 3 días
            const expirationDateString = expirationDate.toLocaleDateString('es-ES'); // Formato legible en español

            // Crear objeto con los datos del pedido
            const orderData = {
                Billnumber: `ORD${Date.now()}`, // Generación automática del número de factura
                OrderDate: orderDate, // Fecha actual
                OrderTime: orderTime, // Hora actual
                total_price: parseFloat(total.toFixed(2)), // Precio total con 2 decimales
                status: 'Completada', // Estado del pedido
                id_usuario: context.userId, // ID del usuario que realiza el pedido
                orderDetails: orderDetails // Usar la variable ya creada con los detalles
            };

            // Enviar la solicitud POST para crear el pedido
            const response = await axios.post('http://localhost:1056/api/orders', orderData);

            // Comprobar si la respuesta fue exitosa
            if (response.status === 201) {
                // Mostrar alerta de éxito
                Swal.fire({
                    title: '¡Pedido creado!',
                    html: `
                        <p>Tu pedido ha sido registrado correctamente.</p>
                        <p>Número de factura: ${orderData.Billnumber}</p>
                        <p>Fecha: ${orderData.OrderDate}</p>
                        <p>Hora: ${orderData.OrderTime}</p>
                        <p>Fecha de vencimiento del token: ${expirationDateString}</p>
                    `,
                    icon: 'success'
                });

                // Limpiar el carrito
                clearCart();
                setDrawerOpen(false); // Cerrar el drawer o menú
            }

            // Actualizar el stock de los productos
            for (const detail of orderData.orderDetails) {
                const productId = detail.id_producto; // ID del producto
                const quantity = detail.quantity; // Cantidad vendida
                const product = products.find(p => p.id === productId); // Buscar el producto en el estado

                if (product) {
                    // Enviar solicitud PUT para actualizar el stock del producto
                    await axios.put(`http://localhost:1056/api/products/${productId}`, {
                        Stock: product.Stock - quantity // Restar la cantidad del stock
                    });
                }
            }
        } catch (error) {
            console.error('Error creando el pedido:', error); // Manejo del error
            if (error.response) {
                console.error('El servidor respondió con:', error.response.data);
            }
            // Mostrar alerta de error
            Swal.fire('Error', 'Hubo un problema al crear el pedido. Intente de nuevo.', 'error');
        } finally {
            // Mensaje positivo al final de la ejecución
            Swal.fire('¡Éxito!', 'Tu pedido ha sido procesado. Gracias por tu compra.', 'success');
        }
    };



    const getTotalItems = () => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

    const filteredProducts = products.filter(product => {
        const productName = product.Product_Name || '';
        const productDescription = product.Description || '';
        return (
            productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productDescription.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const handleLogin = () => navigate('/login');
    const handleAdministrar = () => {
        context.setIsHideSidebarAndHeader(false);
        navigate('/sales');
    };
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
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
        navigate('/index');
    };

    const getUserInitial = () => {
        return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
    };


    return (
        <>
            <header className="header-index1">
                <div className="header-content">
                    <Link to={'/'} className='d-flex align-items-center logo-index'>
                        <img src={logo} alt="Logo" />
                        <span className='ml-2'>Barberia Orion</span>
                    </Link>
                    <nav className='navBar-index'>
                        <Link to='/index'>INICIO</Link>
                        <Link to='/services'>SERVICIOS</Link>
                        <Link to='/appointmentView'>CITAS</Link>
                        <Link to='/shop'>PRODUCTOS</Link>
                        <Link to='/index'>CONTACTO</Link>
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <Badge badgeContent={getTotalItems()} color="primary">
                                <AddShoppingCartIcon /> {/* Cambia ShoppingCart por AddShoppingCartIcon */}
                            </Badge>
                        </IconButton>

                    </nav>
                    {isLoggedIn && userEmail ? (
                        <div className="user-menu">
                            <Button
                                onClick={handleMenuClick}
                                className="userLoginn"
                                startIcon={
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                        {getUserInitial()}
                                    </Avatar>
                                }
                            >
                                {userEmail}
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        <Button
                            variant="contained"
                            className="book-now-btn"
                            onClick={handleLogin}
                        >
                            INICIAR SESION
                        </Button>
                    )}
                </div>
            </header>

            <main className="container mx-auto mt-8 shop-container">
                <h1 className="shop-title">NUESTROS PRODUCTOS</h1>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar productos"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <CircularProgress />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 p-4">
                        <p>{error}</p>
                        <Button variant="contained" color="primary" onClick={fetchProducts} className="mt-4">
                            Reintentar
                        </Button>
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="product-card">
                                    <img
                                        src={product.Image}
                                        alt={product.Product_Name}
                                        className="product-image"
                                    />
                                    <Typography variant="h5" component="h2" className="product-title">
                                        {product.Product_Name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" className="product-description">
                                        {product.Description}
                                    </Typography>
                                    <Typography variant="body1" className="product-price">
                                        Precio: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        onClick={() => addToCart(product)}
                                        className="barber-add-cart-btn"
                                        startIcon={<AddShoppingCartIcon />}
                                        fullWidth
                                    >
                                        AGREGAR
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="no-products-container text-center py-12">
                                <Typography variant="h6" gutterBottom>
                                    No se encontraron productos
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    No hay productos que coincidan con tu búsqueda "{searchTerm}"
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4"
                                >
                                    Limpiar búsqueda
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                variant="persistent"
                className="cart-drawer"
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <div className="drawer-content">
                    <div className="drawer-header">
                        <Typography variant="h6">Carrito de Compras</Typography>
                        <IconButton
                            onClick={() => setDrawerOpen(false)}
                            className="close-drawer-btn"
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>

                    {Object.keys(cart).length === 0 ? (
                        <Typography className="empty-cart-message">Tu carrito está vacío</Typography>
                    ) : (
                        <List>
                            {Object.entries(cart).map(([productId, quantity]) => {
                                const product = products.find((p) => p.id === parseInt(productId));
                                if (!product) return null;

                                return (
                                    <ListItem key={productId} className="cart-item">
                                        <ListItemAvatar>
                                            <Avatar src={product.Image} alt={product.Product_Name} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={product.Product_Name}
                                            secondary={
                                                <span>
                                                    <span className="price-text">
                                                        {new Intl.NumberFormat('es-CO', {
                                                            style: 'currency',
                                                            currency: 'COP'
                                                        }).format(product.Price * quantity)}
                                                    </span>
                                                </span>
                                            }
                                        />
                                        <div className="quantity-controls">
                                            <IconButton
                                                onClick={() => decreaseQuantity(productId)}
                                                className="quantity-button"
                                                size="small"
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                            <span className="quantity-display">{quantity}</span>
                                            <IconButton
                                                onClick={() => increaseQuantity(productId)}
                                                className="quantity-button"
                                                size="small"
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </div>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}


                    <div className="drawer-footer">
                        <div className="total-amount">
                            <Typography variant="h6">Total:</Typography>
                            <Typography variant="h6">
                                {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP'
                                }).format(total)}
                            </Typography>
                        </div>
                    </div>
                    <Button variant="contained" onClick={handleShowOrders}>
                        Ver Mis Pedidos
                    </Button>

                    <div className="cart-buttons1">
                        <Button
                            variant="outlined"
                            onClick={clearCart}
                            className="barber-button barber-button-clear"
                            startIcon={<DeleteOutlineIcon />}
                        >
                            Vaciar Carrito
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCheckout}
                            className="barber-button barber-button-checkout"
                            startIcon={<ShoppingBagIcon />}
                        >
                            Realizar pedido
                        </Button>

                    </div>
                </div>
            </Drawer>

            <Snackbar
                open={!!alertMessage}
                autoHideDuration={3000}
                onClose={() => setAlertMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setAlertMessage('')} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
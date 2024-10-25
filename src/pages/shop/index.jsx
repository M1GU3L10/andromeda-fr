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
    const [anchorEl, setAnchorEl] = useState(null); // Mover esto al principio
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');
    const [cart, setCart] = useState({});
    const [total, setTotal] = useState(0);
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const open = Boolean(anchorEl); // Después de declarar anchorEl

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
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:1056/api/products');
            const activeProducts = response.data.filter(product => product.status === 'A');
            setProducts(activeProducts);
        } catch (err) {
            setError('Error al cargar los productos. Por favor, intente más tarde.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
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
        if (!context.isLogin || !context.userId) {
            Swal.fire('Error', 'Debes iniciar sesión para ver tus pedidos.', 'warning');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:1056/api/orders/user/${context.userId}`);
            const orders = response.data;

            if (orders.length > 0) {
                const ordersList = orders.map(order => {
                    const tokenExpiration = new Date(order.Token_Expiration);
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const formattedExpiration = tokenExpiration.toLocaleDateString('es-ES', options);

                    return `
                        Pedido ID: ${order.id || 'Sin ID'}, 
                        Total: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.total_price)}, 
                        Estado: ${order.status || 'Desconocido'}, 
                        Expira el: ${formattedExpiration}
                    `;
                }).join('\n');

                Swal.fire({
                    title: 'Tus Pedidos',
                    html: `<pre>${ordersList}</pre>`,
                    icon: 'info'
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
        if (!context.isLogin) {
            Swal.fire({
                title: 'Error',
                text: 'Debes iniciar sesión para realizar un pedido.',
                icon: 'error'
            }).then(() => {
                navigate('/login');
            });
            return;
        }

        if (!context.userId) {
            console.error('Error: User ID is not available');
            Swal.fire('Error', 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.', 'error');
            return;
        }

        if (!cart || Object.keys(cart).length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Debes agregar al menos un producto para realizar un pedido.',
                icon: 'error'
            });
            return;
        }

        try {
            const now = new Date();
            const tokenExpiration = new Date(now);
            tokenExpiration.setDate(tokenExpiration.getDate() + 3);

            const orderData = {
                Billnumber: `ORD${Date.now()}`,
                OrderDate: now.toISOString().split('T')[0],
                total_price: parseFloat(total.toFixed(2)),
                status: 'Completada',
                id_usuario: context.userId,
                Token_Expiration: tokenExpiration.toISOString(),
                orderDetails: Object.entries(cart).map(([productId, quantity]) => ({
                    quantity: quantity,
                    id_producto: parseInt(productId)
                }))
            };

            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedExpiration = tokenExpiration.toLocaleDateString('es-ES', options);

            console.log('Order data being sent:', JSON.stringify(orderData, null, 2));

            const response = await axios.post('http://localhost:1056/api/orders', orderData);

            console.log('Server response:', response.data);

            for (const detail of orderData.orderDetails) {
                const productId = detail.id_producto;
                const quantity = detail.quantity;
                const product = products.find(p => p.id === productId);
                if (product) {
                    await axios.put(`http://localhost:1056/api/products/${productId}`, {
                        ...product,
                        Stock: product.Stock - quantity
                    });
                }
            }

            Swal.fire({
                title: '¡Pedido creado!',
                html: `
                    <p>Tu pedido ha sido registrado correctamente.</p>
                    <p>Número de factura: ${orderData.Billnumber}</p>
                    <p>Tu pedido expira el: ${formattedExpiration}</p>
                `,
                icon: 'success'
            });

            clearCart();
            setDrawerOpen(false);
        } catch (error) {
            console.error('Error creating order:', error);
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            }
            Swal.fire('Error', 'Hubo un problema al crear el pedido. Intente de nuevo.', 'error');
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
                    {context.isLogin && (
                        <Button variant="contained" onClick={handleShowOrders}>
                            Ver Mis Pedidos
                        </Button>
                    )}
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
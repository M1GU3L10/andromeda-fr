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
import ReactPaginate from 'react-paginate';

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
    Snackbar,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { ShoppingCart, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import './shop.css';

export default function Component() {
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
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState(null);
    const [orders, setOrders] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const context = useContext(MyContext);
    const navigate = useNavigate();

    const open = Boolean(anchorEl);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        calculateTotal();
    }, [cart, products]);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        fetchProducts();
        checkLoginStatus();
    }, [context]);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const storedEmail = localStorage.getItem('userName');
        const idRole = localStorage.getItem('roleId');
        const userId = localStorage.getItem('userId'); // Captura el userId
    
        console.log("Token:", token); // Para depurar
        console.log("Email almacenado:", storedEmail); // Para depurar
        console.log("ID de rol:", idRole); // Para depurar
        console.log("ID de usuario:", userId); // Para depurar
    
        if (token && storedEmail && idRole && userId) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
            setUserRole(idRole); // Establecer el rol del usuario
            setUserId(userId); // Establecer el ID del usuario
            console.log("Usuario está logueado. Rol de usuario:", idRole); // Para depurar
        } else {
            setIsLoggedIn(false);
            setUserEmail('');
            setUserRole(''); // Asegurarte de que el rol se restablezca si no está logueado
            setUserId(null); // Restablecer el userId si no está logueado
            console.log("Usuario no está logueado."); // Para depurar
        }
    };
    
    useEffect(() => {
        checkLoginStatus();
    
        if (isLoggedIn) {
            console.log("Rol de usuario cargado:", userRole); // Para depurar
        } else {
            setUserRole(null);
        }
    }, [isLoggedIn]);
    
    

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
        setLoading(true);
        try {
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
        // Verifica si el usuario está logueado
        if (!isLoggedIn) {
            Swal.fire({
                title: 'Inicio de sesión requerido',
                text: 'Debes iniciar sesión para ver tus pedidos',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Iniciar sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    handleLogin(); // Asegúrate de que esta función redirija al usuario al login.
                }
            });
            return;
        }
    
        // Obtiene el ID del usuario desde localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
            Swal.fire('Error', 'No se pudo identificar el usuario', 'error');
            return;
        }
    
        try {
            // Muestra un mensaje de carga
            Swal.fire({
                title: 'Cargando pedidos',
                text: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
    
            // Realiza la solicitud a la API para obtener los pedidos del usuario
            const ordersResponse = await axios.get(`http://localhost:1056/api/orders/user/${userId}`);
            const orders = ordersResponse.data;
    
            // Verifica si el usuario no tiene pedidos
            if (!orders || orders.length === 0) {
                Swal.fire('Info', 'No tienes pedidos realizados', 'info');
                return;
            }
    
            // Formato de la lista de pedidos
            const ordersList = orders.map(order => {
                // Formatear la fecha del pedido
                const orderDate = new Date(order.OrderDate).toLocaleDateString('es-CO');
                const orderDetails = order.OrderDetails.map(detail => `
                    <div class="order-detail">
                        <p><strong>Producto ID:</strong> ${detail.id_producto}</p>
                        <p><strong>Cantidad:</strong> ${detail.quantity}</p>
                        <p><strong>Precio Unitario:</strong> ${new Intl.NumberFormat('es-CO', { 
                            style: 'currency', 
                            currency: 'COP' 
                        }).format(detail.unitPrice)}</p>
                        <p><strong>Total:</strong> ${new Intl.NumberFormat('es-CO', { 
                            style: 'currency', 
                            currency: 'COP' 
                        }).format(detail.total_price)}</p>
                    </div>
                `).join('<hr>');
    
                return `
                    <div class="order-item">
                        <h3>Pedido #${order.id}</h3>
                        <p><strong>Número de Factura:</strong> ${order.Billnumber}</p>
                        <p><strong>Fecha:</strong> ${orderDate}</p>
                        <p><strong>Estado:</strong> ${order.status}</p>
                        <p><strong>Total:</strong> ${new Intl.NumberFormat('es-CO', { 
                            style: 'currency', 
                            currency: 'COP' 
                        }).format(order.total_price)}</p>
                        <div class="order-details">
                            <h4>Detalles del pedido:</h4>
                            ${orderDetails}
                        </div>
                    </div>
                `;
            }).join('<hr class="order-separator">');
    
            // Muestra la lista de pedidos en un modal
            Swal.fire({
                title: 'Mis Pedidos',
                html: `
                    <div class="orders-container">
                        ${ordersList}
                    </div>
                `,
                width: '80%',
                showConfirmButton: true,
                customClass: {
                    container: 'orders-modal',
                    popup: 'orders-modal-popup',
                    content: 'orders-modal-content'
                }
            });
        } catch (error) {
            console.error("Error al mostrar los pedidos:", error);
            // Muestra un mensaje de error si la solicitud falla
            Swal.fire('Error', 'No se pudieron cargar los pedidos: ' + error.message, 'error');
        }
    };
    

    
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
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

        // Verificar si el usuario está logueado
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
        
            // Calcular el total
            const total = orderDetails.reduce((acc, detail) => {
                const product = products.find(p => p.id === detail.id_producto);
                return acc + (product.Price * detail.quantity); // Sumar el precio total
            }, 0);
        
            // Confirmar pedido
            const confirmation = await Swal.fire({
                title: 'Confirmar Pedido',
                html: `
                    <p>Estás a punto de realizar un pedido con un total de: <strong>${total.toFixed(2)} €</strong></p>
                    <p>¿Deseas continuar?</p>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, confirmar',
                cancelButtonText: 'Cancelar'
            });
        
            if (!confirmation.isConfirmed) {
                return; // Salir de la función si el usuario cancela
            }
        
            let orderCreated = false; // Variable para rastrear si el pedido fue creado
            let orderData; // Declarar variable para los datos del pedido
            let expirationDateString; // Declarar la variable para la fecha de vencimiento
        
            try {
                // Obtener la fecha y hora actual
                const now = new Date();
                const orderDateTime = now.toISOString().split('T'); // Obtener fecha y hora en formato ISO
                const orderDate = orderDateTime[0]; // Fecha en formato YYYY-MM-DD
                const orderTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); // Formato HH:mm:ss en español, 12 horas
        
                // Calcular la fecha de vencimiento del token (3 días después)
                const expirationDate = new Date(now);
                expirationDate.setDate(expirationDate.getDate() + 3); // Agregar 3 días
                expirationDateString = expirationDate.toLocaleDateString('es-ES'); // Formato legible en español
        
                // Crear objeto con los datos del pedido
                orderData = {
                    Billnumber: `ORD${Date.now()}`, // Generación automática del número de factura
                    OrderDate: orderDate, // Fecha actual
                    OrderTime: orderTime, // Hora en formato legible
                    total_price: parseFloat(total.toFixed(2)), // Precio total con 2 decimales
                    status: 'Completada', // Estado del pedido
                    id_usuario: userId, // ID del usuario que realiza el pedido
                    orderDetails: orderDetails // Usar la variable ya creada con los detalles
                };
        
                // Enviar la solicitud POST para crear el pedido
                const response = await axios.post('http://localhost:1056/api/orders', orderData);
        
                // Comprobar si la respuesta fue exitosa
                if (response.status === 201) {
                    orderCreated = true; // Marcar que el pedido fue creado
        
                    // Limpiar el carrito
                    clearCart(); // Asegúrate de que esta función esté definida
                }
            } catch (error) {
                console.error('Error creando el pedido:', error); // Manejo del error
                if (error.response) {
                    console.error('El servidor respondió con:', error.response.data);
                }
                // Mostrar alerta de error
                Swal.fire('Error', 'Hubo un problema al crear el pedido. Intente de nuevo.', 'error');
            } finally {
                // Mensaje positivo al final de la ejecución, solo si el pedido fue exitoso
                if (orderCreated) {
                    Swal.fire({
                        title: '¡Pedido creado exitosamente!',
                        html: `
                            <div class="order-confirmation">
                               
                                <p>Tu pedido ha sido registrado correctamente.</p>
                                <p>Número de factura: ${orderData.Billnumber}</p>
                                <p>Fecha: ${orderData.OrderDate}</p>
                                <p>Hora: ${orderData.OrderTime}</p>
                                <p>Fecha de vencimiento del token: ${expirationDateString}</p>
                                <p>Total a pagar: <strong>${total.toFixed(2)} €</strong></p>
                            </div>
                        `,
                        icon: 'success'
                    });
                }
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
        if (isLoggedIn && (userRole === '1' || userRole === '2')) {
            context.setIsHideSidebarAndHeader(false);
            navigate('/sales');
        } else {
            Swal.fire('Error', 'No tienes permisos para acceder a la sección de administración.', 'error');
        }
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
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        
        setIsLoggedIn(false);
        setUserEmail('');
        setUserRole('');
        setUserId(null);
        
        handleMenuClose();
        navigate('/shop');
    };
    
    const getUserInitial = () => {
        return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
    };

    return (
        <>
            <header className="header-index1">
                <div className="header-content">
                    <Link to={'/'} className='d-flex  align-items-center logo-index'>
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
                                <AddShoppingCartIcon />
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
                                {userRole === '1' || userRole === '2' ? (
                                    <MenuItem onClick={handleAdministrar}>Administrar</MenuItem>
                                ) : (
                                    <MenuItem onClick={() => setDrawerOpen(true)}>Carrito</MenuItem>
                                )}
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

            {orders.length > 0 && (
                <ReactPaginate
                    previousLabel={'Anterior'}
                    nextLabel={'Siguiente'}
                    breakLabel={'...'}
                    pageCount={Math.ceil(orders.length / ITEMS_PER_PAGE)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageChange}
                    containerClassName={'pagination'}
                    activeClassName={'active'}
                />
            )}
        </>
    );
}
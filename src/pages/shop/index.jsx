import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
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
    Alert
} from '@mui/material';
import { ShoppingCart, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import './shop.css';

const Shop = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [cart, setCart] = useState({});
    const [total, setTotal] = useState(0);
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);


    const handleLogin = () => {
        navigate('/login');
    };

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

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        context.setIsLogin(false);
        navigate('/login');
    };


    useEffect(() => {
        calculateTotal();
    }, [cart, products]);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        fetchProducts();
    }, [context]);

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
            return;
        }

        setCart(prevCart => {
            const currentQuantity = prevCart[product.id] || 0;
            if (currentQuantity + 1 > product.Stock) {
                setAlertMessage(`No puedes agregar más de ${product.Stock} unidades de este producto.`);
                return prevCart;
            }
            return {
                ...prevCart,
                [product.id]: currentQuantity + 1
            };
        });
        setAlertMessage('');
    };

    const increaseQuantity = (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;

        setCart(prevCart => {
            const currentQuantity = prevCart[productId] || 0;
            if (currentQuantity + 1 > product.Stock) {
                setAlertMessage(`No puedes agregar más de ${product.Stock} unidades de este producto.`);
                return prevCart;
            }
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
                return newCart;
            }
            return {
                ...prevCart,
                [productId]: currentQuantity - 1
            };
        });
    };

    const clearCart = () => {
        setCart({});
        setAlertMessage('Carrito vacío');
    };

    const handleCheckout = async () => {
        try {
            const now = new Date();
            const orderData = {
                Order_Date: now.toISOString().split('T')[0],
                Order_Time: now.toTimeString().split(' ')[0],
                Total_Amount: parseFloat(total).toFixed(2),
                Status: 'En proceso',
                User_Id: context.userId || 1, // Asume que el ID del usuario está en el contexto
                Token_Expiration: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            };

            const response = await axios.post('http://localhost:1056/api/orders', orderData);

            // Actualiza el stock de los productos en el backend
            for (const [productId, quantity] of Object.entries(cart)) {
                const product = products.find(p => p.id === parseInt(productId));
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
                    <p>El pedido tiene un tiempo para ser entregado y vence: ${new Date(response.data.Token_Expiration).toLocaleDateString()} a las ${new Date(response.data.Token_Expiration).toLocaleTimeString()}</p>
                `,
                icon: 'success'
            });

            clearCart();
            setDrawerOpen(false);
        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al crear el pedido. Intente de nuevo.', 'error');
            console.error('Error creating order:', error);
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

    return (
        <>
            <header className="header-index1">
                <div className="header-content d-flex align-items-center justify-content-between">
                    <Link to={'/'} className='d-flex align-items-center logo-index'>
                        <img src={logo} alt="Barberia Orion Logo" />
                        <span className='ml-2'>Barberia Orion</span>
                    </Link>
                    <nav className='navBar-index'>
                        <Link to='/index'>INICIO</Link>
                        <Link to='/services'>SERVICIOS</Link>
                        <Link to='/appointment'>CITAS</Link>
                        <Link to='/shop'>PRODUCTOS</Link>
                        <Link to='/index'>CONTACTO</Link>
                        <Button
                            variant="text"
                            className="administrar-btn"
                            onClick={handleAdministrar}
                        >
                            ADMINISTRAR
                        </Button>
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <Badge badgeContent={getTotalItems()} color="secondary">
                                <ShoppingCart />
                            </Badge>
                        </IconButton>
                    </nav>
                    <div className='MyAccWrapper d-flex align-items-center'>
                        {context.isLogin ? (
                            <div className='d-flex align-items-center'>
                                <Button className='MyAcc' onClick={handleClick}>
                                    <Avatar
                                        alt="User Avatar"
                                        src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
                                    />
                                </Button>
                                <div className='userInfo' style={{ marginLeft: '8px' }}>
                                    <span style={{ color: 'white' }}>{context.userName}</span>
                                </div>
                            </div>
                        ) : (
                            <Button variant="contained" className="book-now-btn" onClick={handleLogin}>
                                INICIAR SESIÓN
                            </Button>
                        )}
                        <Menu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {context.isLogin && (
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Cerrar sesión
                                </MenuItem>
                            )}
                        </Menu>
                    </div>
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

                    {alertMessage && <Alert severity="warning">{alertMessage}</Alert>}

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
                            disabled={Object.keys(cart).length === 0}
                        >
                            Realizar pedido
                        </Button>
                    </div>


                </div>
            </Drawer>
        </>
    );
};

export default Shop;
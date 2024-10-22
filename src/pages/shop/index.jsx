import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import {
    TextField,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Typography,
    CircularProgress,
    IconButton,
    Badge,
    ListItemAvatar,
    Avatar,
    Alert
} from '@mui/material';
import { ShoppingCart, Search } from '@mui/icons-material';
import Swal from 'sweetalert2'; 
import './shop.css';

const Shop = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        fetchProducts();
    }, [context]);

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

    const handleLogin = () => {
        navigate('/login');
    };

    const addToCart = (product) => {
        if (product.Stock <= 0) {
            setAlertMessage('Producto agotado');
            return;
        }

        const currentQuantity = cart[product.id] || 0;

        if (currentQuantity + 1 > product.Stock) {
            setAlertMessage(`No puedes agregar más de ${product.Stock} unidades de este producto.`);
            return;
        }

        setCart((prevCart) => ({
            ...prevCart,
            [product.id]: (prevCart[product.id] || 0) + 1,
        }));

        setAlertMessage('');
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => {
            const newCart = { ...prevCart };
            if (newCart[productId] > 1) {
                newCart[productId]--;
            } else {
                delete newCart[productId];
            }
            return newCart;
        });
    };

    const clearCart = () => {
        setCart({});
        setAlertMessage('Carrito vacío');
    };

    const handleCheckout = async () => {
        if (Object.keys(cart).length === 0) {
            setAlertMessage('Tu carrito está vacío. Agrega productos antes de realizar un pedido.');
            return;
        }

        console.log('Realizando pedido con los siguientes productos:', cart);
        clearCart();

        // Mostrar la alerta de SweetAlert
        await Swal.fire({
            title: '¡Pedido realizado con éxito!',
            text: 'Tu pedido ha sido procesado.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
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
                <div className="header-content">
                    <Link to={'/'} className='d-flex align-items-center logo-index'>
                        <img src={logo} alt="Logo" />
                        <span className='ml-2'>Barberia Orion</span>
                    </Link>
                    <nav className='navBar-index1'>
                        <Link to='/index'>INICIO</Link>
                        <Link to='/about'>ABOUT</Link>
                        <Link to='/services'>SERVICIOS</Link>
                        <Link to='/blog'>BLOG</Link>
                        <Link to='/shop'>PRODUCTOS</Link>
                        <Link to='/contact'>CONTACTO</Link>
                    </nav>
                    <div className="d-flex align-items-center">
                        <Button variant="contained" className="book-now-btn" onClick={handleLogin}>
                            INICIAR SESIÓN
                        </Button>
                        <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                            <Badge badgeContent={getTotalItems()} color="secondary">
                                <ShoppingCart />
                            </Badge>
                        </IconButton>
                    </div>
                </div>
            </header>

            <main className="container mx-auto mt-8 shop-container">
                <h1 className="shop-title">NUESTROS PRODUCTOS</h1>

                <div className="search-bar mb-4">
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar productos"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <Search className="text-gray-400 mr-2" />,
                        }}
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
                                        color="primary"
                                        fullWidth
                                        onClick={() => addToCart(product)}
                                        className="add-to-cart-btn mt-2"
                                    >
                                        Agregar al carrito
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
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

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div className="drawer-content">
                    <Typography variant="h6" gutterBottom>Carrito de Compras</Typography>
                    {alertMessage && <Alert severity="warning">{alertMessage}</Alert>}
                    {Object.keys(cart).length === 0 ? (
                        <Typography>Tu carrito está vacío</Typography>
                    ) : (
                        <List>
                            {Object.entries(cart).map(([productId, quantity]) => {
                                const product = products.find((p) => p.id === parseInt(productId));
                                return (
                                    <ListItem key={productId} className="cart-item">
                                        {product && (
                                            <ListItemAvatar>
                                                <Avatar src={product.Image} alt={product.Product_Name} />
                                            </ListItemAvatar>
                                        )}
                                        <ListItemText
                                            primary={product ? product.Product_Name : "Producto no disponible o agotado"}
                                            secondary={
                                                <span>
                                                    <span style={{ color: 'blue' }}>
                                                        Cantidad: {cart[productId] || 0}
                                                    </span> | Precio: {product ? (product.Price * (cart[productId] || 0)).toFixed(2) : "N/A"}
                                                </span>
                                            }
                                        />

                                        <IconButton onClick={() => removeFromCart(parseInt(productId))}>
                                            -
                                        </IconButton>
                                        <IconButton onClick={() => addToCart(product)}>
                                            +
                                        </IconButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                    <div className="drawer-footer">
                        <Button variant="contained" color="primary" onClick={handleCheckout} disabled={Object.keys(cart).length === 0}>
                            Realizar Pedido
                        </Button>
                        <Button variant="outlined" color='error' onClick={clearCart}>
                            Vaciar Carrito
                        </Button>

                        {Object.keys(cart).length > 0 && (
                            <Typography variant="h6" className="total-price">
                                Total: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(
                                    Object.entries(cart).reduce((total, [productId, quantity]) => {
                                        const product = products.find(p => p.id === parseInt(productId));
                                        return total + (product ? product.Price * quantity : 0);
                                    }, 0)
                                )}
                            </Typography>
                        )}
                    </div>
                </div>
            </Drawer>

        </>
    );
};

export default Shop;


















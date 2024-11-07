import React, { useContext, useEffect, useState, useRef } from 'react';
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

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
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



  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const servicesRef = useRef(null);
  const formattedTotal = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(total);

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
    const userId = localStorage.getItem('userId');



    if (token && storedEmail && idRole && userId) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setUserRole(idRole);
      setUserId(userId);
      
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setUserRole('');
      setUserId(null);
      
    }
  };

  useEffect(() => {
    checkLoginStatus();

    if (isLoggedIn) {
      
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
    setCart((prevCart) => {
      const currentQuantity = prevCart[product.id] || 0;
    
      if (currentQuantity + 1 > product.Stock) {
        // Usamos un estado para activar el mensaje de alerta
        toast.error(`¡Producto agotado! Solo quedan ${product.Stock} en stock.`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
    
        return prevCart;
      }
    
      return {
        ...prevCart,
        [product.id]: currentQuantity + 1
      };
    });
    
    
    
   
    
    
    
  };

  

  const handleShowOrders = () => {
    navigate('/ordermy');
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
    
      return {
        ...prevCart,
        [productId]: currentQuantity - 1
      };
    });
  };

  const clearCart = () => {
    setCart({});

  };

  const handleCheckout = async () => {
    // Primero, verifica si el usuario está autenticado
    if (!isLoggedIn) {
      Swal.fire('Error', 'Debes iniciar sesión para realizar un pedido.', 'error');
      // Aquí podrías redirigir al usuario a la página de inicio de sesión
      // history.push('/login');
      return;
    }

    if (Object.keys(cart).length === 0) {
      Swal.fire('Error', 'Debes seleccionar al menos un producto antes de realizar el pedido.', 'error');
      return;
    }

    const orderDetails = Object.entries(cart).map(([productId, quantity]) => ({
      quantity: quantity,
      id_producto: parseInt(productId)
    }));

    const invalidProducts = orderDetails.filter(detail => {
      const product = products.find(p => p.id === detail.id_producto);
      return !product || product.Stock < detail.quantity || detail.quantity <= 0;
    });

    if (invalidProducts.length > 0) {
      Swal.fire('Error', 'Hay productos en el carrito que no cumplen con los requisitos. Asegúrate de que la cantidad sea mayor a 0 y que haya suficiente stock.', 'error');
      return;
    }

    const total = orderDetails.reduce((acc, detail) => {
      const product = products.find(p => p.id === detail.id_producto);
      return acc + (product.Price * detail.quantity);
    }, 0);
    const formattedTotal = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(total);

    const confirmation = await Swal.fire({
      title: 'Confirmar Pedido',
      html: `
        <p>Estás a punto de realizar un pedido con un total de: <strong>${formattedTotal} COP</strong></p>
        <p>¿Deseas continuar?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    let orderCreated = false;
    let orderData;
    let expirationDateString;

    try {
      const now = new Date();
      const orderDateTime = now.toISOString().split('T');
      const orderDate = orderDateTime[0];
      const orderTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

      const expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + 3);
      expirationDateString = expirationDate.toLocaleDateString('es-ES');

      orderData = {
        Billnumber: `ORD${Date.now()}`,
        OrderDate: orderDate,
        OrderTime: orderTime,
        total_price: parseFloat(total.toFixed(2)),
        status: 'Pendiente',
        id_usuario: userId,
        orderDetails: orderDetails
      };

      const response = await axios.post('http://localhost:1056/api/orders', orderData);

      if (response.status === 201) {
        orderCreated = true;
        clearCart();
      }
    } catch (error) {
      console.error('Error creando el pedido:', error);
      if (error.response) {
        console.error('El servidor respondió con:', error.response.data);
      }
      Swal.fire('Error', 'Hubo un problema al crear el pedido. Intente de nuevo.', 'error');
    } finally {
      if (orderCreated) {
        Swal.fire({
          title: '¡Pedido creado exitosamente!',
          html: `
            <div class="order-confirmation">
              
             
              <p>Fecha de vencimiento del pedido (en caso de no ser cancelado): ${expirationDateString}</p>
              <p>Total a pagar: <strong>${formattedTotal} COP</strong></p>
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


  const handledashboard = () => {
    context.setIsHideSidebarAndHeader(false);
    navigate('/services');
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
    toast.error('Sesion cerrada', {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      onClose: () => navigate('/index')
    });
  };

  const getUserInitial = () => {
    return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
  };
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };



  const scrollToServices = () => {
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`header-index1 ${isScrolled ? 'abajo' : ''}`}>
        <Link to={'/'} className='d-flex align-items-center logo-index'>
          <img src={logo} alt="Logo" />
          <span className='ml-2'>Barberia Orion</span>
        </Link>
        <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
          <nav className='navBar-index'>
            <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
            <Link to='/appointmentView'>CITAS</Link>
            <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
            <Link to='/contact' onClick={() => setIsNavOpen(false)}>CONTACTO</Link>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <Badge badgeContent={getTotalItems()} color="primary">
                <AddShoppingCartIcon />
              </Badge>
            </IconButton>
          </nav>

          <div className="auth-buttons">
            {isLoggedIn && userEmail ? (
              <div className="user-menu">
                <Button
                  onClick={handleMenuClick}
                  className="userLoginn"
                  startIcon={
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: '#b89b58 '// Aplica el color aleatorio
                      }}
                    >
                      {getUserInitial()}
                    </Avatar>

                  }

                >

                  {userEmail}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} className='menu-landingPage'>
                  {userRole == 1 || userRole == 2 ? (
                    <MenuItem onClick={handledashboard} className='menu-item-landingPage'><GrUserAdmin />Administrar</MenuItem>
                  ) : (
                    <MenuItem>Carrito</MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} className='menu-item-landingPage'><GiExitDoor />Cerrar Sesión</MenuItem>
                </Menu>
              </div>
            ) : (
              <Button
                variant="contained"
                className="book-now-btn"
                onClick={handleLogin}
              >
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </header >



      <br /><br /><br />
      <main className="container mx-auto mt-8 shop-container" >
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
                    Precio: {new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(product.Price)}
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => addToCart(product)}
                    className="barber-add-cart-btn"
                  >
                    <div className="button-wrapper-barber">
                      <span className="text-barber">AGREGAR</span>
                      <span className="icon-button-barber">
                        <AddShoppingCartIcon />
                      </span>
                    </div>
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
                              currency: 'COP',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
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
                {formattedTotal}$
              </Typography>
            </div>
          </div>

          <Button
            variant="contained"
            onClick={handleShowOrders}
            sx={{
              backgroundColor: '#c59d5f',
              '&:hover': {
                backgroundColor: '#c59d5f',
              },
              color: '#fff'
            }}
          >
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
import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MyContext } from '../../App';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/images/logo-light.png';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import { FaShoppingBag } from 'react-icons/fa';

const Ordermy = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const servicesRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    checkLoginStatus();
    context.setIsHideSidebarAndHeader(true);
    context.setThemeMode(false);
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchOrders();
    }
  }, [isLoggedIn, userId]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwtToken');
    const storedEmail = localStorage.getItem('userName');
    const idRole = localStorage.getItem('roleId');
    const storedUserId = localStorage.getItem('userId'); // Capturamos el ID del usuario logueado

    if (token && storedEmail && idRole && storedUserId) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setUserRole(idRole);
      setUserId(parseInt(storedUserId, 10)); // Aseguramos que el userId sea un número
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setUserRole('');
      setUserId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1); // Ajuste para mostrar la fecha correcta
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return '#fbbf24';
      case 'completada':
        return '#22c55e';  // Verde para completado
      case 'cancelada':
        return '#ef4444';  // Rojo para cancelada
      default:
        return '#3b82f6';
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:1056/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:1056/api/orders');
      const data = await response.json();

      // Filtra los pedidos donde `id_usuario` coincide con el `userId` almacenado
      const filteredOrders = data
        .filter(order => String(order.id_usuario) === String(userId))
        .map(order => ({
          id: order.id,
          Billnumber: order.Billnumber,
          OrderDate: order.OrderDate,
          registrationDate: order.registrationDate,
          total_price: order.total_price,
          status: order.status,
          id_usuario: order.id_usuario,
          Token_Expiration: order.Token_Expiration,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          OrderDetails: order.OrderDetails.map(detail => ({
            id: detail.id,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            total_price: detail.total_price,
            id_producto: detail.id_producto,
            id_order: detail.id_order,
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt,
          })),
        }));

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar los pedidos');
    }
  };



  const handleLogin = () => {
    navigate('/login');
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
    localStorage.removeItem('userId'); // Removemos el userId al cerrar sesión
    setIsLoggedIn(false);
    setUserEmail('');
    handleMenuClose();
    toast.error('Sesión cerrada', {
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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const getUserInitial = () => {
    return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
  };

  const getProductName = (id) => {
    const selectedProduct = products.find(product => product.id === id);
    return selectedProduct ? selectedProduct.Product_Name : `Producto ${id}`;
  };

  return (
    <>
      <header className="header-index1">
        <Link to={'/'} className='d-flex align-items-center logo-index'>
          <img src={logo} alt="Logo" />
          <span className='ml-2'>Barbería Orion</span>
        </Link>
        <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
          <nav className='navBar-index'>
            <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
            <Link to='/appointmentView'>CITAS</Link>
            <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
            <Link to='/contact' onClick={() => setIsNavOpen(false)}>CONTACTO</Link>
          </nav>
          <div className="auth-buttons">
            {isLoggedIn && userEmail ? (
              <div className="user-menu">
                <Button
                  onClick={handleMenuClick}
                  className="userLoginn"
                  startIcon={
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: '#b89b58' }}>
                      {getUserInitial()}
                    </Avatar>
                  }
                >
                  {userEmail}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  {userRole === '1' || userRole === '2' ? (
                    <MenuItem onClick={handledashboard}><GrUserAdmin /> Administrar</MenuItem>
                  ) : (
                    <MenuItem><FaShoppingBag /> Carrito</MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}><GiExitDoor /> Cerrar Sesión</MenuItem>
                </Menu>
              </div>
            ) : (
              <Button variant="contained" onClick={handleLogin}>Iniciar sesión</Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mt-5">
        <h1 className="text-center mb-4" style={{ color: '#b89b58' }}>Mis Pedidos</h1>
        {isLoggedIn ? (
          <TableContainer component={Paper} className="rounded-lg shadow-lg">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Pedido</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell>{order.Billnumber}</TableCell>
                      <TableCell>{formatDate(order.OrderDate)}</TableCell>
                      <TableCell>{formatCurrency(order.total_price)}</TableCell>
                      <TableCell>
                        <span style={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.875rem'
                        }}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Producto</TableCell>
                                <TableCell>Cantidad</TableCell>
                                <TableCell>Precio Unitario</TableCell>
                                <TableCell>Precio Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.OrderDetails.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{getProductName(item.id_producto)}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                  <TableCell>{formatCurrency(item.total_price)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}

                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p className="text-center">Inicia sesión para ver tus pedidos.</p>
        )}
      </div>
    </>
  );
};

export default Ordermy;
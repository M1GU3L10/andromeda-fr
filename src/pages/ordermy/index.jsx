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

  useEffect(() => {
    checkLoginStatus();
    context.setIsHideSidebarAndHeader(true);
    context.setThemeMode(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
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
      case 'completado':
        return '#22c55e';
      case 'cancelado':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:1056/api/orders');
      const data = await response.json();
      setOrders(data);
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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const getUserInitial = () => {
    return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
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
                    <MenuItem>Carrito</MenuItem>
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

      <div className="container mt-4">
        <h1>Mis Pedidos</h1>
        {isLoggedIn ? (
          <>
            <p>Bienvenido, {userEmail}</p>
            <TableContainer component={Paper}>
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
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            variant="text"
                          >
                            {expandedOrder === order.id ? 'Ocultar' : 'Ver detalles'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedOrder === order.id && (
                        <TableRow>
                          <TableCell colSpan={5} style={{ padding: '0' }}>
                            <div style={{ padding: '16px', backgroundColor: '#f8f9fa' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Producto ID</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Precio Unitario</TableCell>
                                    <TableCell>Total</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.OrderDetails.map((detail) => (
                                    <TableRow key={detail.id}>
                                      <TableCell>{detail.id_producto}</TableCell>
                                      <TableCell>{detail.quantity}</TableCell>
                                      <TableCell>{formatCurrency(detail.unitPrice)}</TableCell>
                                      <TableCell>{formatCurrency(detail.total_price)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <p>Por favor, inicia sesión para ver tus pedidos.</p>
        )}
      </div>
    </>
  );
};

export default Ordermy;
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../App.js';
import logo from '../../../assets/images/logo-light.png';
import { Avatar, Menu, MenuItem, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import { GrUser } from 'react-icons/gr';


const Header = ({ scrollToServices, scrollToContact }) => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        context.setThemeMode(false);
        checkLoginStatus();
    }, [context]);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const storedEmail = localStorage.getItem('userName');
        const idRole = localStorage.getItem('roleId');
        if (token && storedEmail && idRole) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
            setUserRole(idRole);
        } else {
            setIsLoggedIn(false);
            setUserEmail('');
            setUserRole('');
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
        <header className={`header-index ${isScrolled ? 'abajo' : ''}`}>
            <Link to={'/'} className='d-flex align-items-center logo-index'>
                <img src={logo} alt="Logo" />
                <span className='ml-2'>Barberia Orion</span>
            </Link>
            <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
                <nav className='navBar-index'>
                    <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
                    <Link to='#' onClick={scrollToServices}>SERVICIOS</Link>
                    {
                        userRole == 3 && (<Link to='/appointmentView'>CITAS</Link>)
                    }
                    <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
                    <Link to='#' onClick={scrollToContact}>CONTACTO</Link>
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
                                            backgroundColor: '#b89b58'
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
                                    <MenuItem onClick={handledashboard} className='menu-item-landingPage'>
                                        <GrUserAdmin /> Administrar
                                    </MenuItem>
                                ) : (
                                    <MenuItem></MenuItem>
                                )}
                                  <MenuItem component={Link} to='/profileview' onClick={() => setIsNavOpen(false)} className='menu-item-landingPage'>
                                    <GrUser /> Mi perfil
                                </MenuItem>
                                <MenuItem onClick={handleLogout} className='menu-item-landingPage'>
                                    <GiExitDoor /> Cerrar Sesión
                                </MenuItem>
                                {/* Usamos MenuItem para mantener el mismo estilo */}
                              
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
        </header>
    );
};

export default Header;

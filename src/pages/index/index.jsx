import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';
import { Avatar, Menu, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ServicesSection from './SectionServices';
import ProductSection from './SectionProducts';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";

const Index = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const servicesRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        context.setThemeMode(false)
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

    // const getRandomColor = () => {
    //     const letters = '0123456789ABCDEF';
    //     let color = '#';
    //     for (let i = 0; i < 6; i++) {
    //         color += letters[Math.floor(Math.random() * 16)];
    //     }
    //     return color;
    // };

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

    const scrollToServices = () => {
        if (servicesRef.current) {
            servicesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <header className={`header-index ${isScrolled ? 'abajo' : ''}`}>
                <Link to={'/'} className='d-flex align-items-center logo-index'>
                    <img src={logo} alt="Logo" />
                    <span className='ml-2'>Barberia Orion</span>
                </Link>
                <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
                    <nav className='navBar-index'>
                        <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
                        <Link to='#' onClick={scrollToServices}>SERVICIOS</Link>
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
            <section class="zona1">
                <div className="hero-content">
                    <h1>
                        Sólo los mejores barberos
                    </h1>
                    <p>
                        La barbería es el lugar donde puedes conseguir un corte de pelo de alta calidad de barberos certificados, que no sólo son profesionales, sino también maestros con talento.
                    </p>
                    <Button
                        variant="outlined"
                        className="read-more-btn"
                    >
                        VER MAS
                    </Button>
                </div>

            </section>

            <section ref={servicesRef}> 
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 className='tittle-landingPage'>Nuestros servicios</h2>
                </div>
                <p className='description-landingPage'>En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.</p>
                <div className='w-100 section-services'>
                    <ServicesSection />
                </div>
            </section>

            <section className='section-products'>
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 className='tittle-landingPage'>Nuestros Mejores Productos</h2>
                </div>
                <p className='description-landingPage White'>En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.</p>
                <div className='w-100'>
                    <ProductSection />
                </div>
            </section>
        </>
    );
};

export default Index;
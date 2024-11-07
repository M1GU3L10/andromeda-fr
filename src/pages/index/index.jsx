import React, { useRef } from 'react';
import Header from './Header';
import ServicesSection from './SectionServices';
import ProductSection from './SectionProducts';
import SectionFooter from './SectionFooter';
import Button from '@mui/material/Button';


const Index = () => {
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
            <Header scrollToServices={scrollToServices} />
            <section className="zona1">
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
            <SectionFooter />
        </>
    );
};

export default Index;

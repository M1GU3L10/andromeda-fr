import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';


const Index = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, [context]);

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <>
            <header className="header-index">
                <div className="header-content">
                    <Link to={'/'} className='d-flex align-items-center logo-index'>
                        <img src={logo}></img>
                        <span className='ml-2'>Barberia Orion</span>
                    </Link>
                    <nav className='navBar-index'>
                        <Link to='/index'>INICIO</Link>
                        <Link to='/services'>SERVICIOS</Link>
                        <Link to='/blog'>CITAS</Link>
                        <Link to='/Shop'>PRODUCTOS</Link>
                        <Link to='/contact'>CONTACTO</Link>
                    </nav>
                    <Button
                        variant="contained"
                        className="book-now-btn"
                        onClick={handleLogin}
                    >
                        INICIAR SESION
                    </Button>
                </div>
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
            </header>
        </>
    );
};

export default Index;
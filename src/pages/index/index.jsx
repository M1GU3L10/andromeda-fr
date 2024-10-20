import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';

const Index = () => {
    const context = useContext(MyContext);
    
    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, [context]);
    
    return (
        <>
            <header className="header-index">
                <Link to='/' className='logo-index'>
                    <img src={logo} alt="Logo Barberia Orion" />
                    <span>Barberia Orion</span>
                </Link>
                <nav className='navBar-index'>
                    <Link className='dos' to='/'>Inicio</Link>
                    <Link to='/servicios'>Servicios</Link>
                    <Link className='dos' to='/productos'>Productos</Link>
                    <Link to='/contacto'>Contactenos</Link>
                </nav>
                <Button variant="contained">LOGIN</Button>
            </header>
        </>
    );
};

export default Index;
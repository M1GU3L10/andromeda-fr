import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';
import headerBg from '../../assets/images/h1_hero.png'; // Asegúrate de tener una imagen similar

const Index = () => {
    const context = useContext(MyContext);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, [context]);

    return (
        <>
            <header className="header-index">
                <div className="header-content">
                    <Link to={'/'} className='d-flex align-items-center logo'>
                        <img src={logo}></img>
                        <span className='ml-2'>Barberia Orion</span>
                    </Link>
                    <nav className='navBar-index'>
                        <Link to='/'>HOME</Link>
                        <Link to='/about'>ABOUT</Link>
                        <Link to='/services'>SERVICES</Link>
                        <Link to='/blog'>BLOG</Link>
                        <Link to='/shop'>SHOP</Link>
                        <Link to='/contact'>CONTACTS</Link>
                    </nav>
                    <Button
                        variant="contained"
                        className="book-now-btn"
                    >
                        LOGIN
                    </Button>
                </div>
                <div className="hero-content">
                    <h1>Only Top Barbers</h1>
                    <p>Barbershop is the place where you can get a high-quality haircut from certified barbers, who are not just professionals but also talented masters.</p>
                    <Button
                        variant="outlined"
                        className="read-more-btn"
                    >
                        READ MORE
                    </Button>
                </div>
            </header>
        </>
    );
};

export default Index;
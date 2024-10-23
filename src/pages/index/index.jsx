import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';

const Index = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleAdministrar = () => {
        context.setIsHideSidebarAndHeader(false);
        navigate('/sales');
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        context.setIsLogin(false);
        navigate('/login');
    };

    return (
        <>
            <header className="header-index">
                <div className="header-content d-flex align-items-center justify-content-between">
                    <Link to={'/'} className='d-flex align-items-center logo-index'>
                        <img src={logo} alt="Barberia Orion Logo" />
                        <span className='ml-2'>Barberia Orion</span>
                    </Link>
                    <nav className='navBar-index'>
                        <Link to='/index'>INICIO</Link>
                        <Link to='/services'>SERVICIOS</Link>
                        <Link to='/appointment'>CITAS</Link>
                        <Link to='/shop'>PRODUCTOS</Link>
                        <Link to='/index'>CONTACTO</Link>
                        <Button
                            variant="text"
                            className="administrar-btn"
                            onClick={handleAdministrar}
                        >
                            ADMINISTRAR
                        </Button>
                    </nav>
                    <div className='MyAccWrapper d-flex align-items-center'>
                        {context.isLogin ? (
                            <div className='d-flex align-items-center'>
                                <Button className='MyAcc' onClick={handleClick}>
                                    <Avatar
                                        alt="User Avatar"
                                        src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
                                    />
                                </Button>
                                <div className='userInfo' style={{ marginLeft: '8px' }}>
                                    <span style={{ color: 'white' }}>{context.userName}</span>
                                </div>
                            </div>
                        ) : (
                            <Button variant="contained" className="book-now-btn" onClick={handleLogin}>
                                INICIAR SESIÓN
                            </Button>
                        )}
                        <Menu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {context.isLogin && (
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Cerrar sesión
                                </MenuItem>
                            )}
                        </Menu>
                    </div>
                </div>
                <div className="hero-content text-center">
                    <h1>Sólo los mejores barberos</h1>
                    <p>
                        La barbería es el lugar donde puedes conseguir un corte de pelo de alta calidad de barberos certificados, que no sólo son profesionales, sino también maestros con talento.
                    </p>
                    <Button
                        variant="outlined"
                        className="read-more-btn"
                    >
                        VER MÁS
                    </Button>
                </div>
            </header>
        </>
    );
};

export default Index;

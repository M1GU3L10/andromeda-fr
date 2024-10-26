import React, { useContext, useState } from 'react';
import logo from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate agregado para redirigir
import Button from '@mui/material/Button';
import { MdMenuOpen } from 'react-icons/md';
import { MdOutlineMenu } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { BsShieldFillExclamation } from "react-icons/bs";
import Logout from '@mui/icons-material/Logout';
import { MyContext } from '../../App';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const context = useContext(MyContext);
    const navigate = useNavigate();  // Hook para redirigir

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        // Elimina el token del almacenamiento local
        localStorage.removeItem('jwtToken');
        
        // Actualiza el estado de login en el contexto
        context.setIsLogin(false);

        // Redirige al login
        navigate('/login');
    };

    // Función para redirigir al inicio
    const handleGoToHome = () => {
        navigate('/index');
    };

    return (
        <>
            <header className="d-flex align-items-center">
                <div className="container-fluid w-100">
                    <div className='row d-flex align-items-center'>
                        {/* Logo wropper */}
                        <div className="col-sm-2 parte1">
                            <Link to={'/'} className='d-flex align-items-center logo'>
                                <img src={logo} alt="Barberia Orion Logo" />
                                <span className='ml-2'>Barberia Orion</span>
                            </Link>
                        </div>
                        <div className="col-sm-3 d-flex align-items-center parte2">
                            <Button className='rounded-circle mr-3' onClick={() => {
                                const newValue = !context.isToggleSidebar;
                                context.setIsToggleSidebar(newValue);
                                if (context.onSidebarToggle) {
                                    context.onSidebarToggle(newValue); // Notifica a Programming sobre el cambio
                                }
                            }}>
                                {
                                    context.isToggleSidebar === false ? <MdMenuOpen /> : <MdOutlineMenu />
                                }
                            </Button>
                        </div>
                        <div className="col-sm-7 d-flex align-items-center justify-content-end parte3">
                            <Button className='rounded-circle mr-3' onClick={() => context.setThemeMode(!context.themeMode)}>
                                <MdOutlineLightMode />
                            </Button>
                            <div className='MyAccWrapper'>
                                <Button className='MyAcc d-flex align-items-center' onClick={handleClick}>
                                    <div className='ImgUser'>
                                        <span className='rounded-circle'>
                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' alt="User Avatar" />
                                        </span>
                                    </div>
                                    <div className='userInfo'>
                                        <h5>Migue Perez</h5>
                                        <p className='mb-0'>
                                            Administrador
                                        </p>
                                    </div>
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={open}
                                    onClose={handleClose}
                                    onClick={handleClose}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={handleClose}>
                                        <ListItemIcon>
                                            <PersonAdd fontSize="small" />
                                        </ListItemIcon>
                                        Mi cuenta
                                    </MenuItem>
                                    <MenuItem onClick={handleGoToHome}> {/* Usar handleGoToHome para redirigir */}
                                        <ListItemIcon>
                                            <BsShieldFillExclamation />
                                        </ListItemIcon>
                                        Volver al inicio
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <Logout fontSize="small" />
                                        </ListItemIcon>
                                        Cerrar sesion
                                    </MenuItem>
                                </Menu>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header;

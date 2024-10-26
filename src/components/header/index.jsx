import React, { useContext, useState } from 'react';
import logo from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { MdMenuOpen, MdOutlineMenu, MdOutlineLightMode, MdOutlineMailOutline } from 'react-icons/md';
import { BsCart3, BsShieldFillExclamation } from 'react-icons/bs';
import { LuBell } from 'react-icons/lu';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import { MyContext } from '../../App';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const context = useContext(MyContext);
    const navigate = useNavigate();

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

    const handleGoToHome = () => {
        navigate('/index');
    };

    return (
        <>
            <header className="d-flex align-items-center">
                <div className="container-fluid w-100">
                    <div className='row d-flex align-items-center'>
                        <div className="col-sm-2 parte1">
                            <Link to={'/'} className='d-flex align-items-center logo'>
                                <img src={logo} alt="Barberia Orion Logo" />
                                <span className='ml-2'>Barberia Orion</span>
                            </Link>
                        </div>
                        <div className="col-sm-3 d-flex align-items-center parte2">
                            <Button 
                                className='rounded-circle mr-3' 
                                onClick={() => {
                                    const newValue = !context.isToggleSidebar;
                                    context.setIsToggleSidebar(newValue);
                                    if (context.onSidebarToggle) {
                                        context.onSidebarToggle(newValue);
                                    }
                                }}
                            >
                                {context.isToggleSidebar ? <MdOutlineMenu /> : <MdMenuOpen />}
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
                                        {context.isLogin ? (
                                            <>
                                                <h5>{context.userName}</h5>
                                                <p className='mb-0'>Administrador</p>
                                            </>
                                        ) : (
                                            <p className='mb-0'>No está logueado</p>
                                        )}
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
                                    <MenuItem onClick={handleGoToHome}>
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
    );
};

export default Header;
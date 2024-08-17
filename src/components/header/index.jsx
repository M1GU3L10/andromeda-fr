import React, { useContext, useState } from 'react';
import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { MdMenuOpen } from 'react-icons/md';
import { MdOutlineMenu } from "react-icons/md";
import SearchBox from '../SearchBox';
import { MdOutlineLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import { BsCart3 } from "react-icons/bs";
import { MdOutlineMailOutline } from "react-icons/md";
import { LuBell } from "react-icons/lu";
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { BsShieldFillExclamation } from "react-icons/bs";
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import { MyContext } from '../../App';



const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openNotifications, setopenNotifications] = useState(false);
    const open = Boolean(anchorEl);
    const openNoti = Boolean(openNotifications);

    const context = useContext(MyContext);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenNotifications = () => {
        setopenNotifications(true)
    };
    const handleCloseNotifications = () => {
        setopenNotifications(false)
    };

    return (
        <>
            <header className="d-flex align-items-center">
                <div className="container-fluid w-100">
                    <div className='row d-flex align-items-center'>
                        {/* Logo wropper */}
                        <div className="col-sm-2 parte1">
                            <Link to={'/'} className='d-flex align-items-center logo'>
                                <img src={logo}></img>
                                <span className='ml-2'>Barberia orion</span>
                            </Link>

                        </div>
                        <div className="col-sm-3 d-flex align-items-center parte2">
                            <Button className='rounded-circle mr-3' onClick={() => context.setIsToggleSidebar(!context.isToggleSidebar)}>
                                {
                                    context.isToggleSidebar === false ? <MdMenuOpen /> : <MdOutlineMenu />
                                }
                            </Button>
                            <SearchBox />
                        </div>
                        <div className="col-sm-7 d-flex align-items-center justify-content-end parte3">
                            <Button className='rounded-circle mr-3' onClick={() => context.setThemeMode(!context.themeMode)}>
                                <MdOutlineLightMode />
                            </Button>
                            <Button className='rounded-circle mr-3'>
                                <BsCart3 />
                            </Button>
                            <Button className='rounded-circle mr-3'>
                                <MdOutlineMailOutline />
                            </Button>
                            <div className='dropdownWrapper'>
                                <Button className='rounded-circle mr-3' onClick={handleOpenNotifications}>
                                    <LuBell />
                                </Button>
                                <Menu
                                    anchorEl={openNotifications}
                                    className='notifications dropdown_list'
                                    id="notifications"
                                    open={openNoti}
                                    onClose={handleCloseNotifications}
                                    onClick={handleCloseNotifications}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <div className='head pl-2'>
                                        <h4>Notifications (2)</h4>
                                    </div>
                                    <Divider className='pb-2' />

                                    <div className='scrollbar'>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <div className='d-flex align-items-center'>
                                                <div>
                                                    <div className='ImgUser'>
                                                        <span className='rounded-circle'>
                                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='info'>
                                                    <h4><span><b>Miguel perez</b>Se acaba de registrar</span></h4>
                                                </div>

                                            </div>

                                        </MenuItem>
                                    </div>

                                    <div className='btn-content'>
                                        <Button className='btn-blue w-100'>Ver tabla usuarios</Button>
                                    </div>
                                </Menu>
                            </div>

                            <div className='MyAccWrapper'>
                                <Button className='MyAcc d-flex align-items-center' onClick={handleClick}>
                                    <div className='ImgUser'>
                                        <span className='rounded-circle'>
                                            <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'></img>
                                        </span>
                                    </div>

                                    <div className='userInfo'>
                                        <h5>Migue perez</h5>
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
                                        My account
                                    </MenuItem>
                                    <MenuItem onClick={handleClose}>
                                        <ListItemIcon>
                                            <BsShieldFillExclamation />
                                        </ListItemIcon>
                                        Reset password
                                    </MenuItem>
                                    <MenuItem onClick={handleClose}>
                                        <ListItemIcon>
                                            <Logout fontSize="small" />
                                        </ListItemIcon>
                                        Logout
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

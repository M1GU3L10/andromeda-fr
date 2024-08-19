import { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaAngleRight } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoCart } from "react-icons/io5";
import { RxScissors } from "react-icons/rx";
import { FaMoneyBillWave } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { FaCircleUser } from "react-icons/fa6";
import { GiExitDoor } from "react-icons/gi";
import { MyContext } from '../../App';


const Sidebar = () => {

    const [activeTab, setActiveTab] = useState(0);
    const [isToggleSubmenu, setisToggleSubmenu] = useState(false);

    const context = useContext(MyContext);

    const isOpensubMenu = (index) => {
        setActiveTab(index)
        setisToggleSubmenu(!isToggleSubmenu)
    }

    return (
        <>
            <div className="sidebar">
                <ul>
                    <li>
                        <Link to="/">
                            <Button className={`w-100 ${activeTab === 0 ? 'active' : ''}`} onClick={() => isOpensubMenu(0)}>
                                <span className='icon'><TbLayoutDashboardFilled />
                                </span><span className='sidebar-option'>Dashboard</span>
                                <span className='arrow'>
                                </span>
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/">
                            <Button className={`w-100 ${activeTab === 1 ? 'active' : ''}`} onClick={() => isOpensubMenu(1)}>
                                <span className='icon'><FaCircleUser />
                                </span><span className='sidebar-option'>Mi perfil</span>
                                <span className='arrow'>
                                </span>
                            </Button>
                        </Link>
                    </li>
                    <li>

                        <Button className={`w-100 ${activeTab === 2 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpensubMenu(2)}>
                            <span className='icon'><IoMdSettings />
                            </span><span className='sidebar-option'>Configuración</span>
                            <span className='arrow'><FaAngleRight />
                            </span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 2 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li>
                                    <Link to="/roles">
                                        Roles
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li>

                        <Button className={`w-100 ${activeTab === 3 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpensubMenu(3)}>
                            <span className='icon'><FaUser />
                            </span><span className='sidebar-option'>Usuarios</span>
                            <span className='arrow'><FaAngleRight />
                            </span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 3 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li>
                                    <Link to="/users">
                                        Usuarios
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/ausencias">
                                        Ausencias
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li>

                        <Button className={`w-100 ${activeTab === 4 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpensubMenu(4)}>
                            <span className='icon'><IoCart />
                            </span><span className='sidebar-option'>Ingresos</span>
                            <span className='arrow'><FaAngleRight />
                            </span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 4 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li>
                                    <Link to="/categories">
                                        Categorias
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/products">
                                        Productos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/suppliers">
                                        Proveedores
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shopping">
                                        Compras
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li>

                        <Button className={`w-100 ${activeTab === 5 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpensubMenu(5)}>
                            <span className='icon'><RxScissors />
                            </span><span className='sidebar-option'>Servicios</span>
                            <span className='arrow'><FaAngleRight />
                            </span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 5 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li>
                                    <Link to="/services">
                                        Servicios
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/programming">
                                        Programacion empleados
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li>

                        <Button className={`w-100 ${activeTab === 6 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpensubMenu(6)}>
                            <span className='icon'><FaMoneyBillWave />
                            </span><span className='sidebar-option'>Salidas</span>
                            <span className='arrow'><FaAngleRight />
                            </span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 6 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li>
                                    <Link to="/appointment">
                                        Citas
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/orders">
                                        Pedidos
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/sales">
                                        Ventas
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
                <div className='logoutWrapper'>
                    <div className='logoutBox'>
                        <Button variant="contained"><GiExitDoor/>Logout</Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar;
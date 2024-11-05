import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaAngleRight } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoCart } from "react-icons/io5";
import { RxScissors } from "react-icons/rx";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { GiExitDoor } from "react-icons/gi";
import { MyContext } from '../../App';
import { usePermissions } from '../PermissionCheck';

const Sidebar = () => {
  console.log('Rendering Sidebar');
  const [activeTab, setActiveTab] = useState(0);
  const [isToggleSubmenu, setisToggleSubmenu] = useState(false);
  const context = useContext(MyContext);
  const permissions = usePermissions();
  const navigate = useNavigate();

  const isOpensubMenu = (index) => {
    setActiveTab(index);
    setisToggleSubmenu(!isToggleSubmenu);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('roleId');
    context.setIsLogin(false);
    context.setIsHideSidebarAndHeader(true);
    navigate('/login');
  };

  return (
    <>
      <div className="sidebar">
        <ul>
          {
            hasPermission('Dashboard') && (
              <li>
                <Link to="/dashboard">
                  <Button className={`w-100 ${activeTab === 0 ? 'active' : ''}`} onClick={() => isOpensubMenu(0)}>
                    <span className='icon'><TbLayoutDashboardFilled /></span>
                    <span className='sidebar-option'>Panel de control</span>
                    <span className='arrow'></span>
                  </Button>
                </Link>
              </li>
            )
          }
          {
            hasPermission('Dashboard') && (
              <li>
              <Link to="/">
                <Button className={`w-100 ${activeTab === 1 ? 'active' : ''}`} onClick={() => isOpensubMenu(1)}>
                  <span className='icon'><FaCircleUser /></span>
                  <span className='sidebar-option'>Mi perfil</span>
                  <span className='arrow'></span>
                </Button>
              </Link>
            </li>
            )
          }
          {hasPermission('Roles') && (
            <li>
              <Button className={`w-100 ${activeTab === 2 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(2)}>
                <span className='icon'><IoMdSettings /></span>
                <span className='sidebar-option'>Configuración</span>
                <span className='arrow'><FaAngleRight /></span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 2 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  <li>
                    <Link to="/roles">Roles</Link>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {hasPermission('Usuarios') && (
            <li>
              <Button className={`w-100 ${activeTab === 3 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(3)}>
                <span className='icon'><FaUser /></span>
                <span className='sidebar-option'>Usuarios</span>
                <span className='arrow'><FaAngleRight /></span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 3 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  <li>
                    <Link to="/users">Usuarios</Link>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {(hasPermission('Categorias') || hasPermission('Productos') || hasPermission('Proveedores') || hasPermission('Compras')) && (
            <li>
              <Button className={`w-100 ${activeTab === 4 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(4)}>
                <span className='icon'><IoCart /></span>
                <span className='sidebar-option'>Ingresos</span>
                <span className='arrow'><FaAngleRight /></span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 4 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  {hasPermission('Categorias') && (
                    <li>
                      <Link to="/categories">Categorías</Link>
                    </li>
                  )}
                  {hasPermission('Productos') && (
                    <li>
                      <Link to="/products">Productos</Link>
                    </li>
                  )}
                  {hasPermission('Proveedores') && (
                    <li>
                      <Link to="/suppliers">Proveedores</Link>
                    </li>
                  )}
                  {hasPermission('Compras') && (
                    <li>
                      <Link to="/shopping">Compras</Link>
                    </li>
                  )}
                </ul>
              </div>
            </li>
          )}
          {(hasPermission('Servicios') || hasPermission('Programacion de empleado') || hasPermission('Ausencias')) && (
            <li>
              <Button className={`w-100 ${activeTab === 5 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(5)}>
                <span className='icon'><RxScissors /></span>
                <span className='sidebar-option'>Servicios</span>
                <span className='arrow'><FaAngleRight /></span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 5 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  {hasPermission('Servicios') && (
                    <li>
                      <Link to="/services">Servicios</Link>
                    </li>
                  )}
                  {hasPermission('Programacion de empleado') && (
                    <li>
                      <Link to="/programming">Programacion empleados</Link>
                    </li>
                  )}
                  {hasPermission('Ausencias') && (
                    <li>
                      <Link to="/absences">Ausencias</Link>
                    </li>
                  )}
                </ul>
              </div>
            </li>
          )}
          {(hasPermission('Citas') || hasPermission('Pedidos') || hasPermission('Ventas')) && (
            <li>
              <Button className={`w-100 ${activeTab === 6 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(6)}>
                <span className='icon'><FaMoneyBillWave /></span>
                <span className='sidebar-option'>Salidas</span>
                <span className='arrow'><FaAngleRight /></span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 6 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  {hasPermission('Citas') && (
                    <li>
                      <Link to="/appointment">Citas</Link>

                    </li>

                  )}
                  {hasPermission('Pedidos') && (
                    <li>
                      <Link to="/orders">Pedidos</Link>
                    </li>
                  )}
                  {hasPermission('Ventas') && (
                    <li>
                      <Link to="/sales">Ventas</Link>
                    </li>
                  )}
                </ul>
              </div>
            </li>
          )}
        </ul>
        <div className='logoutWrapper'>
          <div className='logoutBox'>
            <Button variant="contained" className='btn-golden' onClick={handleLogout}><GiExitDoor />Cerrar sesión</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
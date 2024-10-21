import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import './index.css';
import Dashboard from './pages/Dashboard';
import Header from './components/header';
import Sidebar from './components/sidebar';
import Categories from './pages/categories';
import Appointment from './pages/appointment';
import Orders from './pages/orders';
import Products from './pages/products';
import Programming from './pages/programming';
import Sales from './pages/sales';
import ServicesView from './pages/servicesView';
import Shopping from './pages/shopping';
import Suppliers from './pages/suppliers';
import Users from './pages/users';
import Roles from './pages/roles';
import Absences from './pages/absences';
import RegisterSales from './pages/sales/registerSales';
import RegisterShopping from './pages/shopping/registerShopping';
import ViewShopping from './pages/shopping/viewShopping';
import RegisterAppointment from './pages/appointment/registerAppointment';
import UpdateAppointment from './pages/appointment/updateAppointment';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PermissionProvider, PermissionCheck } from './components/PermissionCheck';
import Index from './pages/index';


export const MyContext = createContext();


function App() {
  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [themeMode, setThemeMode] = useState('true');
  const [isLogin, setIsLogin] = useState(false);
  const [isHideSidebarAndHeader, setIsHideSidebarAndHeader] = useState(false);


  useEffect(() => {
    if (themeMode === true) {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('themeMode', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('themeMode', 'light');
    }
  }, [themeMode]);


  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    themeMode,
    setThemeMode,
    setIsLogin,
    isLogin,
    setIsHideSidebarAndHeader,
    isHideSidebarAndHeader
  };


  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <PermissionProvider>
          {isHideSidebarAndHeader !== true && <Header />}
          <div className='main d-flex'>
            {isHideSidebarAndHeader !== true && (
              <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''}`}>
                <Sidebar />
              </div>
            )}
            <div className={`content ${isHideSidebarAndHeader === true && 'full'} ${isToggleSidebar === true ? 'toggle' : ''}`}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/index" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotPassword" element={<ForgotPassword />} />
                <Route path="/resetPassword" element={<ResetPassword />} />
                <Route path="/" element={<Navigate to="/index" replace />} />
                <Route path="/dashboard" element={
                  <PermissionCheck requiredPermission="Dashboard">
                    <Dashboard />
                  </PermissionCheck>
                } />
                <Route path="/categories" element={
                  <PermissionCheck requiredPermission="Categorias">
                    <Categories />
                  </PermissionCheck>
                } />
                <Route path="/appointment" element={
                  <PermissionCheck requiredPermission="Citas">
                    <Appointment />
                  </PermissionCheck>
                } />
                <Route path="/appointmentRegister" element={
                  <PermissionCheck requiredPermission="Citas">
                    <RegisterAppointment />
                  </PermissionCheck>
                } />
                <Route path="/appointmentUpdate/:appointmentId" element={
                  <PermissionCheck requiredPermission="Citas">
                    <UpdateAppointment />
                  </PermissionCheck>
                } />
                <Route path="/orders" element={
                  <PermissionCheck requiredPermission="Pedidos">
                    <Orders />
                  </PermissionCheck>
                } />
                <Route path="/products" element={
                  <PermissionCheck requiredPermission="Productos">
                    <Products />
                  </PermissionCheck>
                } />
                <Route path="/programming" element={
                  <PermissionCheck requiredPermission="Programacion de empleado">
                    <Programming />
                  </PermissionCheck>
                } />
                <Route path="/sales" element={
                  <PermissionCheck requiredPermission="Ventas">
                    <Sales />
                  </PermissionCheck>
                } />
                <Route path="/registerSales" element={
                  <PermissionCheck requiredPermission="Ventas">
                    <RegisterSales />
                  </PermissionCheck>
                } />
                <Route path="/services" element={
                  <PermissionCheck requiredPermission="Servicios">
                    <ServicesView />
                  </PermissionCheck>
                } />
                <Route path="/shopping" element={
                  <PermissionCheck requiredPermission="Compras">
                    <Shopping />
                  </PermissionCheck>
                } />
                <Route path="/registerShopping" element={
                  <PermissionCheck requiredPermission="Compras">
                    <RegisterShopping />
                  </PermissionCheck>
                } />
                <Route path="/viewShopping/:shoppingId" element={
                  <PermissionCheck requiredPermission="Compras">
                    <ViewShopping />
                  </PermissionCheck>
                } />
                <Route path="/suppliers" element={
                  <PermissionCheck requiredPermission="Proveedores">
                    <Suppliers />
                  </PermissionCheck>
                } />
                <Route path="/users" element={
                  <PermissionCheck requiredPermission="Usuarios">
                    <Users />
                  </PermissionCheck>
                } />
                <Route path="/roles" element={
                  <PermissionCheck requiredPermission="Roles">
                    <Roles />
                  </PermissionCheck>
                } />
                <Route path="/absences" element={
                  <PermissionCheck requiredPermission="Ausencias">
                    <Absences />
                  </PermissionCheck>
                } />
              </Routes>
            </div>
          </div>
          <ToastContainer />
        </PermissionProvider>
      </MyContext.Provider>
    </BrowserRouter>
  );
}


export default App;

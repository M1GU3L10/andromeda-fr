import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import Dashboard from './pages/Dashboard';
import Header from './components/header';
import Sidebar from './components/sidebar';
import { createContext, useEffect, useState } from 'react';
import Categories from './pages/categories';
import Appointment from './pages/appointment';
import Orders from './pages/orders';
import Products from './pages/products';
import Programming from './pages/programming';
import Sales from './pages/sales';
import Services from './pages/servicesView';
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
import ProtectedRoute from './components/protected';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const MyContext = createContext();

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
        {
          isHideSidebarAndHeader !== true &&
          <Header />
        }
        <div className='main d-flex'>
          {
            isHideSidebarAndHeader !== true &&
            <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''}`}>
              <Sidebar />
            </div>
          }
          <div className={`content ${isHideSidebarAndHeader == true && 'full'} ${isToggleSidebar === true ? 'toggle' : ''}`}>
            <Routes>
          
              <Route path="/login" exact={true} element={<Login />} />
              <Route path="/register" exact={true} element={<Register />} />
              <Route path="/forgotPassword" exact={true} element={< ForgotPassword />} />
              <Route path="/resetPassword" exact={true} element={<ResetPassword />} />
              <Route path="/" exact={true} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" exact={true} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/categories" exact={true} element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/appointment" exact={true} element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
              <Route path="/appointmentRegister" exact={true} element={<ProtectedRoute><RegisterAppointment /></ProtectedRoute>} />
              <Route path="/appointmentUpdate/:appointmentId" element={<ProtectedRoute><UpdateAppointment /></ProtectedRoute>} />
              <Route path="/orders" exact={true} element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/products" exact={true} element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/programming" exact={true} element={<ProtectedRoute><Programming /></ProtectedRoute>} />
              <Route path="/sales" exact={true} element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path="/salesRegister" exact={true} element={<ProtectedRoute><RegisterSales /></ProtectedRoute>} />
              <Route path="/services" exact={true} element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="/shopping" exact={true} element={<ProtectedRoute><Shopping /></ProtectedRoute>} />
              <Route path="/shoppingRegister" exact={true} element={<ProtectedRoute><RegisterShopping /></ProtectedRoute>} />
              <Route path="/ViewShopping/:shoppingId" element={<ProtectedRoute><ViewShopping /></ProtectedRoute>} />
              <Route path="/suppliers" exact={true} element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
              <Route path="/users" exact={true} element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/roles" exact={true} element={<ProtectedRoute><Roles /></ProtectedRoute>} />
              <Route path="/absences" exact={true} element={<ProtectedRoute><Absences /></ProtectedRoute>} />

            </Routes>
          </div>
        </div>
        <ToastContainer />
      </MyContext.Provider>
    </BrowserRouter>
  );
}


export default App;
export { MyContext };

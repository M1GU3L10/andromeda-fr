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
import Login from './auth/login';
import Absences from './pages/absences';
import RegisterSales from './pages/sales/registerSales';
import RegisterShopping from './pages/shopping/registerShopping';


const MyContext = createContext();

function App() {
  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [themeMode, setThemeMode] = useState('true');

  const [isLogin, setIsLogin] = useState(false);

  


  useEffect(() => {
    if (themeMode === true) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('themeMode', 'light');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('themeMode', 'dark');
    }
  }, [themeMode]);

  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    themeMode,
    setThemeMode,
    isLogin,
    setIsLogin
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>

        

        <Header />
        <div className='main d-flex'>
          <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''}`}>
            <Sidebar />
          </div>
          <div className={`content ${isToggleSidebar === true ? 'toggle' : ''}`}>
            <Routes>
              <Route path="/" exact={true} element={<Dashboard />} />
              <Route path="/dashboard" exact={true} element={<Dashboard />} />
              <Route path="/categories" exact={true} element={<Categories />} />
              <Route path="/appointment" exact={true} element={<Appointment />} />
              <Route path="/orders" exact={true} element={<Orders />} />
              <Route path="/products" exact={true} element={<Products />} />
              <Route path="/programming" exact={true} element={<Programming />} />
              <Route path="/sales" exact={true} element={<Sales />} />
              <Route path="/salesRegister" exact={true} element={<RegisterSales />} />
              <Route path="/services" exact={true} element={<Services />} />
              <Route path="/shopping" exact={true} element={<Shopping />} />
              <Route path="/shoppingRegister" exact={true} element={<RegisterShopping />} />
              <Route path="/suppliers" exact={true} element={<Suppliers />} />
              <Route path="/users" exact={true} element={<Users />} />
              <Route path="/roles" exact={true} element={<Roles />} />
              <Route path="/absences" exact={true} element={<Absences />} />
            </Routes>
          </div>
        </div>

      </MyContext.Provider>
    </BrowserRouter>
  );
}


export default App;
export { MyContext };

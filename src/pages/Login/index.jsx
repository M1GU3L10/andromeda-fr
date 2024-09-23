import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Para redirigir al usuario
import axios from 'axios';  // Para hacer las solicitudes a la API
import Logo from '../../assets/images/logo.png'
import { MyContext } from '../../App';
import patern from '../../assets/images/pattern.webp';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { Button, Link } from '@mui/material';
import { FcGoogle } from "react-icons/fc";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {

    const context = useContext(MyContext);
    const navigate = useNavigate();  // Hook para redirigir
    const [inputIndex, setInputIndex] = useState(null)
    const [isShowPassword, setIsShowPassword] = useState(false)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, []);

    const focusInput = (index) => {
        setInputIndex(index);
    }

    const validateEmail = (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    };

    const validatePassword = (value) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    };

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        setEmailError(validateEmail(emailValue));
    };

    const handlePasswordChange = (e) => {
        const passwordValue = e.target.value;
        setPassword(passwordValue);
        setPasswordError(validatePassword(passwordValue));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:1056/api/users/login', {
                email,
                password
            });

            // Si la autenticación es exitosa, guarda el token y redirige
            const { token } = response.data;

            if (token) {
                localStorage.setItem('jwtToken', token);  // Guarda el token en localStorage
                navigate('/dashboard');  // Redirige al usuario a la raíz del proyecto
                context.setIsHideSidebarAndHeader(false);
            }
        } catch (error) {
            toast.error('Correo o contraseña incorrectos.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            }); 
        }
    };
    const handleRegister = () => {
        // Aquí puedes agregar la lógica para autenticar con Google o simplemente redirigir
        navigate('/register');  // Cambia '/ruta-de-google' por la ruta que quieras
    };
    const handleReestablish = () => {
        // Aquí puedes agregar la lógica para autenticar con Google o simplemente redirigir
        navigate('/forgotPassword');  // Cambia '/ruta-de-google' por la ruta que quieras
    };

    return (
        <>
            <img src={patern} className='loginPatern' />
            <section className="loginSection">
                <div className="loginBox text-center">
                    <div className='logo'>
                        <img src={Logo} width="60px" alt="logo" />
                        <h5 className='fw-bolder'>Ingresar a Barberia Orion</h5>
                    </div>
                    <div className='wrapper mt-3 card border p-4'>
                        <form onSubmit={handleLogin}>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 0 && 'focus'}`}>
                                <span className='icon'><MdEmail /></span>
                                <input
                                    type="email"
                                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                    placeholder='Enter your email'
                                    value={email}
                                    onChange={handleEmailChange}
                                    onFocus={() => focusInput(0)}
                                    onBlur={() => setInputIndex(null)}
                                />
                                {/* {emailError && <div className="invalid-feedback">{emailError}</div>} */}
                            </div>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 1 && 'focus'}`}>
                                <span className='icon'><RiLockPasswordFill /></span>
                                <input
                                    type={isShowPassword ? 'text' : 'password'}
                                    className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                    placeholder='Enter your password'
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onFocus={() => focusInput(1)}
                                    onBlur={() => setInputIndex(null)}
                                />
                                <span className='toggleShowPassword' onClick={() => setIsShowPassword(!isShowPassword)}>
                                    {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                </span>
                                {/* {passwordError && <div className="invalid-feedback">{passwordError}</div>} */}
                            </div>
                            <div className='form-group'>
                                <Button type="submit" className='btn-submit btn-big btn-lg w-100'>
                                    Ingresar
                                </Button>
                            </div>
                            <div className='form-group text-center mt-3 p-10'>
                                <Link onClick={handleReestablish} className='link'>
                                    ¿Olvidaste la contraseña?
                                </Link>
                            </div>
                        </form>
                    </div>
                    <div className='wrapper mt-3 card border footer p-3'>
                        <span className='text-center'>
                            ¿No estas registrado?
                            <Link className='link color' onClick={handleRegister}>
                                Registrarme
                            </Link>
                        </span>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;
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
        return regex.test(value) ? '' : 'El correo electrónico no es válido';
    };

    const validatePassword = (value) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(value) ? '' : 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
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

        // Verifica los errores antes de enviar el formulario
        if (emailError || passwordError) {
            setErrorMessage('Corrija los errores antes de enviar.');
            return;
        }

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
            }
        } catch (error) {
            setErrorMessage('Correo o contraseña incorrectos.');  // Muestra un mensaje de error
        }
    };

    const handleGoogleLogin = () => {
        // Aquí puedes agregar la lógica para autenticar con Google o simplemente redirigir
        navigate('/register');  // Cambia '/ruta-de-google' por la ruta que quieras
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
                                    required
                                />
                                {emailError && <div className="invalid-feedback">{emailError}</div>}
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
                                    required
                                />
                                <span className='toggleShowPassword' onClick={() => setIsShowPassword(!isShowPassword)}>
                                    {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                </span>
                                {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                            </div>
                            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                            <div className='form-group'>
                                <Button type="submit" className='btn-submit btn-big btn-lg w-100'>
                                    Ingresar
                                </Button>
                            </div>
                            <div className='form-group text-center p-4'>
                                <Link to={'/forgot-password'} className='link'>
                                    ¿Olvidaste la contraseña?
                                </Link>
                                <div className='d-flex align-items-center justify-content-center or mt-3 mb-3 '>
                                    <span className='line'></span>
                                    <span className='txt'>or</span>
                                    <span className='line'></span>
                                </div>
                                <Button variant='outlined' className='w-100 btn-lg btn-big loginWithGoogle'>
                                    <FcGoogle />
                                    Ingresa con Google
                                </Button>
                                <Link onClick={handleGoogleLogin} className='link'>
                                    Ir a registrarme
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;
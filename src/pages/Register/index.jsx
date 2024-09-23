import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../assets/images/logo.png';
import { MyContext } from '../../App';
import patern from '../../assets/images/pattern.webp';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FaUser, FaPhone } from "react-icons/fa";
import { Button } from '@mui/material';
import { FcGoogle } from "react-icons/fc";

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Register = () => {

    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [inputIndex, setInputIndex] = useState(null);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [roleId, setRoleId] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');

    // Validación de errores en tiempo real
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, []);

    const focusInput = (index) => {
        setInputIndex(index);
    };

    const validateName = (value) => {
        if (value.length < 3) {
            return 'El nombre debe tener al menos 3 caracteres';
        }
        return '';
    };

    const validatePhone = (value) => {
        const regex = /^[0-9]{10,}$/;
        if (!regex.test(value)) {
            return 'El teléfono debe tener al menos 10 dígitos';
        }
        return '';
    };

    const validateEmail = (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) ? '' : 'El correo electrónico no es válido';
    };

    const validatePassword = (value) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(value) ? '' : 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
    };

    const handleNameChange = (e) => {
        const nameValue = e.target.value;
        setName(nameValue);
        setNameError(validateName(nameValue));
    };

    const handlePhoneChange = (e) => {
        const phoneValue = e.target.value;
        setPhone(phoneValue);
        setPhoneError(validatePhone(phoneValue));
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

    const handleRegister = async (e) => {
        e.preventDefault();

        if (nameError || phoneError || emailError || passwordError) {
            setErrorMessage('Corrija los errores antes de enviar.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:1056/api/users/register', {
                name,
                email,
                password,
                phone,
                roleId
            });

            if (response.status === 200 || response.status === 201) {
                MySwal.fire({
                    title: '¡Registro exitoso!',
                    text: 'Ahora serás redirigido al login.',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    navigate('/login');
                });
            }
        } catch (error) {
            MySwal.fire({
                title: 'Error en el registro',
                text: 'Hubo un problema al registrarte. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
            setErrorMessage('Error en el registro.');
        }
    };

    const handleVolverLogin = () => {
        // Aquí puedes agregar la lógica para autenticar con Google o simplemente redirigir
        navigate('/login');  // Cambia '/ruta-de-google' por la ruta que quieras
    };

    return (
        <>
            <img src={patern} className='loginPatern' />
            <section className="loginSection SignUpSection p-0">
                <div className="row w-100">
                    <div className="col-md-8 d-flex align-items-center justify-content-center flex-column part1">
                        <h1>Registrate con BARBERIA ORION y disfruta de nuestros servicios.</h1>
                        <p>Estamos dedicados a ofrecer una amplia variedad de servicios de barbería y cuidado personal. Además, contamos con una selección de productos de alta calidad para atender las necesidades de nuestros clientes. Con un enfoque en la satisfacción y el bienestar de quienes nos visitan, nos destacamos por nuestro profesionalismo y compromiso con la excelencia en cada uno de sus servicios y productos ofrecidos.</p>
                    </div>
                    <div className="col-md-4 p-right p-0">
                        <div className="loginBox text-center">
                            <div className='logo'>
                                <img src={Logo} width="60px" alt="logo" />
                                <h5 className='fw-bolder'>Registrate en Barberia Orion</h5>
                            </div>
                            <div className='wrapper mt-3 card border p-4'>
                                <form onSubmit={handleRegister}>
                                    {/* Input para el nombre con ícono de usuario y validación */}
                                    <div className={`form-group mb-3 position-relative ${inputIndex === 0 && 'focus'}`}>
                                        <span className='icon'><FaUser /></span>
                                        <input
                                            type="text"
                                            className={`form-control ${nameError ? 'is-invalid' : ''}`}
                                            placeholder='Enter your name'
                                            value={name}
                                            onChange={handleNameChange}
                                            onFocus={() => focusInput(0)}
                                            onBlur={() => setInputIndex(null)}
                                            required
                                        />
                                        {nameError && <div className="invalid-feedback">{nameError}</div>}
                                    </div>

                                    {/* Input para el correo con validación */}
                                    <div className={`form-group mb-3 position-relative ${inputIndex === 1 && 'focus'}`}>
                                        <span className='icon'><MdEmail /></span>
                                        <input
                                            type="email"
                                            className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                            placeholder='Enter your email'
                                            value={email}
                                            onChange={handleEmailChange}
                                            onFocus={() => focusInput(1)}
                                            onBlur={() => setInputIndex(null)}
                                            required
                                        />
                                        {emailError && <div className="invalid-feedback">{emailError}</div>}
                                    </div>

                                    {/* Input para el teléfono con ícono de teléfono y validación */}
                                    <div className={`form-group mb-3 position-relative ${inputIndex === 2 && 'focus'}`}>
                                        <span className='icon'><FaPhone /></span>
                                        <input
                                            type="text"
                                            className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                                            placeholder='Enter your phone number'
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            onFocus={() => focusInput(2)}
                                            onBlur={() => setInputIndex(null)}
                                            required
                                        />
                                        {phoneError && <div className="invalid-feedback">{phoneError}</div>}
                                    </div>

                                    {/* Input para la contraseña */}
                                    <div className={`form-group mb-3 position-relative ${inputIndex === 3 && 'focus'}`}>
                                        <span className='icon'><RiLockPasswordFill /></span>
                                        <input
                                            type={isShowPassword ? 'text' : 'password'}
                                            className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                            placeholder='Enter your password'
                                            value={password}
                                            onChange={handlePasswordChange}
                                            onFocus={() => focusInput(3)}
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
                                            Registrar
                                        </Button>
                                    </div>
                                    <span className='text-center d-block mt-4 mb-5'>
                                        ¿Ya tienes cuenta?
                                        <Link className='link color' onClick={handleRegister}>
                                            Loguearme
                                        </Link>
                                    </span>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Register;

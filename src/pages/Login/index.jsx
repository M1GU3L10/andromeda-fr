import { useContext, useEffect, useState } from 'react';
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
    const [inputIndex, setInputIndex] = useState(null)
    const [isShowPassword, setIsShowPassword] = useState(false)

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, []);

    const focusInput = (index) => {
        setInputIndex(index);
    }

    return (
        <>
            <img src={patern} className='loginPatern' />
            <section className="loginSection">
                <div className="loginBox text-center">
                    <div className='logo'>
                        <img src={Logo} width="60px" />
                        <h5 className='fw-bolder'>Ingresar a Barberia Orion</h5>
                    </div>
                    <div className='wrapper mt-3 card border p-4'>
                        <form>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 0 && 'focus'}`}>
                                <span className='icon'><MdEmail /></span>
                                <input type="text" className='form-control' placeholder='Enter your email' onFocus={() => focusInput(0)} onBlur={() => setInputIndex(null)} />
                            </div>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 1 && 'focus'}`}>
                                <span className='icon'><RiLockPasswordFill /></span>
                                <input type={`${isShowPassword === true ? 'text' : 'password'}`} className='form-control' placeholder='Enter your password' onFocus={() => focusInput(1)} onBlur={() => setInputIndex(null)} />

                                <span className='toggleShowPassword' onClick={() => setIsShowPassword(!isShowPassword)}>
                                    {
                                        isShowPassword === true ? <IoMdEyeOff /> : <IoMdEye />
                                    }
                                </span>
                            </div>
                            <div className='form-group'>
                                <Button className='btn-submit btn-big btn-lg w-100'>
                                    Ingresar
                                </Button>
                            </div>
                            <div className='form-group text-center p-4'>
                                <Link to={'/forgot-password'} className='link'>
                                    ¿Olvidaste  la contraseña?
                                </Link>
                                <div className='d-flex align-items-center justify-content-center or mt-3 mb-3 '>
                                    <span className='line'></span>
                                    <span className='txt'>or</span>
                                    <span className='line'></span>
                                </div>
                                <Button variant='outlined' className='w-100 btn-lg btn-big loginWithGoogle'>
                                    <FcGoogle/>
                                    Ingresa con google
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Login;
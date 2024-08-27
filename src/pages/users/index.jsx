import React, { useState, useEffect } from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { GiHairStrands } from 'react-icons/gi';
import SearchBox from '../../components/SearchBox';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axios from 'axios';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';
import { Modal, Form } from 'react-bootstrap';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // <-- Asegúrate de importar ExpandMoreIcon

const StyledBreadcrumb = styled(Chip)(({ theme }) => {


    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
})

const PinkSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: pink[600],
        '&:hover': {
            backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: pink[600],
    },
}));
// Rest of your code...


const Users = () => {
    const url = 'http://localhost:1056/api/users';
    const [users, setUsers] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('');
    const [roleId, setRoleId] = useState('');
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);  // Nuevo estado para el modal de detalles
    const [detailData, setDetailData] = useState({});

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        roleId: ''
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        phone: false,
        roleId: false
    });

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        const response = await axios.get(url);
        setUsers(response.data);
    };

    const openModal = (op, user = {}) => {
        setOperation(op);
        setTitle(op === 1 ? 'Registrar usuario' : 'Editar usuario');

        if (op === 1) {
            // Limpiar los campos para nuevo registro
            setId('');
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            setStatus('A');  // Por defecto, nuevo usuario está activo
            setRoleId('');
        } else if (op === 2) {
            // Cargar los datos del usuario para edición
            setId(user.id);
            setName(user.name);
            setEmail(user.email);
            setPassword(user.password);
            setPhone(user.phone);
            setStatus(user.status);
            setRoleId(user.roleId);
        }
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const validateName = (value) => {
        const regex = /^[A-Za-z\s]+$/;
        return regex.test(value) ? '' : 'El nombre solo debe contener letras';
    };

    const validateEmail = (value) => {
        const regex = /^\S+@\S+\.\S+$/;
        return regex.test(value) ? '' : 'El correo no es válido';
    };

    const validatePassword = (value) => {
        return value.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres';
    };

    const validatePhone = (value) => {
        const regex = /^\d{10}$/;
        return regex.test(value) ? '' : 'El teléfono debe contener 10 números';
    };

    const validateRoleId = (value) => {
        return value ? '' : 'Debe seleccionar un rol';
    };

    const handleValidation = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                error = validateName(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
            case 'roleId':
                error = validateRoleId(value);
                break;
            default:
                break;
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleValidation(name, value);

        switch (name) {
            case 'name':
                setName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            case 'roleId':
                setRoleId(value);
                break;
            default:
                break;
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
        handleValidation(name, e.target.value);
    };

    const validar = () => {
        const isValidEmail = !validateEmail(email);
        const isValidName = !validateName(name);
        const isValidPassword = !validatePassword(password);
        const isValidPhone = !validatePhone(phone);
        const isValidRoleId = !validateRoleId(roleId);

        if (!isValidName) show_alerta(errors.name, 'warning');
        else if (!isValidEmail) show_alerta(errors.email, 'warning');
        else if (!isValidPassword) show_alerta(errors.password, 'warning');
        else if (!isValidPhone) show_alerta(errors.phone, 'warning');
        else if (!isValidRoleId) show_alerta(errors.roleId, 'warning');
        else {
            const parametros = {
                id: id,
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                phone: phone.trim(),
                status: status,
                roleId: roleId
            };

            const isUpdate = operation === 2;
            const metodo = isUpdate ? 'PUT' : 'POST';
            enviarSolicitud(metodo, parametros);
        }
    };

    const handleSwitchChange = (id) => (event) => {
        const newStatus = event.target.checked ? 'A' : 'I';
        const updatedUser = { id, status: newStatus };

        setUsers(users.map(user =>
            user.id === id ? { ...user, status: newStatus } : user
        ));

        enviarSolicitud('PUT', updatedUser);
    };

    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
        try {
            await axios({ method: metodo, url: urlWithId, data: parametros });

            show_alerta('Operación exitosa', 'success');
            console.log(parametros)
            getUsers();
        } catch (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
            console.log(parametros)
        }
    };

    const handleCloseDetail = () => {
        setShowModal(false);
        setShowDetailModal(false);
    };

    const handleViewDetails = (user) => {
        setDetailData(user);
        setShowDetailModal(true);
    };

    const deleteUser = async (id, name) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas eliminar el usuario ${name}?`,
            icon: 'question',
            text: 'No se podrá deshacer esta acción',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarSolicitud('DELETE', { id });
            }
        });
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Usuarios</span>
                        </div>
                        <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
                            <div role="presentation">
                                <Breadcrumbs aria-label="breadcrumb">
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Home"
                                        icon={<HomeIcon fontSize="small" />}
                                    />
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Usuarios"
                                        icon={<GiHairStrands fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained" color="primary">
                                    <BsPlusSquareFill /> Registrar
                                </Button>
                            </div>
                            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                                <SearchBox />
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            <table className='table table-bordered table-hover v-align'>
                                <thead className='table-primary'>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Teléfono</th>
                                        <th>Rol Id</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        users.map((user,i) => (
                                            <tr key={user.id}>
                                                <td>{i+1}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone}</td>
                                                <td>{user.roleId === 1 ? 'Administrador' : roleId === 2 ? 'Empleado' : roleId === 3 ? 'Cliente' : 'Desconocido'}</td>
                                                <td>{user.status === 'A' ? 'Activo' : 'Inactivo'}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>

                                                        <PinkSwitch
                                                            checked={user.status === 'A'}
                                                            onChange={handleSwitchChange(user.id)}
                                                            color="success"
                                                        />
                                                        <Button color='primary' className='primary' onClick={() => handleViewDetails(user)}><FaEye /></Button>
                                                        {user.status === 'A' && (
                                                            <>
                                                                <Button color="secondary" className='secondary' onClick={() => openModal(2, user)} >
                                                                    <FaPencilAlt />
                                                                </Button>
                                                                <Button color='error' className='delete' onClick={() => deleteUser(user.id, user.name)}>
                                                                    <IoTrashSharp />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex table-footer">
                            <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
                        </div>
                    </div>
                </div>

                {/* Modal para Agregar/Editar Usuario */}
                <Modal show={showModal} 
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={name}
                                    placeholder="Nombre"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.name && !!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={email}
                                    placeholder="Correo"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.email && !!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={password}
                                    placeholder="Contraseña"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.password && !!errors.password}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    value={phone}
                                    placeholder="Telefono"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.phone && !!errors.phone}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.phone}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Rol</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="roleId"
                                    value={roleId}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.roleId && !!errors.roleId}
                                >
                                    <option value="1">Admin</option>
                                    <option value="2">Empleado</option>
                                    <option value="3">Cliente</option>
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.roleId}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cerrar
                        </Button>
                        <Button variant="primary" onClick={validar}>
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* modal detalle */}
                <Modal show={showDetailModal} onHide={handleCloseDetail}>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalle usuario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>ID:</strong> {detailData.id}</p>
                        <p><strong>Nombre:</strong> {detailData.name}</p>
                        <p><strong>Email:</strong> {detailData.email}</p>
                        <p><strong>Teléfono:</strong> {detailData.phone}</p>
                        <p><strong>Rol:</strong> {detailData.roleId === 1 ? 'Administrador' : detailData.roleId === 2 ? 'Empleado' : detailData.roleId === 3 ? 'Cliente' : 'Desconocido'}</p>
                        <p><strong>Estado:</strong> {detailData.status === 'A' ? 'Activo' : 'Inactivo'}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseDetail}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );

};

export default Users;

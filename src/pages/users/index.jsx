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

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        const response = await axios.get(url);
        setUsers(response.data);
    };

    const openModal = (op, user = {}) => {
        setOperation(op);
        setTitle(op === 1 ? 'Registrar Usuario' : 'Editar Usuario');

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

    const validar = () => {
        if (name.trim() === '') {
            show_alerta('Digite el nombre', 'warning');
        } else if (email.trim() === '') {
            show_alerta('Digite el email', 'warning');
        } else if (password.trim() === '') {
            show_alerta('Digite la contraseña', 'warning');
        } else if (phone.trim() === '') {
            show_alerta('Digite el teléfono', 'warning');
        } else if (roleId === '') {
            show_alerta('Seleccione un rol', 'warning');
        } else {
            const isValidEmail = /^\S+@\S+\.\S+$/.test(email);
            if (!isValidEmail) {
                show_alerta('El email no es válido', 'warning');
                return;
            }

            const parametros = {
                id: id,
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                phone: phone.trim(),
                status: status,
                roleId: roleId
            };

            const isUpdate = operation === 2;  // Si la operación es editar
            const metodo = isUpdate ? 'PUT' : 'POST';
            enviarSolicitud(metodo, parametros);
        }
    };

    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
        await axios({ method: metodo, url: urlWithId, data: parametros })
            .then(() => {
                show_alerta('Operación exitosa', 'success');
                handleClose();
                getUsers();
            })
            .catch((error) => {
                show_alerta('Error en la solicitud', 'error');
                console.log(error);
            });
    };

    const handleSwitchChange = (id) => (event) => {
        const newStatus = event.target.checked ? 'A' : 'I';
        const updatedUser = { id, status: newStatus };
        enviarSolicitud('PUT', updatedUser);
    };

    const deleteUser = async (id, name) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas eliminar el usuario ${name}?`,
            icon: 'question',
            text: 'No se podrá dar marcha atrás',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setId(id);
                enviarSolicitud('DELETE', { id: id });
            } else {
                show_alerta('El usuario NO fue eliminado', 'info');
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
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone}</td>
                                                <td>{user.status === 'A' ? 'Activo' : 'Inactivo'}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>

                                                        <PinkSwitch
                                                                checked={user.status === 'A'}
                                                                onChange={handleSwitchChange(user.id)}
                                                                color="success"
                                                            />

                                                       <Button color='primary' className='primary'><FaEye /></Button>
                                                       <Button color="secondary"  className='secondary' onClick={() => openModal(2, user)} >
                                                            <FaPencilAlt />
                                                        </Button>
                                                        <Button color='error' className='delete' onClick={() => deleteUser(user.id, user.name)}>
                                                            <IoTrashSharp />
                                                        </Button>
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

                {/* Modal for Register User */}
                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <FormControl fullWidth>
                                    <InputLabel id="roleId">Rol</InputLabel>
                                    <Select
                                        labelId="roleId"
                                        value={roleId}
                                        label="Rol"
                                        onChange={(e) => setRoleId(e.target.value)}
                                    >
                                        <MenuItem value="1">Administrador</MenuItem>
                                        <MenuItem value="2">Usuario</MenuItem>
                                    </Select>
                                </FormControl>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="contained" onClick={validar}>Guardar</Button>
                        <Button variant="outlined" onClick={handleClose}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );

};

export default Users;

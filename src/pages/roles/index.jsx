import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GiHairStrands } from "react-icons/gi";
import { RxScissors } from "react-icons/rx";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import SearchBox from '../../components/SearchBox';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import axios from 'axios'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { show_alerta } from '../../assets/functions'
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';


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

const Roles = () => {
    const url = 'http://localhost:1056/api/roles';
    const [roles, setRoles] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [permission, setPermission] = useState('');
    

    useEffect(() => {
        getRoles();
    }, [])

    const getRoles = async () => {
        const response = await axios.get(url);
        setRoles(response.data);
    }

    const openModal = (id, name, status, permissions) => {
        setId('');
        setName('');
        setStatus('');
        setPermission('');
        setOperation(op);

        if (op === 1) {
            setTitle('Registrar servicio');
        } else if (op === 2) {
            setTitle('Editar servicio');
            setId(id);
            setName(name);
            setStatus(status);
            setPermission(permission);
        }
        window.setTimeout(function () {
            document.getElementById('name').focus();
        }, 500)
    }

    const validar = () => {
        var parametros;
        var metodo;
        if (name.trim() === '') {
            show_alerta('Digite el nombre', 'warning')
        } else if (status === '') {
            show_alerta('Digite el estado', 'warning')
        } else if (permission.trim() === '') {
            show_alerta('Digite un permiso', 'warning')
        } else {
            
            if (operation === 1) {
                parametros = {
                    name: name.trim(),
                    status: 'A',
                    permission: permission.trim()
                }
                metodo = 'POST';
                console.log(parametros);
            } else {
                parametros = {
                    id: id,
                    name: name.trim(),
                    status: 'A',
                    permission: permission.trim()
                    
                }
                metodo = 'PUT';
                console.log(parametros);
            }
            enviarSolicitud(metodo, parametros)
        }
    }


    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
        await axios({ method: metodo, url: urlWithId, data: parametros, }).then(function (response) {
            show_alerta('Operación exitosa', 'success');
            document.getElementById('btnCerrar').click();
            getServices();
        }).catch(function (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
        })
    }

    const handleSwitchChange = (id) => (event) => {
        const newStatus = event.target.checked ? 'A' : 'I';
        const updatedService = { id, status: newStatus };
        enviarSolicitud('PUT', updatedService);
    };

    const deleteService = async (id, name) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: 'Estas seguro que desea eliminar el rol' + name + '?',
            icon: 'question',
            text: 'No se podrá dar marcha atras',
            showCancelButton: true,
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setId(id);
                enviarSolicitud('DELETE', { id: id })
            } else {
                show_alerta('El rol NO fue eliminado', 'info')
            }
        })
    }


    return (
        <>
            <div className="right-content w-100">
                <div class="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Roles</span>
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
                                        label="Servicios"
                                        icon={<GiHairStrands fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained" data-bs-toggle='modal' data-bs-target='#modalServices'><BsPlusSquareFill />Registrar</Button>
                            </div>
                            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                                <SearchBox />
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            <table className='table table-bordered table-hover v-align'>
                                <thead className='table-primary'>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Permiso</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        roles.map((role, i) => (
                                            <tr key={role.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{role.name}</td>
                                                <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(service.price)}</td>
                                                <td>{role.permission}</td>
                                                <td>{service.status === 'A' ? 'Activo' : 'Inactivo'}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <PinkSwitch
                                                            checked={service.status === 'A'}
                                                            onChange={handleSwitchChange(service.id)}
                                                            color="success"
                                                        />
                                                        <Button color='primary' className='primary'><FaEye /></Button>
                                                        <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalServices' className='secondary' onClick={() => openModal(2, role.id, role.name, role.permission, role.status)}><FaPencilAlt /></Button>
                                                        <Button color='error' className='delete' onClick={() => deleteService(role.id, role.name)}><IoTrashSharp /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <div className="d-flex table-footer">
                                <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
                            </div>
                        </div>
                    </div>
                </div>
                <div id="modalServices" className="modal fade" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <label className="h5">{title}</label>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <input type="hidden" id="id" />
                                <div className="input-group mb-3">
                                    <input type="text" id="name" className="form-control" placeholder="Nombre"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" id="permission" className="form-control" placeholder="Permisos"
                                        value={permission} onChange={(e) => setPermission(e.target.value)}
                                    />
                                </div>
                                
                                <div className='d-grid col-4 mx-auto' onClick={() => validar()}>
                                    <Button type='button' className='btn-sucess'>Guardar</Button>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <Button type='button' id='btnCerrar' className='btn-blue' data-bs-dismiss='modal'>Cerrar</Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Services;
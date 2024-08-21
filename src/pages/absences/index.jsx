import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import SearchBox from '../../components/SearchBox';
import Pagination from '@mui/material/Pagination';
import axios from 'axios';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';

// Styled components
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
});

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

const Absences = () => {
    const urlAbsences = 'http://localhost:1056/api/absences';
    const urlUsers = 'http://localhost:1056/api/users';
    const [absences, setAbsences] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentAbsence, setCurrentAbsence] = useState({});
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');

    useEffect(() => {
        getAbsences();
        getUsers(); 
    }, []);

    const getAbsences = async () => {
        try {
            const response = await axios.get(urlAbsences);
            setAbsences(response.data);
        } catch (error) {
            show_alerta('Error al obtener las ausencias', 'error');
        }
    }

    const getUsers = async () => {
        try {
            const response = await axios.get(urlUsers);
            setUsers(response.data);
        } catch (error) {
            show_alerta('Error al obtener los usuarios', 'error');
        }
    }

    const getUserName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : 'Desconocido';
    }

    const openModal = (op, absence) => {
        setCurrentAbsence(absence);
        setOperation(op);
        setTitle(op === 1 ? 'Registrar ausencia' : (op === 2 ? 'Ver ausencia' : 'Editar ausencia'));
        window.setTimeout(() => {
            document.getElementById('description').focus();
        }, 500);
    }

    const handleSwitchChange = (id) => (event) => {
        const newStatus = event.target.checked ? 'aprobado' : 'no aprobado';
        const updatedAbsence = { id, status: newStatus };
        enviarSolicitud('PUT', updatedAbsence);
    };

    const deleteAbsence = async (id, description) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas eliminar la ausencia ${description}?`,
            icon: 'question',
            text: 'No se podrá dar marcha atrás',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await enviarSolicitud('DELETE', { id: id });
                    show_alerta('Operación exitosa', 'success');
                    getAbsences();
                } catch (error) {
                    show_alerta('Error al eliminar la ausencia', 'error');
                    console.log(error);
                }
            } else {
                show_alerta('La ausencia NO fue eliminada', 'info');
            }
        });
    }

    const validar = async () => {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const userId = document.getElementById('userId').value;
        const status = document.getElementById('status').value;
    
        const data = {
            startTime,
            endTime,
            date,
            description,
            userId,
            status
        };
    
        if (operation === 1) {
            await enviarSolicitud('POST', data);
        } else if (operation === 3) {
            data.id = currentAbsence.id;
            await enviarSolicitud('PUT', data);
        }
    }
    
    const enviarSolicitud = async (metodo, parametros) => {
        const url = metodo === 'PUT' ? `${urlAbsences}/${parametros.id}` : metodo === 'DELETE' ? `${urlAbsences}/${parametros.id}` : urlAbsences;
        try {
            await axios({ method: metodo, url, data: parametros });
            show_alerta('Operación exitosa', 'success');
            document.getElementById('btnCerrar').click();
            getAbsences();
        } catch (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
        }
    }

    // funcion para que no traiga usuarios que tengan otro rol diferente a empleados
    const FiltrarUsers = () => {
        return users.filter(user => user.roleId === 2);
    }

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Ausencias</span>
                        </div>
                        <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
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
                                    label="Ausencias"
                                    icon={<GiHairStrands fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Button className='btn-register' onClick={() => openModal(1, {})} variant="contained" data-bs-toggle='modal' data-bs-target='#modalAbsences'><BsPlusSquareFill />Registrar</Button>
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
                                        <th>Inicio</th>
                                        <th>Fin</th>
                                        <th>Fecha</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Usuario</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        absences.map((absence, i) => (
                                            <tr key={absence.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{absence.startTime}</td>
                                                <td>{absence.endTime}</td>
                                                <td>{absence.date}</td>
                                                <td>{absence.description}</td>
                                                <td>{absence.status}</td>
                                                <td>{getUserName(absence.userId)}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Button color='primary' className='primary' onClick={() => openModal(2, absence)}><FaEye /></Button>
                                                        <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalAbsences' className='secondary' onClick={() => openModal(3, absence)}><FaPencilAlt /></Button>
                                                        <Button color='error' className='delete' onClick={() => deleteAbsence(absence.id, absence.description)}><IoTrashSharp /></Button>
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

                <div id="modalAbsences" className="modal fade" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <label className="h5">{title}</label>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <input type="hidden" id="id" value={currentAbsence.id || ''} />
                        <div className="input-group mb-3">
                            <input type="time" id="startTime" className="form-control" placeholder="Inicio" defaultValue={currentAbsence.startTime || ''} />
                        </div>
                        <div className="input-group mb-3">
                            <input type="time" id="endTime" className="form-control" placeholder="Fin" defaultValue={currentAbsence.endTime || ''} />
                        </div>
                        <div className="input-group mb-3">
                            <input type="date" id="date" className="form-control" placeholder="Fecha" defaultValue={currentAbsence.date || ''} />
                        </div>
                        <div className="input-group mb-3">
                            <input type="text" id="description" className="form-control" placeholder="Descripción" defaultValue={currentAbsence.description || ''} />
                        </div>
                        <div className="input-group mb-3">
                            <select className="form-select" id='userId' aria-label="Usuario" defaultValue={currentAbsence.userId || ''}>
                                <option value="">Seleccionar usuario</option>
                                {FiltrarUsers().map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group mb-3">
                            <select className="form-select" id='status' aria-label="Estado" defaultValue={currentAbsence.status || 'en proceso'}>
                                <option value="en proceso">En proceso</option>
                                <option value="aprobado">Aprobado</option>
                                <option value="no aprobado">No aprobado</option>
                            </select>
                        </div>

                        <div className='d-grid col-4 mx-auto'>
                            {(operation === 1 || operation === 3) && (
                                <Button type='button' className='btn-success' onClick={() => validar()}>Guardar</Button>
                            )}
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

export default Absences;
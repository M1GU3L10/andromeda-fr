import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import axios from 'axios';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { Modal, Form } from 'react-bootstrap';
import { IoSearch } from "react-icons/io5";
import Pagination from '../../components/pagination/index';
import { MdOutlineSave } from "react-icons/md";



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

const Absences = () => {
    const urlAbsences = 'http://localhost:1056/api/absences';
    const urlUsers = 'http://localhost:1056/api/users';
    const [absences, setAbsences] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentAbsence, setCurrentAbsence] = useState({});
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [errors, setErrors] = useState({});
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState({});
    const [search, setSearch] = useState('');
    const [currentPages, setCurrentPages] = useState(1);
    const [dataQt, setDataQt] = useState(3);

    const [formValues, setFormValues] = useState({
        id: '',
        startTime: '',
        endTime: '',
        date: '',
        description: '',
        userId: '',
        status: 'en proceso'
    });



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

    const [showModal, setShowModal] = useState(false);

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

    const searcher = (e) => {
        setSearch(e.target.value);
    }

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(absences.length / dataQt);

    let results = []
    if (!search) {
        results = absences.slice(indexStart, indexEnd);
    } else {
        results = absences.filter((dato) =>
            dato.description.toLowerCase().includes(search.toLocaleLowerCase()) ||
            getUserName(dato.userId).toLowerCase().includes(search.toLocaleLowerCase())
        ).slice(indexStart, indexEnd);
    }

    const openModal = (op, absence) => {
        setCurrentAbsence(absence);
        setOperation(op);
        setTitle(op === 1 ? 'Registrar ausencia' : (op === 2 ? 'Ver ausencia' : 'Editar ausencia'));
        if (op === 3) {
            setFormValues({
                id: absence.id,
                startTime: absence.startTime,
                endTime: absence.endTime,
                date: absence.date,
                description: absence.description,
                userId: absence.userId,
                status: absence.status
            });
        } else {
            setFormValues({
                id: '',
                startTime: '',
                endTime: '',
                date: '',
                description: '',
                userId: '',
                status: 'en proceso'
            });
        }
        setShowModal(true);
    }


    const handleCloseModal = () => {
        setShowModal(false);
        setErrors({});
    };


    const openDetailModal = (absence) => {
        setDetailData(absence);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => setShowDetailModal(false);

    // funcion para que no traiga usuarios que tengan otro rol diferente a empleados
    const FiltrarUsers = () => {
        return users.filter(user => user.roleId === 2);
    }

    const deleteAbsence = async (id, description) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
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

    const validateField = (name, value) => {
        let error = '';
    
        if (operation === 3 && value === '') {
            setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
            return; // Si está en edición y el campo está vacío, no lo valida
        }
    
        switch (name) {
            case 'startTime':
                if (!value) {
                    error = 'La hora de inicio es requerida';
                }
                break;
    
            case 'endTime':
                if (!value) {
                    error = 'La hora de fin es requerida';
                } else {
                    const startTime = new Date(`1970-01-01T${formValues.startTime}:00`);
                    const endTime = new Date(`1970-01-01T${value}:00`);
                    const diffInHours = (endTime - startTime) / (1000 * 60 * 60);
                    if (diffInHours < 2) {
                        error = 'La hora de fin debe ser al menos 2 horas más tarde que la hora de inicio';
                    }
                }
                break;
    
            case 'date':
                if (!value) {
                    error = 'La fecha es requerida';
                } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    error = 'La fecha debe estar en formato YYYY-MM-DD';
                }
                break;
    
            case 'description':
                if (!value) {
                    error = 'La descripción es obligatoria';
                } else if (value.length < 5) {
                    error = 'La descripción debe tener al menos 5 caracteres';
                }
                break;
    
            case 'userId':
                if (!value) {
                    error = 'Debe seleccionar un usuario';
                }
                break;
    
            case 'status':
                if (!['en proceso', 'aprobado', 'no aprobado'].includes(value)) {
                    error = 'El estado debe ser "en proceso", "aprobado" o "no aprobado"';
                }
                break;
    
            default:
                break;
        }
    
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prevValues => ({ ...prevValues, [name]: value }));
        validateField(name, value);
    };

    const validar = async () => {
        const { startTime, endTime, date, description, userId, status } = formValues;
    
        const fields = { startTime, endTime, date, description, userId };
        let valid = true;
    
        Object.keys(fields).forEach(field => {
            if (operation !== 3 || fields[field] || field === 'status') { // Solo valida si es un nuevo registro o si el campo fue modificado
                validateField(field, fields[field]);
                if (errors[field]) valid = false;
            }
        });
    
        if (!valid) {
            show_alerta('Por favor corrige los errores antes de continuar', 'error');
            return;
        }
    
        const data = {
            id: formValues.id,
            startTime: startTime,
            endTime: endTime,
            date: date,
            description: description,
            userId: userId,
            status: status
        };
    
        // Depurar valores
        console.log('Data a enviar:', data);
    
        if (operation === 1) {
            await enviarSolicitud('POST', data);
        } else if (operation === 3) {
            if (!data.id) {
                show_alerta('ID no encontrado para actualizar', 'error');
                return;
            }
            await enviarSolicitud('PUT', data);
        }
    };
    

    const enviarSolicitud = async (metodo, parametros) => {
        const url = metodo === 'PUT' || metodo === 'DELETE'
            ? `${urlAbsences}/${parametros.id}`
            : urlAbsences;

        try {
            await axios({ method: metodo, url, data: parametros });
            show_alerta('Operación exitosa', 'success');
            handleCloseModal();
            getAbsences();
            console.log('Parámetros enviados:', parametros); // Para depuración
        } catch (error) {
            console.error('Error en la solicitud:', error.response?.status, error.response?.data);
            show_alerta('Error en la solicitud', 'error');
        }
    };


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
                                <Button className='btn-register' onClick={() => openModal(1, {})} variant="contained">
                                    <BsPlusSquareFill />Registrar
                                </Button>
                            </div>
                            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                                <div className="searchBox position-relative d-flex align-items-center">
                                    <IoSearch className="mr-2" />
                                    <input value={search} onChange={searcher} type="text" placeholder='Buscar...' className='form-control' />
                                </div>
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            <table className='table table-bordered table-hover v-align table-striped'>
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
                                        results.map((absence, i) => (
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
                                                        <Button color='primary' className='primary' onClick={() => openDetailModal(absence)}><FaEye /></Button>
                                                        <Button color="secondary" className='secondary' onClick={() => openModal(3, absence)}><FaPencilAlt /></Button>
                                                        <Button color='error' className='delete' onClick={() => deleteAbsence(absence.id, absence.description)}><IoTrashSharp /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <div className="d-flex table-footer">
                                <Pagination
                                    setCurrentPages={setCurrentPages}
                                    currentPages={currentPages}
                                    nPages={nPages}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="time"
                                    id="startTime"
                                    name="startTime"
                                    placeholder="Inicio"
                                    value={formValues.startTime}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.startTime}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.startTime}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="time"
                                    id="endTime"
                                    name="endTime"
                                    placeholder="Fin"
                                    value={formValues.endTime}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.endTime}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.endTime}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="date"
                                    id="date"
                                    name="date"
                                    placeholder="Fecha"
                                    value={formValues.date}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.date}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.date}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    as="textarea" rows={2}
                                    id="description"
                                    name="description"
                                    placeholder="Descripción"
                                    value={formValues.description}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.description}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Select
                                    id='userId'
                                    name="userId"
                                    value={formValues.userId}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.userId}
                                >
                                    <option value="">Seleccionar usuario</option>
                                    {FiltrarUsers().map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.userId}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {operation === 3 && (
                                <Form.Group className="mb-3">
                                    <Form.Select
                                        id='status'
                                        name="status"
                                        value={formValues.status}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.status}
                                    >
                                        <option value="en proceso">En proceso</option>
                                        <option value="aprobado">Aprobado</option>
                                        <option value="no aprobado">No aprobado</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.status}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        {(operation === 1 || operation === 3) && (
                            <Button variant="primary" className='btn-sucess' onClick={validar}>
                                <MdOutlineSave /> Guardar
                            </Button>
                        )}
                        <Button variant="secondary" className='btn-red' onClick={handleCloseModal}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showDetailModal} onHide={handleCloseDetail}>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalle de ausencia</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>ID:</strong> {detailData.id}</p>
                        <p><strong>Inicio:</strong> {detailData.startTime}</p>
                        <p><strong>Fin:</strong> {detailData.endTime}</p>
                        <p><strong>Fecha:</strong> {detailData.date}</p>
                        <p><strong>Descripción:</strong> {detailData.description}</p>
                        <p><strong>Usuario:</strong> {getUserName(detailData.userId)}</p>
                        <p><strong>Estado:</strong> {detailData.status === 'en proceso' ? 'En proceso' : detailData.status === 'aprobado' ? 'Aprobado' : 'No aprobado'}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseDetail}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>

            </div>
        </>
    );
}

export default Absences;
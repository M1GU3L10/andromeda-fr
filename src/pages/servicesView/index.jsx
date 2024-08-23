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
})

const verificarNombreExistente = async (name) => {
    try {
        // Realizar una solicitud GET a la API para verificar el nombre
        const response = await fetch(`http://localhost:1056/api/services?name=${encodeURIComponent(name)}`);
        if (!response.ok) {
            throw new Error('Error en la solicitud de verificación');
        }
        const data = await response.json();
        // Suponiendo que la API devuelve un array de objetos o una lista de servicios con el nombre
        return data.some(service => service.name === name.trim());
    } catch (error) {
        console.error('Error al verificar el nombre:', error);
        return false;
    }
};

const Services = () => {
    const url = 'http://localhost:1056/api/services';
    const [services, setServices] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('');
    const [status, setStatus] = useState('');
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [switchStates, setSwitchStates] = useState({});


    useEffect(() => {
        getServices();
    }, [])

    const getServices = async () => {
        const response = await axios.get(url);
        setServices(response.data);
    }

    const openModal = (op, id, name, price, description, time, status) => {
        setId('');
        setName('');
        setPrice('');
        setDescription('');
        setTime('');
        setStatus('');
        setOperation(op);

        if (op === 1) {
            setTitle('Registrar servicio');
        } else if (op === 2) {
            setTitle('Editar servicio');
            setId(id);
            setName(name);
            setPrice(price);
            setDescription(description);
            setTime(time);
            setStatus(status);
        }
        window.setTimeout(function () {
            document.getElementById('name').focus();
        }, 500)
    }

    const validar = async () => {
        const nombreExiste = await verificarNombreExistente(name.trim());
        if (name.trim() === '' ) {
            show_alerta('Digite el nombre', 'warning');
        } else if (price === '') {
            show_alerta('Digite el precio', 'warning');
        } else if (description.trim() === '') {
            show_alerta('Digite una descripción', 'warning');
        } else if (time === '') {
            show_alerta('Digite el tiempo del servicio', 'warning');
        }else 
        if (nombreExiste) {
            show_alerta('El nombre ya está registrado', 'warning');
            return;
        } else {
            const priceFloat = parseFloat(price);
            const timeInt = parseInt(time, 10);

            const parametros = {
                name: name.trim(),
                price: priceFloat,
                description: description.trim(),
                time: timeInt,
                status: 'A'
            };

            const metodo = operation === 1 ? 'POST' : 'PUT';
            if (operation === 2) {
                parametros.id = id;
            }

            console.log(parametros);
            enviarSolicitud(metodo, parametros);
        }
    };

    const enviarSolicitud = async (metodo, parametros) => {
        try {
            const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
            const response = await axios({ method: metodo, url: urlWithId, data: parametros });
            show_alerta('Operación exitosa', 'success');
            document.getElementById('btnCerrar').click();
            getServices();
        } catch (error) {
            // Manejar errores específicos aquí
            console.log('Error details:', error.response?.data.errors || error.message);
            show_alerta('Error en la solicitud', 'error');
        }
    };


    const deleteService = async (id, name) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: 'Estas seguro que desea eliminar el servicio ' + name + '?',
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
                show_alerta('El servicio NO fue eliminado', 'info')
            }
        })
    }

    const handleSwitchChange = async (serviceId, checked) => {
        // Encuentra el servicio que está siendo actualizado
        const serviceToUpdate = services.find(service => service.id === serviceId);

        // Prepara el mensaje de confirmación
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} el servicio "${serviceToUpdate.name}"?`,
            icon: 'question',
            text: 'Esta acción puede afectar la disponibilidad del servicio.',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Solo cambia el estado sin modificar el nombre
                const updatedService = {
                    ...serviceToUpdate,
                    status: checked ? 'A' : 'I'
                };

                try {
                    // Envía la solicitud PUT con todos los campos, incluyendo el nombre actual
                    const response = await axios.put(`${url}/${serviceId}`, updatedService);
                    if (response.status === 200) {
                        // Actualiza el estado local si la solicitud fue exitosa
                        setServices(services.map(service =>
                            service.id === serviceId ? { ...service, status: updatedService.status } : service
                        ));
                        show_alerta('Estado del servicio actualizado exitosamente', 'success');
                    }
                } catch (error) {
                    if (error.response) {
                        console.log('Error details:', error.response.data);
                        show_alerta('Error al actualizar el estado del servicio: ' + JSON.stringify(error.response.data.errors), 'error');
                    } else {
                        console.log('Error details:', error.message);
                        show_alerta('Error al actualizar el estado del servicio', 'error');
                    }
                }
            } else {
                // Si el usuario cancela, restablece el switch a su estado original
                setServices(services.map(service =>
                    service.id === serviceId ? { ...service, status: !checked ? 'A' : 'I' } : service
                ));
                show_alerta('Estado del servicio no cambiado', 'info');
            }
        });
    };


    return (
        <>
            <div className="right-content w-100">
                <div class="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Servicios</span>
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
                                        <th>Precio</th>
                                        <th>Descripción</th>
                                        <th>Tiempo(Minutos)</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        services.map((service, i) => (
                                            <tr key={service.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{service.name}</td>
                                                <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(service.price)}</td>
                                                <td>{service.description}</td>
                                                <td>{service.time}</td>
                                                <td>{service.status === 'A' ? 'Activo' : 'Inactivo'}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Switch
                                                            checked={service.status === 'A'}
                                                            onChange={(e) => handleSwitchChange(service.id, e.target.checked)}
                                                        />
                                                        <Button color='primary' className='primary'><FaEye /></Button>
                                                        <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalServices' className='secondary' onClick={() => openModal(2, service.id, service.name, service.price, service.description, service.time, service.status)}><FaPencilAlt /></Button>
                                                        <Button color='error' className='delete' onClick={() => deleteService(service.id, service.name)}><IoTrashSharp /></Button>
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
                            </div>
                            <div className="modal-body">
                                <input type="hidden" id="id" />
                                <div className="input-group mb-3">
                                    <input type="text" id="name" className="form-control" placeholder="Nombre"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="number" id="price" className="form-control" placeholder="Precio"
                                        value={price} onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" id="description" className="form-control" placeholder="Descripcion"
                                        value={description} onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <select class="form-select" id='time' required aria-label="Tiempo" onChange={(e) => setTime(e.target.value)} value={time}>
                                        <option hidden="">Tiempo</option>
                                        <option value="20">20 Minutos</option>
                                        <option value="30">30 Minutos</option>
                                        <option value="45">45 Minutos</option>
                                        <option value="60">60 Minutos</option>
                                    </select>
                                    <div class="invalid-feedback">Example invalid select feedback</div>
                                </div>
                                <div className='modal-footer w-100 m-3'>
                                    <div className='d-grid col-3 Modal-buton' onClick={() => validar()}>
                                        <Button type='button' className='btn-sucess'><MdOutlineSave/>Guardar</Button>
                                    </div>
                                    <Button type='button' id='btnCerrar' className='btn-blue' data-bs-dismiss='modal'>Cerrar</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Services;
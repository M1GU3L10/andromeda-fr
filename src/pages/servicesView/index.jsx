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
import SearchBox from '../../components/SearchBox';
import axios from 'axios'
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { show_alerta } from '../../assets/functions'
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Switch from '@mui/material/Switch';
import { Modal, Form } from 'react-bootstrap';
import { IoSearch } from "react-icons/io5";
import Pagination from '../../components/pagination/index';


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
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState({});
    const [value, setValue] = useState([]);
    const [search, setSearch] = useState('');
    const [dataQt, setDataQt] = useState(3);
    const [currentPages, setCurrentPages] = useState(1);


    const [errors, setErrors] = useState({
        name: '',
        price: '',
        description: '',
        time: '',
    });

    const [touched, setTouched] = useState({
        name: false,
        price: false,
        description: false,
        time: false,
    });


    useEffect(() => {
        getServices();
    }, [])

    const getServices = async () => {
        const response = await axios.get(url);
        setServices(response.data);
    }

    const searcher = (e) => {
        setSearch(e.target.value);
        console.log(e.target.value)
    }

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(services.length / dataQt);

    let results = []
    if (!search) {
        results = services.slice(indexStart,indexEnd);
    } else{
        results = services.filter((dato) => dato.name.toLowerCase().includes(search.toLocaleLowerCase()))
    }

    const openModal = (op, id, name, price, description, time) => {
        setId('');
        setName('');
        setPrice('');
        setDescription('');
        setTime('');
        setStatus('A');
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
        }
        setShowModal(true);
    }

    const handleClose = () => {
        setId('');
        setName('');
        setPrice('');
        setDescription('');
        setTime('');
        setStatus('A');

        setErrors({
            name: '',
            price: '',
            description: '',
            time: '',
        });
        setTouched({
            name: false,
            price: false,
            description: false,
            time: false,
        });

        setShowModal(false);
    };


    const validateName = (value) => {
        const regex = /^[A-Za-z\s]+$/;
        return regex.test(value) ? '' : 'El nombre solo debe contener letras';
    };

    const checkIfServiceExists = async (name) => {
        try {
            const response = await axios.get(`${url}`, {
                params: { name }
            });
            return response.data.some(service => service.name.trim().toLowerCase() === name.trim().toLowerCase());
        } catch (error) {
            console.error('Error al verificar la existencia del servicio:', error);
            return false;
        }
    };

    const validatePriceFormat = (value) => {
        const regex = /^\d+(\.\d{1,2})?$/;
        return regex.test(value) ? '' : 'El formato del precio no es válido';
    };

    const validatePrice = (value) => {
        const numberValue = parseFloat(value);
        return numberValue > 0 ? '' : 'El precio debe ser mayor a 0';
    };

    const validateDescription = (value) => {
        if (value.length < 10 || value.length > 500) {
            return 'La descripción debe tener entre 10 y 500 caracteres';
        }
        return '';
    };

    const validateTime = (value) => {
        return value ? '' : 'Debe seleccionar el tiempo del servicio';
    };

    const handleValidation = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                error = validateName(value);
                break;
            case 'price':
                error = validatePriceFormat(value);
                error = validatePrice(value);
                break;
            case 'description':
                error = validateDescription(value);
                break;
            case 'time':
                error = validateTime(value);
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
            case 'price':
                setPrice(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'time':
                setTime(value);
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

    const validar = async () => {
        if (errors.name || !name.trim()) {
            show_alerta(errors.name || 'Por favor, complete el nombre del servicio.', 'warning');
            return;
        }

        // Verifica la existencia
        if (operation === 1) {
            const serviceExists = await checkIfServiceExists(name.trim());

            if (serviceExists) {
                show_alerta('El servicio con este nombre ya existe. Por favor, elija otro nombre.', 'warning');
                return;
            }
        }

        const isValidName = !validateName(name);
        const isValidPrice = !validatePrice(price);
        const isValidPriceFormat = !validatePriceFormat(price);
        const isValidDescription = !validateDescription(description);
        const isValidTime = !validateTime(time);

        if (!isValidName) show_alerta(errors.name, 'warning');
        else if (!isValidPrice) show_alerta(errors.price, 'warning');
        else if (!isValidPriceFormat) show_alerta(errors.price, 'warning');
        else if (!isValidDescription) show_alerta(errors.description, 'warning');
        else if (!isValidTime) show_alerta(errors.time, 'warning');
        else {
            const parametros = {
                id: id,
                name: name.trim(),
                price: price,
                description: description.trim(),
                time: time,
                status: status,
            };

            const isUpdate = operation === 2;
            const metodo = isUpdate ? 'PUT' : 'POST';
            enviarSolicitud(metodo, parametros);
        }
    };

    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
        try {
            await axios({ method: metodo, url: urlWithId, data: parametros });
            show_alerta('Operación exitosa', 'success');
            if (metodo === 'PUT' || metodo === 'POST') {
                document.getElementById('btnCerrar').click();
            }
            getServices();
            console.log(parametros);
        } catch (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
            console.log(parametros);
        }
    };

    const handleCloseDetail = () => {
        setShowModal(false);
        setShowDetailModal(false);
    };

    const handleViewDetails = (service) => {
        setDetailData(service);
        setShowDetailModal(true);
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
                const updatedService = {
                    ...serviceToUpdate,
                    status: checked ? 'A' : 'I'
                };
                try {
                    const response = await axios.put(`${url}/${serviceId}`, updatedService);
                    if (response.status === 200) {
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
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained"><BsPlusSquareFill />Registrar</Button>
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
                                        results.map((service, i) => (
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
                                                        <Button color='primary' className='primary' onClick={() => handleViewDetails(service)}><FaEye /></Button>
                                                        {
                                                            service.status === 'A' && (
                                                                <>
                                                                    <Button color="secondary" className='secondary' onClick={() => openModal(2, service.id, service.name, service.price, service.description, service.time)}><FaPencilAlt /></Button>
                                                                    <Button color='error' className='delete' onClick={() => deleteService(service.id, service.name)}><IoTrashSharp /></Button>
                                                                </>
                                                            )
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            <div className="d-flex table-footer">
                                <Pagination 
                                setCurrentPages = {setCurrentPages} 
                                currentPages={currentPages}
                                nPages = {nPages}/>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal show={showModal}>
                    <Modal.Header>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>Nombre</Form.Label>
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
                                <Form.Label>Precio</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={price}
                                    placeholder="Precio"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.price && !!errors.price}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.price}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea" rows={2}
                                    name="description"
                                    value={description}
                                    placeholder="Descripcion"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.description && !!errors.description}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Tiempo</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="time"
                                    value={time}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.time && !!errors.time}
                                >
                                    <option hidden="">Tiempo</option>
                                    <option value="20">20 Minutos</option>
                                    <option value="30">30 Minutos</option>
                                    <option value="45">45 Minutos</option>
                                    <option value="60">60 Minutos</option>
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.time}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={validar} className='btn-sucess'>
                            Guardar
                        </Button>
                        <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
                            Cerrar                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showDetailModal} onHide={handleCloseDetail}>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalle Servicio</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Nombre:</strong> {detailData.name}</p>
                        <p><strong>Precio:</strong> {detailData.price}</p>
                        <p><strong>Descripción:</strong> {detailData.description}</p>
                        <p><strong>Tiempo:</strong> {detailData.time === 20 ? '20 Minutos' : detailData.time === 30 ? '30 Minutos' : detailData.time === 45 ? '45 Minutos' : detailData.time === 60 ? '60 Minutos' : 'Desconocido'}</p>
                        <p><strong>Estado:</strong> {detailData.status === 'A' ? 'Activo' : 'Inactivo'}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseDetail}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}

export default Services;
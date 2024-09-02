import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import { MdCategory } from "react-icons/md";
import { IoCart } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
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
import { BsPlusSquareFill } from "react-icons/bs";


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

const Categories = () => {
    const url = 'http://localhost:1056/api/categories';
    const [categories, setCategories] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
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
        description: '',
    });

    const [touched, setTouched] = useState({
        name: false,
        description: false,
    });


    useEffect(() => {
        getCategories();
    }, [])

    const getCategories = async () => {
        const response = await axios.get(url);
        setCategories(response.data);
    }

    const searcher = (e) => {
        setSearch(e.target.value);
        console.log(e.target.value)
    }

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(categories.length / dataQt);

    let results = []
    if (!search) {
        results = categories.slice(indexStart,indexEnd);
    } else{
        results = categories.filter((dato) => dato.name.toLowerCase().includes(search.toLocaleLowerCase()))
    }

    const openModal = (op, id, name,description) => {
        setId('');
        setName('');
        setDescription('');
        setStatus('A');
        setOperation(op);

        if (op === 1) {
            setTitle('Registrar servicio');
        } else if (op === 2) {
            setTitle('Editar servicio');
            setId(id);
            setName(name);
            setDescription(description);
        }
        setShowModal(true);
    }

    const handleClose = () => {
        setId('');
        setName('');
        setDescription('');
        setStatus('A');

        setErrors({
            name: '',
            description: '',
        });
        setTouched({
            name: false,
            description: false,
        });

        setShowModal(false);
    };

    const validateName = (value) => {
        const regex = /^[A-Za-z\s]+$/;
        return regex.test(value) ? '' : 'El nombre solo debe contener letras';
    };

    const checkIfCategoryExists = async (name) => {
        try {
            const response = await axios.get(`${url}`, {
                params: { name }
            });
            return response.data.some(category => category.name.trim().toLowerCase() === name.trim().toLowerCase());
        } catch (error) {
            console.error('Error al verificar la existencia del servicio:', error);
            return false;
        }
    };

    const validateDescription = (value) => {
        if (value.length < 10 || value.length > 500) {
            return 'La descripción debe tener entre 10 y 500 caracteres';
        }
        return '';
    };

    const handleValidation = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                error = validateName(value);
                break;
            case 'description':
                error = validateDescription(value);
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
            case 'description':
                setDescription(value);
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
            const serviceExists = await checkIfCategoryExists(name.trim());

            if (serviceExists) {
                show_alerta('El servicio con este nombre ya existe. Por favor, elija otro nombre.', 'warning');
                return;
            }
        }

        const isValidName = !validateName(name);
        const isValidDescription = !validateDescription(description);
        if (!isValidName) show_alerta(errors.name, 'warning');
        else if (!isValidDescription) show_alerta(errors.description, 'warning');
        else {
            const parametros = {
                id: id,
                name: name.trim(),
                description: description.trim(),
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
            getCategories();
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

    const handleViewDetails = (category) => {
        setDetailData(category);
        setShowDetailModal(true);
    };

    const deleteCategory = async (id, name) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: 'Estas seguro que desea eliminar la categoria ' + name + '?',
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

    const handleSwitchChange = async (categoryId, checked) => {
        // Encuentra el servicio que está siendo actualizado
        const categoryToUpdate = categories.find(category => category.id === categoryId);
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} la categoria "${categoryToUpdate.name}"?`,
            icon: 'question',
            text: 'Esta acción puede afectar la disponibilidad del servicio.',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedCategory = {
                    ...categoryToUpdate,
                    status: checked ? 'A' : 'I'
                };
                try {
                    const response = await axios.put(`${url}/${categoryId}`, updatedCategory);
                    if (response.status === 200) {
                        setCategories(categories.map(category =>
                            category.id === categoryId ? { ...category, status: updatedCategory.status } : category
                        ));
                        show_alerta('Estado de la categoria actualizado exitosamente', 'success');
                    }
                } catch (error) {
                    if (error.response) {
                        console.log('Error details:', error.response.data);
                        show_alerta('Error al actualizar el estado de la categoria: ' + JSON.stringify(error.response.data.errors), 'error');
                    } else {
                        console.log('Error details:', error.message);
                        show_alerta('Error al actualizar el estado de la categoria', 'error');
                    }
                }
            } else {
                // Si el usuario cancela, restablece el switch a su estado original
                setCategories(categories.map(category =>
                    category.id === categoryId ? { ...category, status: !checked ? 'A' : 'I' } : category
                ));
                show_alerta('Estado de la categoria no cambiado', 'info');
            }
        });
    };

    return (
        <>
            <div className="right-content w-100">
                <div class="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Categorias</span>
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
                                        label="Ingresos"
                                        icon={<IoCart fontSize="small" />}
                                    />
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Categorias"
                                        icon={<MdCategory fontSize="small" />}
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
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { results.length > 0 ? (
                                        results.map((category, i) => (
                                            <tr key={category.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{category.name}</td>
                                                <td>{category.description}</td>
                                                <td><span  className= {`serviceStatus ${category.status ===  'A' ? '' : 'Inactive'}`}>{category.status === 'A' ? 'Activo' : 'Inactivo'}</span></td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Switch
                                                            checked={category.status === 'A'}
                                                            onChange={(e) => handleSwitchChange(category.id, e.target.checked)}
                                                        />
                                                        <Button color='primary' className='primary' onClick={() => handleViewDetails(category)}><FaEye /></Button>
                                                        {
                                                            category.status === 'A' && (
                                                                <>
                                                                    <Button color="secondary" className='secondary' onClick={() => openModal(2, category.id, category.name, category.description)}><FaPencilAlt /></Button>
                                                                    <Button color='error' className='delete' onClick={() => deleteCategory(category.id, category.name)}><IoTrashSharp /></Button>
                                                                </>
                                                            )
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ): (
                                        <tr>
                                            <td colSpan={7} className='text-center'>
                                                No hay categorias disponibles
                                            </td>
                                        </tr>
                                    )
                                        
                                    }
                                </tbody>
                            </table>
                            {
                                results.length > 0 ? (
                                    <div className="d-flex table-footer">
                                        <Pagination
                                            setCurrentPages={setCurrentPages}
                                            currentPages={currentPages}
                                            nPages={nPages} />
                                    </div>
                                ) : (<div className="d-flex table-footer">
                                </div>)
                            }
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
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={validar} className='btn-sucess'>
                            Guardar
                        </Button>
                        <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showDetailModal} onHide={handleCloseDetail}>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalle categoria</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Nombre:</strong> {detailData.name}</p>
                        <p><strong>Descripción:</strong> {detailData.description}</p>
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

export default Categories;
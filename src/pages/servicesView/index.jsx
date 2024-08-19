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
                                                <td>{service.status}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Button color='primary' className='primary'><FaEye /></Button>
                                                        <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalServices' className='secondary' onClick={() => openModal(2, service.id, service.name, service.price, service.description, service.time, service.status)}><FaPencilAlt /></Button>
                                                        <Button color='error' className='delete'><IoTrashSharp /></Button>
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
                                    <input type="text" id="price" className="form-control" placeholder="Precio"
                                        value={price} onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" id="description" className="form-control" placeholder="Descripcion"
                                        value={description} onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" id="time" className="form-control" placeholder="Tiempo"
                                        value={time} onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" id="status" className="form-control" placeholder="Estado"
                                        value={status} onChange={(e) => setStatus(e.target.value)}
                                    />
                                </div>
                                <div className='d-grid col-4 mx-auto'>
                                    <Button type='button' className='btn-sucess'>Guardar</Button>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <Button type='button' className='btn-blue' data-bs-dismiss='modal'>Cerrar</Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Services;
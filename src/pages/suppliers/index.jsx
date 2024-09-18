import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { MdOutlineSave } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import Pagination from '../../components/pagination/index';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import Switch from '@mui/material/Switch';
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
});

const BlueSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: blue[600],
        '&:hover': {
            backgroundColor: alpha(blue[600], theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: blue[600],
    },
}));

const Suppliers = () => {
    const url = 'http://localhost:1056/api/suppliers';
    const [suppliers, setSuppliers] = React.useState([]);
    const [id, setId] = React.useState('');
    const [Supplier_Name, setSupplierName] = React.useState('');
    const [Phone_Number, setPhoneNumber] = React.useState('');
    const [Email, setEmail] = React.useState('');
    const [Address, setAddress] = React.useState('');
    const [Status, setStatus] = React.useState(true);
    const [operation, setOperation] = React.useState(1);
    const [title, setTitle] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [dataQt, setDataQt] = React.useState(3);
    const [currentPages, setCurrentPages] = React.useState(1);

    React.useEffect(() => {
        getSuppliers();
    }, [])

    const getSuppliers = async () => {
        try {
            const response = await axios.get(url);
            setSuppliers(response.data);
        } catch (error) {
            show_alerta('Error al obtener proveedores', 'error');
        }
    }

    const searcher = (e) => {
        setSearch(e.target.value);
    }

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(suppliers.length / dataQt);

    let results = []
    if (!search) {
        results = suppliers.slice(indexStart, indexEnd);
    } else {
        results = suppliers.filter((dato) => dato.Supplier_Name.toLowerCase().includes(search.toLocaleLowerCase()))
    }

    const openModal = (op, id, Supplier_Name, Phone_Number, Email, Address, Status) => {
        setId('');
        setSupplierName('');
        setPhoneNumber('');
        setEmail('');
        setAddress('');
        setStatus(true);
        setOperation(op);

        if (op === 1) {
            setTitle('Registrar proveedor');
        } else if (op === 2) {
            setTitle('Editar proveedor');
            setId(id);
            setSupplierName(Supplier_Name);
            setPhoneNumber(Phone_Number);
            setEmail(Email);
            setAddress(Address);
            setStatus(Status);
        }
        window.setTimeout(function () {
            document.getElementById('Supplier_Name').focus();
        }, 500)
    }

    const validar = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d+$/;

        if (Supplier_Name.trim() === '') {
            show_alerta('Escriba el nombre del proveedor', 'warning')
        } else if (Phone_Number.trim() === '' || !phoneRegex.test(Phone_Number.trim())) {
            show_alerta('Escriba un número de teléfono válido', 'warning')
        } else if (Email.trim() === '' || !emailRegex.test(Email.trim())) {
            show_alerta('Escriba un correo electrónico válido', 'warning')
        } else if (Address.trim() === '') {
            show_alerta('Escriba la dirección', 'warning')
        } else {
            const parametros = {
                Supplier_Name: Supplier_Name.trim(),
                Phone_Number: Phone_Number.trim(),
                Email: Email.trim(),
                Address: Address.trim(),
                status: Status
            };
            const metodo = operation === 1 ? 'POST' : 'PUT';
            if (operation !== 1) {
                parametros.id = id;
            }
            enviarSolicitud(metodo, parametros);
        }
    }
    const handleSwitchChange = async (supplierId, checked) => {
        const supplierToUpdate = suppliers.find(supplier => supplier.id === supplierId);
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} el proveedor "${supplierToUpdate.Supplier_Name}"?`,
            icon: 'question',
            text: 'Esta acción puede afectar la disponibilidad del proveedor.',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedSupplier = {
                    ...supplierToUpdate,
                    status: checked ? 'A' : 'I'
                };
                try {
                    const response = await axios.put(`${url}/${supplierId}`, updatedSupplier);
                    if (response.status === 200) {
                        setSuppliers(suppliers.map(supplier =>
                            supplier.id === supplierId ? { ...supplier, status: updatedSupplier.status } : supplier
                        ));
                        show_alerta('Estado del proveedor actualizado exitosamente', 'success');
                    }
                } catch (error) {
                    if (error.response) {
                        console.log('Error details:', error.response.data);
                        show_alerta('Error al actualizar el estado del proveedor: ' + JSON.stringify(error.response.data.errors), 'error');
                    } else {
                        console.log('Error details:', error.message);
                        show_alerta('Error al actualizar el estado del proveedor', 'error');
                    }
                }
            } else {
                setSuppliers(suppliers.map(supplier =>
                    supplier.id === supplierId ? { ...supplier, status: !checked ? 'A' : 'I' } : supplier
                ));
                show_alerta('Estado del proveedor no cambiado', 'info');
            }
        });
    };
    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
        try {
            await axios({ method: metodo, url: urlWithId, data: parametros });
            show_alerta('Operación exitosa', 'success');
            document.getElementById('btnCerrar').click();
            getSuppliers();
        } catch (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
        }
    }

    const deleteSupplier = async (id, Supplier_Name) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas eliminar el proveedor ${Supplier_Name}?`,
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
                show_alerta('El proveedor NO fue eliminado', 'info');
            }
        });
    }

    const handleViewDetails = (supplier) => {
        Swal.fire({
            title: 'Detalles del Proveedor',
            html: `
                <div class="text-left">
                    <p><strong>Nombre:</strong> ${supplier.Supplier_Name}</p>
                    <p><strong>Teléfono:</strong> ${supplier.Phone_Number}</p>
                    <p><strong>Email:</strong> ${supplier.Email}</p>
                    <p><strong>Dirección:</strong> ${supplier.Address}</p>
                    <p><strong>Estado:</strong> ${supplier.Status ? 'Activo' : 'Inactivo'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    }

    const toggleStatus = async (id, currentStatus) => {
        try {
            await axios.put(`${url}/${id}`, { Status: !currentStatus });
            getSuppliers();
            show_alerta('Estado actualizado con éxito', 'success');
        } catch (error) {
            show_alerta('Error al actualizar el estado', 'error');
            console.log(error);
        }
    }

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Proveedores</span>
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
                                        label="Proveedores"
                                        icon={<GiHairStrands fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained" data-bs-toggle='modal' data-bs-target='#modalSuppliers'><BsPlusSquareFill />Registrar</Button>
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
                                        <th>Teléfono</th>
                                        <th>Email</th>
                                        <th>Dirección</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((supplier, i) => (
                                        <tr key={supplier.id}>
                                            <td>{(i + 1)}</td>
                                            <td>{supplier.Supplier_Name}</td>
                                            <td>{supplier.Phone_Number}</td>
                                            <td>{supplier.Email}</td>
                                            <td>{supplier.Address}</td>
                                            <td>
                                                <BlueSwitch
                                                    checked={supplier.status === 'A'}
                                                    onChange={(e) => handleSwitchChange(supplier.id, e.target.checked)}
                                                />
                                                <span className={`serviceStatus ${supplier.status === 'A' ? '' : 'Inactive'}`}>
                                                    {supplier.status === 'A' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className='actions d-flex align-items-center'>
                                                    <Button color='primary' className='primary' onClick={() => handleViewDetails(supplier)}><FaEye /></Button>
                                                    {
                                                        supplier.status === 'A' && (
                                                            <>
                                                                <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalSuppliers' className='secondary' onClick={() => openModal(2, supplier.id, supplier.Supplier_Name, supplier.Phone_Number, supplier.Email, supplier.Address, supplier.status)}><FaPencilAlt /></Button>
                                                                <Button color='error' className='delete' onClick={() => deleteSupplier(supplier.id, supplier.Supplier_Name)}><IoTrashSharp /></Button>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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

                <div id="modalSuppliers" className="modal fade" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <label className="h5">{title}</label>
                            </div>
                            <div className="modal-body">
                                <input type="hidden" id="id"></input>
                                <div className="input-group mb-3">
                                    <input type="text" id="Supplier_Name" className="form-control" placeholder="Nombre" value={Supplier_Name} onChange={(e) => setSupplierName(e.target.value)} />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" id="Phone_Number" className="form-control" placeholder="Teléfono" value={Phone_Number} onChange={(e) => setPhoneNumber(e.target.value)} />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="email" id="Email" className="form-control" placeholder="Email" value={Email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="input-group mb-3">
                                    <input type="text" id="Address" className="form-control" placeholder="Dirección" value={Address} onChange={(e) => setAddress(e.target.value)} />
                                </div>

                                <div className='modal-footer w-100 m-3'>
                                    <div className='d-grid col-3 Modal-buton' onClick={() => validar()}>
                                        <Button type='button' className='btn-sucess'><MdOutlineSave />Guardar</Button>
                                    </div>
                                    <Button type='button' id='btnCerrar' className='btn-red' data-bs-dismiss='modal'>Cerrar</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Suppliers;
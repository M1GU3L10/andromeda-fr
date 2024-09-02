import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiShoppingCart } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { MdOutlineSave } from "react-icons/md";
import SearchBox from '../../components/SearchBox';
import Pagination from '@mui/material/Pagination';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
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

const Orders = () => {
    const url = 'http://localhost:1056/api/orders';
    const [orders, setOrders] = React.useState([]);
    const [id, setId] = React.useState('');
    const [Order_Date, setOrderDate] = React.useState('');
    const [Order_Time, setOrderTime] = React.useState('');
    const [Total_Amount, setTotalAmount] = React.useState('');
    const [Status, setStatus] = React.useState('');
    const [User_Id, setUserId] = React.useState('');
    const [Token_Expiration, setTokenExpiration] = React.useState('');
    const [operation, setOperation] = React.useState(1);
    const [title, setTitle] = React.useState('');

    React.useEffect(() => {
        getOrders();
    }, [])

    const getOrders = async () => {
        try {
            const response = await axios.get(url);
            setOrders(response.data);
        } catch (error) {
            show_alerta('Error al obtener órdenes', 'error');
        }
    }

    const openModal = (op, id, Order_Date, Order_Time, Total_Amount, Status, User_Id, Token_Expiration) => {
        setId('');
        setOrderDate('');
        setOrderTime('');
        setTotalAmount('');
        setStatus('');
        setUserId('');
        setTokenExpiration('');
        setOperation(op);

        if (op === 1) {
            setTitle('Registrar orden');
        } else if (op === 2) {
            setTitle('Editar orden');
            setId(id);
            setOrderDate(Order_Date);
            setOrderTime(Order_Time);
            setTotalAmount(Total_Amount);
            setStatus(Status);
            setUserId(User_Id);
            setTokenExpiration(Token_Expiration);
        }
        window.setTimeout(function () {
            document.getElementById('Order_Date').focus();
        }, 500)
    }

    const validar = () => {
        const amountRegex = /^\d+(\.\d{1,2})?$/;

        if (Order_Date.trim() === '') {
            show_alerta('Escriba la fecha de la orden', 'warning')
        } else if (Order_Time.trim() === '') {
            show_alerta('Escriba la hora de la orden', 'warning')
        } else if (Total_Amount.trim() === '' || !amountRegex.test(Total_Amount.trim())) {
            show_alerta('Escriba un monto total válido', 'warning')
        } else if (Status.trim() === '') {
            show_alerta('Escriba el estado de la orden', 'warning')
        } else {
            const parametros = {
                Order_Date: Order_Date.trim(),
                Order_Time: Order_Time.trim(),
                Total_Amount: Total_Amount.trim(),
                Status: Status.trim(),
                User_Id: User_Id.trim(),
                Token_Expiration: Token_Expiration.trim()
            };
            const metodo = operation === 1 ? 'POST' : 'PUT';
            if (operation !== 1) {
                parametros.id = id;
            }
            enviarSolicitud(metodo, parametros);
        }
    }

    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
        try {
            await axios({ method: metodo, url: urlWithId, data: parametros });
            show_alerta('Operación exitosa', 'success');
            document.getElementById('btnCerrar').click();
            getOrders();
        } catch (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
        }
    }

    const deleteOrder = async (id, Order_Date) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas eliminar la orden del ${Order_Date}?`,
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
                show_alerta('La orden NO fue eliminada', 'info');
            }
        });
    }

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Órdenes</span>
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
                                        label="Órdenes"
                                        icon={<GiShoppingCart fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained" data-bs-toggle='modal' data-bs-target='#modalOrders'><BsPlusSquareFill />Registrar</Button>
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
                                        <th>Fecha</th>
                                        <th>Hora</th>
                                        <th>Monto Total</th>
                                        <th>Estado</th>
                                        <th>Usuario ID</th>
                                        <th>Expiración Token</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, i) => (
                                        <tr key={order.id}>
                                            <td>{(i + 1)}</td>
                                            <td>{new Date(order.Order_Date).toLocaleDateString()}</td>
                                            <td>{order.Order_Time}</td>
                                            <td>{order.Total_Amount}</td>
                                            <td>{order.Status}</td>
                                            <td>{order.User_Id}</td>
                                            <td>{new Date(order.Token_Expiration).toLocaleDateString()}</td>
                                            <td>
                                                <div className='actions d-flex align-items-center'>
                                                    <Button color='primary' className='primary'><FaEye /></Button>
                                          
                                                    <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalOrders' className='secondary' onClick={() => openModal(2, order.id, order.Order_Date, order.Order_Time, order.Total_Amount, order.Status, order.User_Id, order.Token_Expiration)}><FaPencilAlt /></Button>
                                                    <Button color='error' className='delete' onClick={() => deleteOrder(order.id, order.Order_Date)}><IoTrashSharp /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Paginação */}
                            <div className='d-flex justify-content-center mt-3'>
                                <Pagination count={10} variant="outlined" shape="rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para registrar o editar órdenes */}
            <div className="modal fade" id="modalOrders" tabIndex="-1" aria-labelledby="modalOrdersLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalOrdersLabel">{title}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-sm-6">
                                    <div className="mb-3">
                                        <label htmlFor="Order_Date" className="form-label">Fecha de Orden</label>
                                        <input type="date" className="form-control" id="Order_Date" value={Order_Date} onChange={(e) => setOrderDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="mb-3">
                                        <label htmlFor="Order_Time" className="form-label">Hora de Orden</label>
                                        <input type="time" className="form-control" id="Order_Time" value={Order_Time} onChange={(e) => setOrderTime(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Total_Amount" className="form-label">Monto Total</label>
                                <input type="number" step="0.01" className="form-control" id="Total_Amount" value={Total_Amount} onChange={(e) => setTotalAmount(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Status" className="form-label">Estado</label>
                                <input type="text" className="form-control" id="Status" value={Status} onChange={(e) => setStatus(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="User_Id" className="form-label">Usuario ID</label>
                                <input type="text" className="form-control" id="User_Id" value={User_Id} onChange={(e) => setUserId(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Token_Expiration" className="form-label">Expiración Token</label>
                                <input type="date" className="form-control" id="Token_Expiration" value={Token_Expiration} onChange={(e) => setTokenExpiration(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</Button>
                            <Button type="button" className="btn btn-primary" onClick={validar}>{operation === 1 ? 'Registrar' : 'Actualizar'}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Orders;

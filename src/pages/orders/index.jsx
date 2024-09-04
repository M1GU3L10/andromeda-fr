
// import * as React from 'react';
// import { emphasize, styled } from '@mui/material/styles';
// import axios from 'axios';
// import Breadcrumbs from '@mui/material/Breadcrumbs';
// import Chip from '@mui/material/Chip';
// import HomeIcon from '@mui/icons-material/Home';
// import { MdOutlineShoppingCartCheckout } from "react-icons/md";
// import { FaMoneyBillWave } from "react-icons/fa";
// import Button from '@mui/material/Button';
// import { BsPlusSquareFill } from "react-icons/bs";
// import { FaEye } from "react-icons/fa";
// import { FaPencilAlt } from "react-icons/fa";
// import { IoTrashSharp } from "react-icons/io5";
// import SearchBox from '../../components/SearchBox';
// import Pagination from '@mui/material/Pagination';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
// import Modal from '@mui/material/Modal';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';
// import Typography from '@mui/material/Typography';
// import { show_alerta } from '../../assets/functions';
// import withReactContent from 'sweetalert2-react-content';
// import Swal from 'sweetalert2';

// const StyledBreadcrumb = styled(Chip)(({ theme }) => {
//     const backgroundColor =
//         theme.palette.mode === 'light'
//             ? theme.palette.grey[100]
//             : theme.palette.grey[800];
//     return {
//         backgroundColor,
//         height: theme.spacing(3),
//         color: theme.palette.text.primary,
//         fontWeight: theme.typography.fontWeightRegular,
//         '&:hover, &:focus': {
//             backgroundColor: emphasize(backgroundColor, 0.06),
//         },
//         '&:active': {
//             boxShadow: theme.shadows[1],
//             backgroundColor: emphasize(backgroundColor, 0.12),
//         },
//     };
// });

// const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 400,
//     bgcolor: 'background.paper',
//     borderRadius: '8px',
//     boxShadow: 24,
//     p: 4,
// };

// const Orders = () => {
//     const [columnsPerPage, setColumnsPerPage] = React.useState('');
//     const [open, setOpen] = React.useState(false);
//     const [openView, setOpenView] = React.useState(false);
//     const [openEdit, setOpenEdit] = React.useState(false);
//     const [viewData, setViewData] = React.useState({});
//     const [formData, setFormData] = React.useState({
//         Order_Date: '',
//         Order_Time: '',
//         Total_Amount: '',
//         Status: 'Pending',
//         Order_Id<formErrors className="Order_Id"></formErrors>: '',
//     });
//     const [orderData, setOrderData] = React.useState([]);
//     const [loading, setLoading] = React.useState(true);
//     const [error, setError] = React.useState(null);
//     const [formErrors, setFormErrors] = React.useState({});

//     React.useEffect(() => {
//         fetchOrderData();
//     }, []);

//     const fetchOrderData = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get('http://localhost:1056/api/orders');
//             setOrderData(response.data);
//             setLoading(false);
//         } catch (err) {
//             setError('Error fetching data');
//             setLoading(false);
//         }
//     };

//     const handleChange = (event) => {
//         setColumnsPerPage(event.target.value);
//     };

//     const handleOpen = () => setOpen(true);
//     const handleClose = () => {
//         setOpen(false);
//         setFormData({
//             Order_Date: '',
//             Order_Time: '',
//             Total_Amount: '',
//             Status: 'Pending',
//             Order_Id<formErrors className="Order_Id"></formErrors>: '',
//         });
//         setFormErrors({});
//     };

//     const handleViewOpen = (data) => {
//         setViewData(data);
//         setOpenView(true);
//     };

//     const handleViewClose = () => setOpenView(false);

//     const handleEditOpen = (data) => {
//         setFormData(data);
//         setOpenEdit(true);
//     };

//     const handleEditClose = () => {
//         setOpenEdit(false);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const validateForm = () => {
//         let errors = {};
//         if (!formData.Order_Date) errors.Order_Date = 'La fecha del pedido es obligatoria';
//         if (!formData.Order_Time) errors.Order_Time = 'La hora del pedido es obligatoria';
//         if (!formData.Total_Amount || isNaN(formData.Total_Amount) || formData.Total_Amount < 0) errors.Total_Amount = 'El monto total debe ser un número positivo';
//         if (!formData.Status) errors.Status = 'El estado es obligatorio';
//         if (!formData.Order_Id<formErrors className="Order_Id"></formErrors> || isNaN(formData.Order_Id<formErrors className="Order_Id"></formErrors>)) errors.Order_Id<formErrors className="Order_Id"></formErrors> = 'El ID de usuario debe ser un número válido';

//         return errors;
//     };

//     const handleSubmit = async () => {
//         const errors = validateForm();
//         if (Object.keys(errors).length === 0) {
//             try {
//                 const response = await axios.post('http://localhost:1056/api/orders', formData);
//                 if (response.status === 201) {
//                     handleClose();
//                     fetchOrderData();
//                     show_alerta('Pedido agregado exitosamente', 'success');
//                 }
//             } catch (err) {
//                 console.error('Error submitting form:', err);
//                 if (err.response && err.response.data) {
//                     setFormErrors(err.response.data.errors.reduce((acc, curr) => {
//                         acc[curr.param] = curr.msg;
//                         return acc;
//                     }, {}));
//                 } else {
//                     console.error('Error desconocido:', err);
//                 }
//                 show_alerta('Error al agregar el pedido', 'error');
//             }
//         } else {
//             setFormErrors(errors);
//         }
//     };

//     const handleUpdate = async () => {
//         const errors = validateForm();
//         if (Object.keys(errors).length === 0) {
//             try {
//                 await axios.put(`http://localhost:1056/api/orders/${formData.id}`, formData);
//                 handleEditClose();
//                 fetchOrderData();
//                 show_alerta('Pedido actualizado exitosamente', 'success');
//             } catch (err) {
//                 console.error('Error updating order:', err);
//                 if (err.response && err.response.data) {
//                     setFormErrors(err.response.data.errors.reduce((acc, curr) => {
//                         acc[curr.param] = curr.msg;
//                         return acc;
//                     }, {}));
//                 } else {
//                     console.error('Error desconocido:', err);
//                 }
//                 show_alerta('Error al actualizar el pedido', 'error');
//             }
//         } else {
//             setFormErrors(errors);
//         }
//     };

//     const handleDelete = async (id) => {
//         const MySwal = withReactContent(Swal);
//         MySwal.fire({
//             title: `¿Estás seguro que deseas eliminar el pedido #${id}?`,
//             icon: 'question',
//             text: 'No se podrá dar marcha atrás',
//             showCancelButton: true,
//             confirmButtonText: 'Sí, eliminar',
//             cancelButtonText: 'Cancelar'
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     await axios.delete(`http://localhost:1056/api/orders/${id}`);
//                     fetchOrderData();
//                     show_alerta('Pedido eliminado exitosamente', 'success');
//                 } catch (err) {
//                     console.error('Error deleting order:', err);
//                     show_alerta('Error al eliminar el pedido', 'error');
//                 }
//             } else {
//                 show_alerta('El pedido NO fue eliminado', 'info');
//             }
//         });
//     };

//     return (
//         <>
//             <div className="right-content w-100">
//                 <div className="row d-flex align-items-center w-100">
//                     <div className="spacing d-flex align-items-center">
//                         <div className='col-sm-5'>
//                             <span className='Title'>Gestión de Pedidos</span>
//                         </div>
//                         <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
//                             <div role="presentation">
//                                 <Breadcrumbs aria-label="breadcrumb">
//                                     <StyledBreadcrumb
//                                         component="a"
//                                         href="#"
//                                         label="Home"
//                                         icon={<HomeIcon fontSize="small" />}
//                                     />
//                                     <StyledBreadcrumb
//                                         component="a"
//                                         href="#"
//                                         label="Salidas"
//                                         icon={<FaMoneyBillWave fontSize="small" />}
//                                     />
//                                     <StyledBreadcrumb
//                                         component="a"
//                                         href="#"
//                                         label="Pedidos"
//                                         icon={<MdOutlineShoppingCartCheckout fontSize="small" />}
//                                     />
//                                 </Breadcrumbs>
//                             </div>
//                         </div>
//                     </div>
//                     <div className='card shadow border-0 p-3'>
//                         <div className='row'>
//                             <div className='col-sm-5 d-flex align-items-center'>
//                                 <Button className='btn-register' onClick={handleOpen} variant="contained"><BsPlusSquareFill />Registrar</Button>
//                             </div>
//                             <div className='col-sm-3 d-flex align-items-center cardFilters'>
//                                 <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
//                                     <InputLabel id="columns-per-page-label">Columnas</InputLabel>
//                                     <Select
//                                         labelId="columns-per-page-label"
//                                         id="columns-per-page-select"
//                                         value={columnsPerPage}
//                                         label="Columnas"
//                                         onChange={handleChange}
//                                     >
//                                         <MenuItem value={12}>12</MenuItem>
//                                         <MenuItem value={24}>24</MenuItem>
//                                         <MenuItem value={36}>36</MenuItem>
//                                         <MenuItem value={48}>48</MenuItem>
//                                     </Select>
//                                 </FormControl>
//                             </div>
//                             <div className='col-sm-4 d-flex align-items-center justify-content-end'>
//                                 <SearchBox />
//                             </div>
//                         </div>
//                         <div className='table-responsive mt-3'>
//                             {loading ? (
//                                 <p>Cargando...</p>
//                             ) : error ? (
//                                 <p>{error}</p>
//                             ) : (
//                                 <table className='table table-bordered table-hover v-align'>
//                                     <thead className='table-primary'>
//                                         <tr>
//                                             <th>#</th>
//                                             <th>Fecha</th>
//                                             <th>Hora</th>
//                                             <th>Monto Total</th>
//                                             <th>Estado</th>
//                                             <th>ID Usuario</th>
//                                             <th>Acciones</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {orderData.map((order, i) => (
//                                             <tr key={order.id}>
//                                                 <td>{(i + 1)}</td>
//                                                 <td>{new Date(order.Order_Date).toLocaleDateString()}</td>
//                                                 <td>{order.Order_Time}</td>
//                                                 <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.Total_Amount)}</td>
//                                                 <td>{order.Status}</td>
//                                                 <td>{order.Order_Id<formErrors className="Order_Id"></formErrors>}</td>
//                                                 <td>
//                                                     <div className='actions d-flex align-items-center'>
//                                                         <Button color='primary' className='primary' onClick={() => handleViewOpen(order)}><FaEye /></Button>
//                                                         <Button color="secondary" className='secondary' onClick={() => handleEditOpen(order)}><FaPencilAlt /></Button>
//                                                         <Button color='error' className='delete' onClick={() => handleDelete(order.id)}><IoTrashSharp /></Button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             )}
//                             <div className="d-flex table-footer">
//                                 <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Modal para agregar pedido */}
//             <Modal
//                 open={open}
//                 onClose={handleClose}
//             >
//                 <Box sx={style}>
//                     <Typography variant="h6" component="h2">
//                         Agregar Pedido
//                     </Typography>
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         type="date"
//                         label="Fecha del Pedido"
//                         name="Order_Date"
//                         value={formData.Order_Date}
//                         onChange={handleInputChange}
//                         error={!!formErrors.Order_Date}
//                         helperText={formErrors.Order_Date}
//                         InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         type="time"
//                         label="Hora del Pedido"
//                         name="Order_Time"
//                         value={formData.Order_Time}
//                         onChange={handleInputChange}
//                         error={!!formErrors.Order_Time}
//                         helperText={formErrors.Order_Time}
//                         InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         label="Monto Total"
//                         type="number"
//                         name="Total_Amount"
//                         value={formData.Total_Amount}
//                         onChange={handleInputChange}
//                         error={!!formErrors.Total_Amount}
//                         helperText={formErrors.Total_Amount}
//                     />

//                     <FormControl fullWidth margin="normal">
//                         <InputLabel id="status-label">Estado</InputLabel>
//                         <Select
//                             labelId="status-label"
//                             id="status-select"
//                             name="Status"
//                             value={formData.Status}
//                             onChange={handleInputChange}
//                             error={!!formErrors.Status}
//                         >
//                             <MenuItem value="Pending">Pendiente</MenuItem>
//                             <MenuItem value="Shipped">Enviado</MenuItem>
//                             <MenuItem value="Delivered">Entregado</MenuItem>
//                             <MenuItem value="Cancelled">Cancelado</MenuItem>
//                         </Select>
//                         {formErrors.Status && <Typography color="error">{formErrors.Status}</Typography>}
//                     </FormControl>
//                     <FormControl fullWidth margin="normal">
//                         <InputLabel id="order-label">Usuario</InputLabel>
//                         <Select
//                             labelId="order-label"
//                             id="order-select"
//                             name="Order_Id<formErrors className="Order_Id"></formErrors>"
//                             value={formData.Order_Id<formErrors className="Order_Id"></formErrors>}
//                             onChange={handleInputChange}
//                             error={!!<formErrors className="Order_Id"></formErrors>}
//                         >
//                             {users.map((order) => (
//                                 <MenuItem key={order.id} value={order.id}>{order.name}</MenuItem>
//                             ))}
//                         </Select>
//                         {<formErrors className="Order_Id"></formErrors> && <Typography color="error">{<formErrors className="Order_Id"></formErrors>}</Typography>}
//                     </FormControl>
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={handleSubmit}
//                         sx={{ mt: 2 }}
//                     >
//                         Guardar
//                     </Button>
//                 </Box>
//             </Modal>

//             {/* Modal para ver orden */}
//             <Modal
//                 open={openView}
//                 onClose={handleViewClose}
//             >
//                 <Box sx={style}>
//                     <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
//                         Ver Orden
//                     </Typography>
//                     <Typography variant="body1"><strong>ID:</strong> {viewData.id}</Typography>
//                     <Typography variant="body1"><strong>Fecha:</strong> {new Date(viewData.Order_Date).toLocaleDateString()}</Typography>
//                     <Typography variant="body1"><strong>Hora:</strong> {viewData.Order_Time}</Typography>
//                     <Typography variant="body1"><strong>Monto Total:</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(viewData.Total_Amount)}</Typography>
//                     <Typography variant="body1"><strong>Estado:</strong> {viewData.Status}</Typography>
//                     <Typography variant="body1"><strong>Usuario:</strong> {users.find(order => order.id === viewData.Order_Id<formErrors className="Order_Id"></formErrors>)?.name || 'No disponible'}</Typography>
//                 </Box>
//             </Modal>

//             {/* Modal para editar orden */}
//             <Modal
//                 open={openEdit}
//                 onClose={handleEditClose}
//             >
//                 <Box sx={style}>
//                     <Typography variant="h6" component="h2">
//                         Editar pedido
//                     </Typography>
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         type="date"
//                         label="Fecha de Orden"
//                         name="Order_Date"
//                         value={formData.Order_Date}
//                         onChange={handleInputChange}
//                         error={!!formErrors.Order_Date}
//                         helperText={formErrors.Order_Date}
//                         InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         type="time"
//                         label="Hora de Orden"
//                         name="Order_Time"
//                         value={formData.Order_Time}
//                         onChange={handleInputChange}
//                         error={!!formErrors.Order_Time}
//                         helperText={formErrors.Order_Time}
//                         InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField
//                         margin="normal"
//                         required
//                         fullWidth
//                         label="Monto Total"
//                         type="number"
//                         name="Total_Amount"
//                         value={formData.Total_Amount}
//                         onChange={handleInputChange}
//                         error={!!formErrors.Total_Amount}
//                         helperText={formErrors.Total_Amount}
//                     />
//                     <FormControl fullWidth margin="normal">
//                         <InputLabel id="status-edit-label">Estado</InputLabel>
//                         <Select
//                             labelId="status-edit-label"
//                             id="status-edit-select"
//                             name="Status"
//                             value={formData.Status}
//                             onChange={handleInputChange}
//                             error={!!formErrors.Status}
//                         >
//                             <MenuItem value="Pending">Pendiente</MenuItem>
//                             <MenuItem value="Shipped">Enviado</MenuItem>
//                             <MenuItem value="Delivered">Entregado</MenuItem>
//                             <MenuItem value="Cancelled">Cancelado</MenuItem>
//                         </Select>
//                         {formErrors.Status && <Typography color="error">{formErrors.Status}</Typography>}
//                     </FormControl>
//                     <FormControl fullWidth margin="normal">
//                         <InputLabel id="order-edit-label">Usuario</InputLabel>
//                         <Select
//                             labelId="order-edit-label"
//                             id="order-edit-select"
//                             name="Order_Id<formErrors className="Order_Id"></formErrors>"
//                             value={formData.Order_Id<formErrors className="Order_Id"></formErrors>}
//                             onChange={handleInputChange}
//                             error={!!<formErrors className="Order_Id"></formErrors>}
//                         >
//                             {users.map((order) => (
//                                 <MenuItem key={order.id} value={order.id}>{order.name}</MenuItem>
//                             ))}
//                         </Select>
//                         {<formErrors className="Order_id"></formErrors> && <Typography color="error">{<formErrors className="Order_Id"></formErrors>}</Typography>}
//                     </FormControl>
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={handleUpdate}
//                         sx={{ mt: 2 }}
//                     >
//                         Actualizar
//                     </Button>
//                 </Box>
//             </Modal>
//         </>
//     );
// };

// export default Orders;
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
import { IoSearch } from "react-icons/io5";
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.06),
    },
    '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.12),
    },
}));

const Orders = () => {
    const url = 'http://localhost:1056/api/orders';
    const usersUrl = 'http://localhost:1056/api/users';
    const [orders, setOrders] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [id, setId] = React.useState('');
    const [Order_Date, setOrderDate] = React.useState('');
    const [Order_Time, setOrderTime] = React.useState('');
    const [Total_Amount, setTotalAmount] = React.useState('');
    const [Status, setStatus] = React.useState('');
    const [User_Id, setUserId] = React.useState('');
    const [Token_Expiration, setTokenExpiration] = React.useState('');
    const [operation, setOperation] = React.useState(1);
    const [title, setTitle] = React.useState('');
    const [search, setSearch] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [ordersPerPage] = React.useState(8);

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    React.useEffect(() => {
        getOrders();
        getUsers();
    }, [])

    const getOrders = async () => {
        try {
            const response = await axios.get(url);
            setOrders(response.data);
        } catch (error) {
            show_alerta('Error al obtener órdenes', 'error');
        }
    }

    const getUsers = async () => {
        try {
            const response = await axios.get(usersUrl);
            setUsers(response.data);
        } catch (error) {
            show_alerta('Error al obtener usuarios', 'error');
        }
    }

    const searcher = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }

    const filteredOrders = orders.filter((order) =>
        order.Order_Date.toLowerCase().includes(search.toLowerCase()) ||
        order.Status.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openModal = (op, order = null) => {
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
            const today = new Date();
            setOrderDate(today.toISOString().split('T')[0]);
            setOrderTime(today.toTimeString().split(' ')[0].slice(0, 5));
            setTokenExpiration(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        } else if (op === 2 && order) {
            setTitle('Editar orden');
            setId(order.id);
            setOrderDate(order.Order_Date.split('T')[0]);
            setOrderTime(order.Order_Time);
            setTotalAmount(order.Total_Amount);
            setStatus(order.Status);
            setUserId(order.User_Id.toString());
            setTokenExpiration(order.Token_Expiration.split('T')[0]);
        }
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
            show_alerta('Seleccione el estado de la orden', 'warning')
        } else if (User_Id.trim() === '') {
            show_alerta('Seleccione un usuario', 'warning')
        } else if (Token_Expiration.trim() === '') {
            show_alerta('Seleccione la fecha de expiración del token', 'warning')
        } else {
            const parametros = {
                Order_Date: `${Order_Date}T${Order_Time}:00.000Z`,
                Order_Time,
                Total_Amount: parseFloat(Total_Amount),
                Status,
                User_Id: parseInt(User_Id),
                Token_Expiration: `${Token_Expiration}T${Order_Time}:00.000Z`
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
            const response = await axios({ method: metodo, url: urlWithId, data: parametros });
            show_alerta('Operación exitosa', 'success');
            if (metodo === 'POST') {
                showExpirationMessage(response.data.Token_Expiration);
            }
            document.getElementById('btnCerrar').click();
            getOrders();
        } catch (error) {
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
        }
    }

    const showExpirationMessage = (expirationDate) => {
        const expDate = new Date(expirationDate);
        Swal.fire({
            title: 'Pedido registrado',
            text: `El pedido expirará el ${expDate.toLocaleDateString()} a las ${expDate.toLocaleTimeString()}`,
            icon: 'info',
            confirmButtonText: 'Entendido'
        });
    }

    const deleteOrder = async (id, Order_Date) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title: `¿Estás seguro que deseas eliminar la orden del ${new Date(Order_Date).toLocaleDateString()}?`,
            icon: 'question',
            text: 'No se podrá dar marcha atrás',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarSolicitud('DELETE', { id: id });
            } else {
                show_alerta('La orden NO fue eliminada', 'info');
            }
        });
    }

    const handleViewDetails = (order) => {
        Swal.fire({
            title: 'Detalles de la Orden',
            html: `
                <p><strong>Fecha:</strong> ${new Date(order.Order_Date).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> ${order.Order_Time}</p>
                <p><strong>Monto Total:</strong> ${order.Total_Amount}</p>
                <p><strong>Estado:</strong> ${order.Status}</p>
                <p><strong>Usuario ID:</strong> ${order.User_Id}</p>
                <p><strong>Expiración Token:</strong> ${new Date(order.Token_Expiration).toLocaleDateString()}</p>
            `,
            icon: 'info'
        });
    }

    return (
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
                                {currentOrders.map((order, i) => (
                                    <tr key={order.id}>
                                        <td>{indexOfFirstOrder + i + 1}</td>
                                        <td>{new Date(order.Order_Date).toLocaleDateString()}</td>
                                        <td>{order.Order_Time}</td>
                                        <td>{order.Total_Amount}</td>
                                        <td>{order.Status}</td>
                                        <td>{order.User_Id}</td>
                                        <td>{new Date(order.Token_Expiration).toLocaleDateString()}</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary' onClick={() => handleViewDetails(order)}><FaEye /></Button>
                                                <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalOrders' className='secondary' onClick={() => openModal(2, order)}><FaPencilAlt /></Button>
                                                <Button color='error' className='delete' onClick={() => deleteOrder(order.id, order.Order_Date)}><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="d-flex justify-content-center mt-3">
                            <nav>
                                <ul className="pagination">
                                    {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }).map((_, index) => (
                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                            <button onClick={() => paginate(index + 1)} className="page-link">
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <div id="modalOrders" className="modal fade" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <label className="h5">{title}</label>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input type="hidden" id="id"></input>
                            <div className="input-group mb-3">
                                <input type="date" id="Order_Date" className="form-control" value={Order_Date} onChange={(e) => setOrderDate(e.target.value)} />
                            </div>
                            <div className="input-group mb-3">
                                <input type="time" id="Order_Time" className="form-control" value={Order_Time} onChange={(e) => setOrderTime(e.target.value)} />
                            </div>
                            <div className="input-group mb-3">
                                <input type="number" step="0.01" id="Total_Amount" className="form-control" placeholder="Monto Total" value={Total_Amount} onChange={(e) => setTotalAmount(e.target.value)} />
                            </div>
                            <div className="input-group mb-3">
                                <select id="Status" className="form-select" value={Status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="">Seleccione un estado</option>
                                    {statusOptions.map((status, index) => (
                                        <option key={index} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group mb-3">
                                <select id="User_Id" className="form-select" value={User_Id} onChange={(e) => setUserId(e.target.value)}>
                                    <option value="">Seleccione un usuario</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group mb-3">
                                <input type="date" id="Token_Expiration" className="form-control" value={Token_Expiration} onChange={(e) => setTokenExpiration(e.target.value)} />
                            </div>
                            <div className='d-grid col-6 mx-auto'>
                                <Button onClick={() => validar()} className='btn-success'><MdOutlineSave />Guardar</Button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button type="button" id='btnCerrar' className='btn-red' data-bs-dismiss='modal'>Cerrar</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Orders;
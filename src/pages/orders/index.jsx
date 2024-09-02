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
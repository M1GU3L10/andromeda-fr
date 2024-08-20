import * as React from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaUserCog } from "react-icons/fa";
import { RxScissors } from "react-icons/rx";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import SearchBox from '../../components/SearchBox';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import Swal from 'sweetalert2';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
        backgroundColor: emphasize(theme.palette.grey[200], 0.15),
    },
    '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.grey[200], 0.3),
    },
}));

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
};

const Programming = () => {
    const [columnsPerPage, setColumnsPerPage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [openView, setOpenView] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [viewData, setViewData] = React.useState({});
    const [formData, setFormData] = React.useState({
        startTime: '',
        endTime: '',
        status: '',
        day: '',
        userId: ''
    });
    const [programmingData, setProgrammingData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [formErrors, setFormErrors] = React.useState({});

    React.useEffect(() => {
        fetchProgrammingData();
        fetchUsers();
    }, []);

    const fetchProgrammingData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:1056/api/programming');
            setProgrammingData(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching data');
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:1056/api/users?roleId=2');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleChange = (event) => {
        setColumnsPerPage(event.target.value);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({
            startTime: '',
            endTime: '',
            status: '',
            day: '',
            userId: ''
        });
        setFormErrors({});
    };

    const handleViewOpen = (data) => {
        setViewData(data);
        setOpenView(true);
    };

    const handleViewClose = () => setOpenView(false);

    const handleEditOpen = (data) => {
        setFormData(data);
        setOpenEdit(true);
    };

    const handleEditClose = () => setOpenEdit(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Realizar validación en tiempo real para el campo actual
        let errors = { ...formErrors };

        switch (name) {
            case 'startTime':
                if (!value) {
                    errors.startTime = 'La hora de inicio es requerida';
                } else if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(value)) {
                    errors.startTime = 'La hora de inicio debe estar en formato (HH:MM:SS)';
                } else {
                    delete errors.startTime;
                }
                break;

            case 'endTime':
                if (!value) {
                    errors.endTime = 'La hora de fin es requerida';
                } else if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(value)) {
                    errors.endTime = 'La hora de fin debe estar en formato (HH:MM:SS)';
                } else if (new Date(`1970-01-01T${value}Z`) <= new Date(`1970-01-01T${formData.startTime}Z`)) {
                    errors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
                } else {
                    delete errors.endTime;
                }
                break;

            case 'status':
                if (!value) {
                    errors.status = 'El estado es requerido';
                } else if (!['pending', 'approved', 'rejected'].includes(value)) {
                    errors.status = 'El estado debe ser uno de los siguientes: pending, approved, rejected';
                } else {
                    delete errors.status;
                }
                break;

            case 'day':
                if (!value) {
                    errors.day = 'El día es requerido';
                } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    errors.day = 'El día debe estar en formato YYYY-MM-DD';
                } else {
                    delete errors.day;
                }
                break;

            case 'userId':
                if (!value) {
                    errors.userId = 'El ID de usuario es requerido';
                } else {
                    delete errors.userId;
                }
                break;

            default:
                break;
        }

        setFormErrors(errors);
    };


    const validateForm = () => {
        let errors = {};
        if (!formData.startTime) errors.startTime = 'La hora de inicio es requerida';
        else if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(formData.startTime))
            errors.startTime = 'La hora de inicio debe estar en formato (HH:MM:SS)';

        if (!formData.endTime) errors.endTime = 'La hora de fin es requerida';
        else if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(formData.endTime))
            errors.endTime = 'La hora de fin debe estar en formato (HH:MM:SS)';
        else if (new Date(`1970-01-01T${formData.endTime}Z`) <= new Date(`1970-01-01T${formData.startTime}Z`))
            errors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';

        if (!formData.status) errors.status = 'El estado es requerido';
        else if (!['pending', 'approved', 'rejected'].includes(formData.status))
            errors.status = 'El estado debe ser uno de los siguientes: pending, approved, rejected';

        if (!formData.day) errors.day = 'El día es requerido';
        else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.day))
            errors.day = 'El día debe estar en formato YYYY-MM-DD';

        if (!formData.userId) errors.userId = 'El ID de usuario es requerido';

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            try {
                const dataToSend = {
                    ...formData,
                    userId: Number(formData.userId)
                };

                console.log('Enviando datos:', dataToSend);

                await axios.post('http://localhost:1056/api/programming', dataToSend);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Programación registrada exitosamente',
                });
                handleClose();
                fetchProgrammingData();
            } catch (err) {
                console.error('Error submitting form:', err);
                if (err.response && err.response.data) {
                    setFormErrors(err.response.data.errors.reduce((acc, curr) => {
                        acc[curr.field] = curr.message;
                        return acc;
                    }, {}));
                }
            }
        } else {
            setFormErrors(errors);
        }
    };


    const handleUpdate = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            try {
                await axios.put(`http://localhost:1056/api/programming/${formData.id}`, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Programación actualizada exitosamente',
                });
                handleEditClose();
                fetchProgrammingData();
            } catch (err) {
                console.error('Error updating form:', err);
                if (err.response && err.response.data) {
                    setFormErrors(err.response.data.errors.reduce((acc, curr) => {
                        acc[curr.field] = curr.message;
                        return acc;
                    }, {}));
                }
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Sí, bórralo!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:1056/api/programming/${id}`);
                fetchProgrammingData(); // Refresca los datos de la tabla
                Swal.fire(
                    '¡Borrado!',
                    'El registro ha sido eliminado.',
                    'success'
                );
            } catch (err) {
                console.error('Error al borrar el dato:', err);
                setError('Error al borrar el dato');
                Swal.fire(
                    '¡Error!',
                    'Hubo un problema al borrar el registro.',
                    'error'
                );
            }
        }
    };


    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Programación de empleados</span>
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
                                        icon={<RxScissors fontSize="small" />}
                                    />
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Programación"
                                        icon={<FaUserCog fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-4 d-flex align-items-center'>
                                <Button className='btn-register' variant="contained" onClick={handleOpen}>
                                    <BsPlusSquareFill />Registrar
                                </Button>
                            </div>
                            <div className='col-sm-4 d-flex align-items-center cardFilters'>
                                <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
                                    <InputLabel id="columns-per-page-label">Columnas</InputLabel>
                                    <Select
                                        labelId="columns-per-page-label"
                                        id="columns-per-page-select"
                                        value={columnsPerPage}
                                        label="Columnas"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value={12}>12</MenuItem>
                                        <MenuItem value={24}>24</MenuItem>
                                        <MenuItem value={36}>36</MenuItem>
                                        <MenuItem value={48}>48</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='col-sm-4 d-flex align-items-center justify-content-end'>
                                <SearchBox />
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            {loading ? (
                                <p>Loading...</p>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <table className='table table-bordered table-hover v-align'>
                                    <thead className='table-primary'>
                                        <tr>
                                            <th>ID</th>
                                            <th>Hora Inicio</th>
                                            <th>Hora Fin</th>
                                            <th>Estado</th>
                                            <th>Día</th>
                                            <th>ID Usuario</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {programmingData.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.startTime}</td>
                                                <td>{item.endTime}</td>
                                                <td>{item.status}</td>
                                                <td>{item.day}</td>
                                                <td>{item.userId}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Button
                                                            color='primary'
                                                            className='primary'
                                                            onClick={() => handleViewOpen(item)}
                                                        >
                                                            <FaEye />
                                                        </Button>
                                                        <Button
                                                            color="secondary"
                                                            className='secondary'
                                                            onClick={() => handleEditOpen(item)}
                                                        >
                                                            <FaPencilAlt />
                                                        </Button>
                                                        <Button
                                                            color='error'
                                                            className='delete'
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <IoTrashSharp />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="d-flex table-footer">
                                <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para registro */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2" id="modal-title" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Registrar Programación
                    </Typography>
                    <TextField
                        label="Inicio"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.startTime}
                        helperText={formErrors.startTime}

                    />
                    <TextField
                        label="Fin"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.endTime}
                        helperText={formErrors.endTime}
                    />
                    <FormControl fullWidth margin="normal" error={!!formErrors.status}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            label="Estado"
                        >
                            <MenuItem value="pending">Pendiente</MenuItem>
                            <MenuItem value="approved">Aprobado</MenuItem>
                            <MenuItem value="rejected">Rechazado</MenuItem>
                        </Select>
                        {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
                    </FormControl>
                    <TextField
                        label="Día"
                        name="day"
                        type="date"
                        value={formData.day}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        error={!!formErrors.day}
                        helperText={formErrors.day}
                    />
                    <FormControl fullWidth margin="normal" error={!!formErrors.userId}>
                        <InputLabel>ID Usuario</InputLabel>
                        <Select
                            name="userId"
                            value={formData.userId}
                            onChange={handleInputChange}
                            label="ID Usuario"
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                            ))}
                        </Select>
                        {formErrors.userId && <FormHelperText>{formErrors.userId}</FormHelperText>}
                    </FormControl>
                    <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 3, width: '100%', fontWeight: 'bold' }}>
                        Guardar
                    </Button>
                </Box>
            </Modal>

            {/* Modal para visualizar */}
            <Modal
                open={openView}
                onClose={handleViewClose}
                aria-labelledby="modal-view-title"
                aria-describedby="modal-view-description"
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2" id="modal-view-title" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Detalles de Programación
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Inicio:</strong> {viewData.startTime}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Fin:</strong> {viewData.endTime}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Estado:</strong> {viewData.status}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Día:</strong> {viewData.day}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>ID Usuario:</strong> {viewData.userId}</Typography>
                    <Button onClick={handleViewClose} variant="outlined" color="primary" sx={{ mt: 3, width: '100%', fontWeight: 'bold' }}>
                        Cerrar
                    </Button>
                </Box>
            </Modal>


            {/* Modal para actualizar */}
            <Modal open={openEdit} onClose={handleEditClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" id="modal-title" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Editar Programación
                    </Typography>
                    <TextField
                        label="Hora de Inicio"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        error={!!formErrors.startTime}
                        helperText={formErrors.startTime}
                    />
                    <TextField
                        label="Hora de Fin"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        error={!!formErrors.endTime}
                        helperText={formErrors.endTime}
                    />
                    <FormControl fullWidth margin="normal" error={!!formErrors.status}>
                        <InputLabel id="status-label-edit">Estado</InputLabel>
                        <Select
                            label="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        >
                            <MenuItem value="pending">Pendiente</MenuItem>
                            <MenuItem value="approved">Aprobado</MenuItem>
                            <MenuItem value="rejected">Rechazado</MenuItem>
                        </Select>
                        <FormHelperText>{formErrors.status}</FormHelperText>
                    </FormControl>
                    <TextField
                        label="Día"
                        name="day"
                        value={formData.day}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        error={!!formErrors.day}
                        helperText={formErrors.day}
                    />
                    <FormControl fullWidth margin="normal" error={!!formErrors.userId}>
                        <InputLabel id="user-label-edit">Usuario</InputLabel>
                        <Select
                            label="user"
                            name="userId"
                            value={formData.userId}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            error={!!formErrors.day}
                            helperText={formErrors.user}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{formErrors.userId}</FormHelperText>
                    </FormControl>
                    <Button onClick={handleUpdate} variant="contained" color="primary" sx={{ mt: 3, width: '100%', fontWeight: 'bold' }}>Actualizar</Button>
                </Box>
            </Modal>
        </>
    );
}

export default Programming;
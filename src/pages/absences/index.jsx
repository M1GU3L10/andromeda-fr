import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaUserClock } from "react-icons/fa";
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

const Absences = () => {
    const [columnsPerPage, setColumnsPerPage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openView, setOpenView] = React.useState(false);
    const [editData, setEditData] = React.useState({});
    const [formData, setFormData] = React.useState({
        startTime: '',
        endTime: '',
        date: '',
        description: '',
        status: 'A',
        userId: ''
    });
    const [viewData, setViewData] = React.useState({});
    const [users, setUsers] = React.useState([]);
    const [errors, setErrors] = React.useState({});
    const [absences, setAbsences] = React.useState([]);

    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:1056/api/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
        fetchAbsences();
    }, []);

    const fetchAbsences = async () => {
        try {
            const response = await fetch('http://localhost:1056/api/absences');
            const data = await response.json();
            setAbsences(data);
        } catch (error) {
            console.error('Error fetching absences:', error);
        }
    };

    const handleChange = (event) => {
        setColumnsPerPage(event.target.value);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleEditOpen = (data) => {
        setEditData(data);
        setFormData(data);
        setOpenEdit(true);
    };

    const handleEditClose = () => setOpenEdit(false);

    const handleViewOpen = (data) => {
        setViewData(data);
        setOpenView(true);
    };

    const handleViewClose = () => setOpenView(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        const { startTime, endTime, date, userId, status } = formData;

        if (!startTime) newErrors.startTime = 'La hora de inicio es requerida';
        if (!endTime) newErrors.endTime = 'La hora de fin es requerida';
        if (!date) newErrors.date = 'La fecha es requerida';
        if (!userId) newErrors.userId = 'El ID de usuario es requerido';
        if (!['A', 'I'].includes(status)) newErrors.status = 'El estado debe ser A (Activo) o I (Inactivo)';

        const timeFormat = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (startTime && !timeFormat.test(startTime)) newErrors.startTime = 'La hora de inicio debe estar en formato HH:MM:SS';
        if (endTime && !timeFormat.test(endTime)) newErrors.endTime = 'La hora de fin debe estar en formato HH:MM:SS';

        if (startTime && endTime && new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
            newErrors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
        }

        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) newErrors.date = 'La fecha debe estar en formato YYYY-MM-DD';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
    
        try {
            const response = await fetch('http://localhost:1056/api/absences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Ausencia registrada exitosamente',
                });
                handleClose();
                fetchAbsences();
            } else {
                console.error('Error al registrar ausencia:', result);
                // Asegúrate de que result.errors exista y sea un array antes de usar reduce
                if (result.errors && Array.isArray(result.errors)) {
                    setErrors(result.errors.reduce((acc, err) => ({ ...acc, [err.param]: err.msg }), {}));
                } else {
                    // Manejo de casos en los que result.errors no está definido o no es un array
                    setErrors({ general: 'Ha ocurrido un error inesperado' });
                }
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            setErrors({ general: 'Error en la solicitud' });
        }
    };
    

    const handleUpdate = async () => {
        if (!validateForm()) return;

        try {
            if (!formData.id) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'ID de ausencia no encontrado.',
                });
                return;
            }

            const response = await fetch(`http://localhost:1056/api/absences/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Ausencia actualizada exitosamente',
                });
                handleEditClose();
                fetchAbsences();
            } else {
                console.error('Error al actualizar ausencia:', result);
                setErrors(result.errors.reduce((acc, err) => ({ ...acc, [err.param]: err.msg }), {}));
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };


    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:1056/api/absences/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    Swal.fire(
                        'Eliminado',
                        'La ausencia ha sido eliminada.',
                        'success'
                    );
                    fetchAbsences();
                } else {
                    console.error('Error al eliminar ausencia:', await response.json());
                    Swal.fire(
                        'Error',
                        'No se pudo eliminar la ausencia.',
                        'error'
                    );
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                Swal.fire(
                    'Error',
                    'Ocurrió un error al intentar eliminar la ausencia.',
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
                            <span className='Title'>Ausencias de empleados</span>
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
                                        label="Ausencias"
                                        icon={<FaUserClock fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-4 d-flex align-items-center'>
                                <Button className='btn-register' variant="contained" onClick={handleOpen}>
                                    <BsPlusSquareFill /> Registrar
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
                            <table className='table table-bordered table-hover v-align'>
                                <thead className='table-primary'>
                                    <tr>
                                        <th>Hora Inicio</th>
                                        <th>Hora Fin</th>
                                        <th>Fecha</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>ID Usuario</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {absences.map((absence) => (
                                        <tr key={absence.id}>
                                            <td>{absence.startTime}</td>
                                            <td>{absence.endTime}</td>
                                            <td>{absence.date}</td>
                                            <td>{absence.description}</td>
                                            <td>{absence.status === 'A' ? 'Aprobado' : 'Inactivo'}</td>
                                            <td>{absence.userId}</td>
                                            <td>
                                                <div className='actions d-flex align-items-center'>
                                                    <Button color='primary' className='primary' onClick={() => handleViewOpen(absence)}>
                                                        <FaEye />
                                                    </Button>
                                                    <Button
                                                        color="secondary"
                                                        className='secondary'
                                                        onClick={() => handleEditOpen(absence)}
                                                    >
                                                        <FaPencilAlt />
                                                    </Button>
                                                    <Button color='error' className='delete' onClick={() => handleDelete(absence.id)}>
                                                        <IoTrashSharp />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                        Registrar Ausencia
                    </Typography>
                    <TextField
                        label="Hora Inicio"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.startTime}
                        helperText={errors.startTime}
                    />
                    <TextField
                        label="Hora Fin"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.endTime}
                        helperText={errors.endTime}
                    />
                    <TextField
                        label="Fecha"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.date}
                        helperText={errors.date}
                    />
                    <TextField
                        label="Descripción"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="user-id-label">ID Usuario</InputLabel>
                        <Select
                            labelId="user-id-label"
                            id="user-id-select"
                            name="userId"
                            value={formData.userId}
                            onChange={handleInputChange}
                            label="ID Usuario"
                            error={!!errors.userId}
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.userId && <Typography color="error" variant="caption">{errors.userId}</Typography>}
                    </FormControl>
                    <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 3, width: '100%', fontWeight: 'bold' }}>
                        Guardar
                    </Button>
                </Box>
            </Modal>

            {/* Modal para actualizar */}
            <Modal
                open={openEdit}
                onClose={handleEditClose}
                aria-labelledby="modal-edit-title"
                aria-describedby="modal-edit-description"
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2" id="modal-edit-title" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Actualizar Ausencia
                    </Typography>
                    <TextField
                        label="Hora Inicio"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.startTime}
                        helperText={errors.startTime}
                    />
                    <TextField
                        label="Hora Fin"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.endTime}
                        helperText={errors.endTime}
                    />
                    <TextField
                        label="Fecha"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.date}
                        helperText={errors.date}
                    />
                    <TextField
                        label="Descripción"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-label-edit">Estado</InputLabel>
                        <Select
                            labelId="status-label-edit"
                            id="status-edit-select"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        >
                            <MenuItem value="A">Activo</MenuItem>
                            <MenuItem value="I">Inactivo</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="user-id-edit-label">ID Usuario</InputLabel>
                        <Select
                            labelId="user-id-edit-label"
                            id="user-id-edit-select"
                            name="userId"
                            value={formData.userId}
                            onChange={handleInputChange}
                            label="ID Usuario"
                            error={!!errors.userId}
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.userId && <Typography color="error" variant="caption">{errors.userId}</Typography>}
                    </FormControl>
                    <Button onClick={handleUpdate} variant="contained" color="primary" sx={{ mt: 3, width: '100%', fontWeight: 'bold' }}>
                        Actualizar
                    </Button>
                </Box>
            </Modal>

            {/* Modal para ver */}
            <Modal
                open={openView}
                onClose={handleViewClose}
                aria-labelledby="modal-view-title"
                aria-describedby="modal-view-description"
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2" id="modal-view-title" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Ver Ausencia
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Hora Inicio:</strong> {viewData.startTime}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Hora Fin:</strong> {viewData.endTime}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Fecha:</strong> {viewData.date}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Descripción:</strong> {viewData.description}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Estado:</strong> {viewData.status === 'A' ? 'Aprobado' : 'Inactivo'}</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}><strong>ID Usuario:</strong> {viewData.userId}</Typography>
                    <Button onClick={handleViewClose} variant="outlined" color="primary" sx={{ mt: 3, width: '100%', fontWeight: 'bold' }}>
                        Cerrar
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default Absences;
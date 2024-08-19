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
    const [editData, setEditData] = React.useState({});
    const [formData, setFormData] = React.useState({
        startTime: '',
        endTime: '',
        date: '',
        description: '',
        userId: ''
    });

    const handleChange = (event) => {
        setColumnsPerPage(event.target.value);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleEditOpen = (data) => {
        setEditData(data);
        setFormData(data); // Populate formData with data to be edited
        setOpenEdit(true);
    };

    const handleEditClose = () => setOpenEdit(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        // Aquí puedes agregar la lógica para enviar los datos a la API
        console.log(formData);
        handleClose();
    };

    const handleUpdate = () => {
        // Aquí puedes agregar la lógica para actualizar los datos en la API
        console.log(formData);
        handleEditClose();
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
                                    <tr>
                                        <td>09:00</td>
                                        <td>13:00</td>
                                        <td>2024-08-20</td>
                                        <td>Cita médica</td>
                                        <td>Aprobado</td>
                                        <td>123</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button 
                                                    color="secondary" 
                                                    className='secondary'
                                                    onClick={() => handleEditOpen({
                                                        startTime: '09:00',
                                                        endTime: '13:00',
                                                        date: '2024-08-20',
                                                        description: 'Cita médica',
                                                        userId: '123'
                                                    })}
                                                >
                                                    <FaPencilAlt />
                                                </Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Puedes agregar más filas aquí */}
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
                    />
                    <TextField
                        label="Hora Fin"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Fecha"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
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
                    <TextField
                        label="ID Usuario"
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
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
                    />
                    <TextField
                        label="Hora Fin"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Fecha"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
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
                    <TextField
                        label="ID Usuario"
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <Button onClick={handleUpdate} variant="contained" color="primary" sx={{ mt: 3, width: '100%', fontWeight: 'bold' }}>
                        Actualizar
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default Absences;

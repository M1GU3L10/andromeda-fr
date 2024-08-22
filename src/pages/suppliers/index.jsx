import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import axios from 'axios';
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
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';

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

const Suppliers = () => {
    const [columnsPerPage, setColumnsPerPage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [openView, setOpenView] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [viewData, setViewData] = React.useState({});
    const [formData, setFormData] = React.useState({
        Supplier_Name: '',
        Phone_Number: '',
        Email: '',
        Address: '',
    });
    const [supplierData, setSupplierData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [formErrors, setFormErrors] = React.useState({});

    React.useEffect(() => {
        fetchSupplierData();
    }, []);

    const fetchSupplierData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:1056/api/suppliers');
            setSupplierData(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error conexion base de datos');
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        setColumnsPerPage(event.target.value);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({
            Supplier_Name: '',
            Phone_Number: '',
            Email: '',
            Address: '',
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
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.Supplier_Name) errors.Supplier_Name = 'Supplier name is required';
        if (!formData.Phone_Number) errors.Phone_Number = 'Phone number is required';
        if (!formData.Email) errors.Email = 'Email is required';
        if (!formData.Address) errors.Address = 'Address is required';

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            try {
                await axios.post('http://localhost:1056/api/suppliers', formData);
                show_alerta('Supplier added successfully', 'success');
                handleClose();
                fetchSupplierData();
            } catch (err) {
                console.error('Error submitting form:', err);
                if (err.response && err.response.data) {
                    setFormErrors(err.response.data.errors.reduce((acc, curr) => {
                        acc[curr.param] = curr.msg;
                        return acc;
                    }, {}));
                } else {
                    console.error('Unknown error:', err);
                }
                show_alerta('Error al agregar el proveedor', 'error');
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleUpdate = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            try {
                await axios.put(`http://localhost:1056/api/suppliers/${formData.id}`, formData);
                handleEditClose();
                fetchSupplierData();
                show_alerta('Proveedor actualizado exitosamente', 'success');
            } catch (err) {
                console.error('Error updating supplier:', err);
                if (err.response && err.response.data) {
                    setFormErrors(err.response.data.errors.reduce((acc, curr) => {
                        acc[curr.param] = curr.msg;
                        return acc;
                    }, {}));
                } else {
                    console.error('Unknown error:', err);
                }
                show_alerta('Error al actualizar el proveedor', 'error');
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleDelete = async (id, name) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title: `¿Estás seguro que deseas eliminar el proveedor ${name}?`,
            icon: 'question',
            text: 'No se podrá dar marcha atrás',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:1056/api/suppliers/${id}`);
                    fetchSupplierData();
                    show_alerta('Proveedor eliminado exitosamente', 'success');
                } catch (err) {
                    console.error('Error deleting supplier:', err);
                    show_alerta('Error al eliminar el proveedor', 'error');
                }
            } else {
                show_alerta('El proveedor NO fue eliminado', 'info');
            }
        });
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Gestión de Proveedores</span>
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
                                <Button className='btn-register' onClick={handleOpen} variant="contained"><BsPlusSquareFill />Registrar</Button>
                            </div>
                            <div className='col-sm-3 d-flex align-items-center cardFilters'>
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
                                <p>Cargando...</p>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <table className='table table-bordered table-hover v-align'>
                                    <thead className='table-primary'>
                                        <tr>
                                            <th>#</th>
                                            <th>Nombre</th>
                                            <th>Teléfono</th>
                                            <th>Email</th>
                                            <th>Dirección</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supplierData.map((supplier, i) => (
                                            <tr key={supplier.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{supplier.Supplier_Name}</td>
                                                <td>{supplier.Phone_Number}</td>
                                                <td>{supplier.Email}</td>
                                                <td>{supplier.Address}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Button color='primary' className='primary' onClick={() => handleViewOpen(supplier)}><FaEye /></Button>
                                                        <Button color="secondary" className='secondary' onClick={() => handleEditOpen(supplier)}><FaPencilAlt /></Button>
                                                        <Button color='error' className='delete' onClick={() => handleDelete(supplier.id, supplier.Supplier_Name)}><IoTrashSharp /></Button>
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

            {/* Modal para agregar proveedor */}
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        Agregar Proveedor
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Nombre del Proveedor"
                        name="Supplier_Name"
                        value={formData.Supplier_Name}
                        onChange={handleInputChange}
                        error={!!formErrors.Supplier_Name}
                        helperText={formErrors.Supplier_Name}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Teléfono"
                        name="Phone_Number"
                        value={formData.Phone_Number}
                        onChange={handleInputChange}
                        error={!!formErrors.Phone_Number}
                        helperText={formErrors.Phone_Number}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        error={!!formErrors.Email}
                        helperText={formErrors.Email}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Dirección"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        error={!!formErrors.Address}
                        helperText={formErrors.Address}
                    />
               
                   
                        <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}
                    >
                        Guardar
                    </Button>
                </Box>
            </Modal>

            {/* Modal para ver proveedor */}
            <Modal
                open={openView}
                onClose={handleViewClose}
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Ver Proveedor
                    </Typography>
                    <Typography variant="body1"><strong>ID:</strong> {viewData.id}</Typography>
                    <Typography variant="body1"><strong>Nombre:</strong> {viewData.Supplier_Name}</Typography>
                    <Typography variant="body1"><strong>Teléfono:</strong> {viewData.Phone_Number}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {viewData.Email}</Typography>
                    <Typography variant="body1"><strong>Dirección:</strong> {viewData.Address}</Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleViewClose}
                        sx={{ mt: 2 }}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Modal>

            {/* Modal para editar proveedor */}
            <Modal
                open={openEdit}
                onClose={handleEditClose}
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        Editar Proveedor
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Nombre del Proveedor"
                        name="Supplier_Name"
                        value={formData.Supplier_Name}
                        onChange={handleInputChange}
                        error={!!formErrors.Supplier_Name}
                        helperText={formErrors.Supplier_Name}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Teléfono"
                        name="Phone_Number"
                        value={formData.Phone_Number}
                        onChange={handleInputChange}
                        error={!!formErrors.Phone_Number}
                        helperText={formErrors.Phone_Number}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        error={!!formErrors.Email}
                        helperText={formErrors.Email}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Dirección"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        error={!!formErrors.Address}
                        helperText={formErrors.Address}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdate}
                        sx={{ mt: 2 }}
                    >
                        Actualizar
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default Suppliers;
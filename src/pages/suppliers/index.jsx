import * as React from 'react';
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
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
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { IoTrashSharp } from 'react-icons/io5';
import { Button } from 'reactstrap'; // o el componente Button que estés usando


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
            setError('Error fetching data');
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
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:1056/api/suppliers/${viewData.id}`, formData);
            handleEditClose();
            fetchSupplierData();
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
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:1056/api/suppliers/${id}`);
            fetchSupplierData();
        } catch (err) {
            console.error('Error deleting supplier:', err);
            setError('Error deleting supplier');
        }
    };

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
                                    <Chip label="Home" />
                                    <Chip label="Suppliers" />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-4 d-flex align-items-center'>
                                <button className="btn btn-primary" onClick={handleOpen}>
                                    Registrar
                                </button>
                            </div>
                            <div className='col-sm-4 d-flex align-items-center cardFilters'>
                                <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
                                    <InputLabel id="columns-per-page-label">Columns</InputLabel>
                                    <Select
                                        labelId="columns-per-page-label"
                                        id="columns-per-page-select"
                                        value={columnsPerPage}
                                        label="Columns"
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
                                            <th>ID</th>
                                            <th>Proveedor Nombre</th>
                                            <th>Telefono</th>
                                            <th>Correo</th>
                                            <th>Direccion</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supplierData.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.Supplier_Name}</td>
                                                <td>{item.Phone_Number}</td>
                                                <td>{item.Email}</td>
                                                <td>{item.Address}</td>
                                                <td>
                                                    <button className="btn btn-info me-2" onClick={() => handleViewOpen(item)}>Ver</button>
                                                    <button className="btn btn-warning me-2" onClick={() => handleEditOpen(item)}>Editar</button>
                                                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Eliminar</button>
                                                    
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <Pagination count={10} color="primary" showFirstButton showLastButton />
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Registar Proveedor
                    </Typography>
                    <TextField
                        label="Supplier Name"
                        name="Supplier_Name"
                        value={formData.Supplier_Name}
                        onChange={handleInputChange}
                        error={!!formErrors.Supplier_Name}
                        helperText={formErrors.Supplier_Name}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Phone Number"
                        name="Phone_Number"
                        value={formData.Phone_Number}
                        onChange={handleInputChange}
                        error={!!formErrors.Phone_Number}
                        helperText={formErrors.Phone_Number}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        error={!!formErrors.Email}
                        helperText={formErrors.Email}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Address"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        error={!!formErrors.Address}
                        helperText={formErrors.Address}
                        fullWidth
                        margin="normal"
                    />
                    <div className="d-flex justify-content-end mt-4">
                        <button className="btn btn-primary me-2" onClick={handleSubmit}>Guardar</button>
                        <button className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
                    </div>
                </Box>
            </Modal>

            <Modal open={openView} onClose={handleViewClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Informacion de proveedor
                    </Typography>
                    <Typography><strong>ID:</strong> {viewData.id}</Typography>
                    <Typography><strong>Nombre:</strong> {viewData.Supplier_Name}</Typography>
                    <Typography><strong>Numero:</strong> {viewData.Phone_Number}</Typography>
                    <Typography><strong>Correo:</strong> {viewData.Email}</Typography>
                    <Typography><strong>Direccion:</strong> {viewData.Address}</Typography>
                </Box>
            </Modal>

            <Modal open={openEdit} onClose={handleEditClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Editar proveedor
                    </Typography>
                    <TextField
                        label="Nombre"
                        name="Supplier_Name"
                        value={formData.Supplier_Name}
                        onChange={handleInputChange}
                        error={!!formErrors.Supplier_Name}
                        helperText={formErrors.Supplier_Name}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Numero"
                        name="Phone_Number"
                        value={formData.Phone_Number}
                        onChange={handleInputChange}
                        error={!!formErrors.Phone_Number}
                        helperText={formErrors.Phone_Number}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Correo"
                        name="Email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        error={!!formErrors.Email}
                        helperText={formErrors.Email}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Direccion"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        error={!!formErrors.Address}
                        helperText={formErrors.Address}
                        fullWidth
                        margin="normal"
                    />
                    <div className="d-flex justify-content-end mt-4">
                        <button className="btn btn-primary me-2" onClick={handleUpdate}>Update</button>
                        <button className="btn btn-secondary" onClick={handleEditClose}>Cancel</button>
                    </div>
                </Box>
            </Modal>
        </>
    );
};

export default Suppliers;

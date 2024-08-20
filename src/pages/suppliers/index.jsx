import * as React from 'react';
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
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
        SupplierName: '',
        Units: '',
        UnitPrice: '',
        TotalPrice: '',
        CategoryId: '',
        ProductId: ''
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
            SupplierName: '',
            Units: '',
            UnitPrice: '',
            TotalPrice: '',
            CategoryId: '',
            ProductId: ''
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
        if (!formData.SupplierName) errors.SupplierName = 'Supplier name is required';
        if (!formData.Units || isNaN(formData.Units) || formData.Units < 0) errors.Units = 'Units must be a non-negative number';
        if (!formData.UnitPrice || isNaN(formData.UnitPrice) || formData.UnitPrice <= 0) errors.UnitPrice = 'Unit price must be a positive number';
        if (!formData.TotalPrice || isNaN(formData.TotalPrice) || formData.TotalPrice <= 0) errors.TotalPrice = 'Total price must be a positive number';
        if (!formData.CategoryId) errors.CategoryId = 'Category ID is required';
        if (!formData.ProductId) errors.ProductId = 'Product ID is required';

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
            await axios.put(`http://localhost:1056/api/suppliers/${viewData.Id_Proveedores}`, formData);
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

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Supplier Management</span>
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
                                <Button variant="contained" onClick={handleOpen}>
                                    Register
                                </Button>
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
                                <p>Loading...</p>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <table className='table table-bordered table-hover v-align'>
                                    <thead className='table-primary'>
                                        <tr>
                                            <th>ID</th>
                                            <th>Supplier Name</th>
                                            <th>Units</th>
                                            <th>Unit Price</th>
                                            <th>Total Price</th>
                                            <th>Category ID</th>
                                            <th>Product ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supplierData.map((item) => (
                                            <tr key={item.Id_Proveedores}>
                                                <td>{item.Id_Proveedores}</td>
                                                <td>{item.Nombre_Proveedor}</td>
                                                <td>{item.Unidades}</td>
                                                <td>{item.Precio_unitario}</td>
                                                <td>{item.Precio_total}</td>
                                                <td>{item.Id_categoria_producto}</td>
                                                <td>{item.Id_Producto}</td>
                                                <td>
                                                    <Button onClick={() => handleViewOpen(item)}>View</Button>
                                                    <Button onClick={() => handleEditOpen(item)}>Edit</Button>
                                                    <Button color='error'>Delete</Button>
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
                        Register Supplier
                    </Typography>
                    <TextField
                        label="Supplier Name"
                        name="SupplierName"
                        value={formData.SupplierName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.SupplierName}
                        helperText={formErrors.SupplierName}
                    />
                    <TextField
                        label="Units"
                        name="Units"
                        value={formData.Units}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.Units}
                        helperText={formErrors.Units}
                    />
                    <TextField
                        label="Unit Price"
                        name="UnitPrice"
                        value={formData.UnitPrice}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.UnitPrice}
                        helperText={formErrors.UnitPrice}
                    />
                    <TextField
                        label="Total Price"
                        name="TotalPrice"
                        value={formData.TotalPrice}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.TotalPrice}
                        helperText={formErrors.TotalPrice}
                    />
                    <TextField
                        label="Category ID"
                        name="CategoryId"
                        value={formData.CategoryId}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.CategoryId}
                        helperText={formErrors.CategoryId}
                    />
                    <TextField
                        label="Product ID"
                        name="ProductId"
                        value={formData.ProductId}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.ProductId}
                        helperText={formErrors.ProductId}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Register
                    </Button>
                </Box>
            </Modal>

            <Modal open={openView} onClose={handleViewClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Supplier Information
                    </Typography>
                    <Typography>Supplier Name: {viewData.SupplierName}</Typography>
                    <Typography>Units: {viewData.Units}</Typography>
                    <Typography>Unit Price: {viewData.UnitPrice}</Typography>
                    <Typography>Total Price: {viewData.TotalPrice}</Typography>
                    <Typography>Category ID: {viewData.CategoryId}</Typography>
                    <Typography>Product ID: {viewData.ProductId}</Typography>
                </Box>
            </Modal>


            <Modal open={openEdit} onClose={handleEditClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Edit Supplier
                    </Typography>
                    <TextField
                        label="Supplier Name"
                        name="SupplierName"
                        value={formData.SupplierName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Units"
                        name="Units"
                        value={formData.Units}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Unit Price"
                        name="UnitPrice"
                        value={formData.UnitPrice}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Total Price"
                        name="TotalPrice"
                        value={formData.TotalPrice}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Category ID"
                        name="CategoryId"
                        value={formData.CategoryId}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Product ID"
                        name="ProductId"
                        value={formData.ProductId}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdate}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Update
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default Suppliers;

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

const Products = () => {
    const [columnsPerPage, setColumnsPerPage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [openView, setOpenView] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [viewData, setViewData] = React.useState({});
    const [formData, setFormData] = React.useState({
        Product_Name: '',
        Stock: '',
        Price: '',
        Category_Id: '',
        Image_URL: ''  // Added field for image URL
    });
    const [productData, setProductData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [formErrors, setFormErrors] = React.useState({});

    React.useEffect(() => {
        fetchProductData();
    }, []);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:1056/api/products');
            setProductData(response.data);
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
            Product_Name: '',
            Stock: '',
            Price: '',
            Category_Id: '',
            Image_URL: ''
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
        if (!formData.Product_Name) errors.Product_Name = 'Product name is required';
        if (!formData.Stock || isNaN(formData.Stock) || formData.Stock < 0) errors.Stock = 'Stock must be a positive number';
        if (!formData.Price || isNaN(formData.Price) || formData.Price < 0) errors.Price = 'Price must be a positive number';
        if (!formData.Category_Id) errors.Category_Id = 'Category ID is required';
        // Optionally validate the image URL format
        if (formData.Image_URL && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(formData.Image_URL)) {
            errors.Image_URL = 'Invalid image URL';
        }

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            try {
                await axios.post('http://localhost:1056/api/products', formData);
                handleClose();
                fetchProductData();
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
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            try {
                await axios.put(`http://localhost:1056/api/products/${formData.Id_Producto}`, formData);
                handleEditClose();
                fetchProductData();
            } catch (err) {
                console.error('Error updating product:', err);
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

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Product Management</span>
                        </div>
                        <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
                            <div role="presentation">
                                <Breadcrumbs aria-label="breadcrumb">
                                    <Chip label="Home" />
                                    <Chip label="Products" />
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
                                            <th>Name</th>
                                            <th>Stock</th>
                                            <th>Price</th>
                                            <th>Category</th>
                                            <th>Image</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productData.map((item) => (
                                            <tr key={item.Id_Producto}>
                                                <td>{item.Id_Producto}</td>
                                                <td>{item.Product_Name}</td>
                                                <td>{item.Stock}</td>
                                                <td>{item.Price}</td>
                                                <td>{item.Category_Id}</td>
                                                <td>
                                                    {item.Image_URL && <img src={item.Image_URL} alt={item.Product_Name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}
                                                </td>
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
                        Register Product
                    </Typography>
                    <TextField
                        label="Name"
                        name="Product_Name"
                        value={formData.Product_Name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.Product_Name}
                        helperText={formErrors.Product_Name}
                    />
                    <TextField
                        label="Stock"
                        name="Stock"
                        value={formData.Stock}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.Stock}
                        helperText={formErrors.Stock}
                    />
                    <TextField
                        label="Price"
                        name="Price"
                        value={formData.Price}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.Price}
                        helperText={formErrors.Price}
                    />
                    <TextField
                        label="Category"
                        name="Category_Id"
                        value={formData.Category_Id}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.Category_Id}
                        helperText={formErrors.Category_Id}
                    />
                    <TextField
                        label="Image URL"
                        name="Image_URL"
                        value={formData.Image_URL}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!formErrors.Image_URL}
                        helperText={formErrors.Image_URL}
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
                        Product Information
                    </Typography>
                    <Typography>Name: {viewData.Product_Name}</Typography>
                    <Typography>Stock: {viewData.Stock}</Typography>
                    <Typography>Price: {viewData.Price}</Typography>
                    <Typography>Category: {viewData.Category_Id}</Typography>
                    {viewData.Image_URL && <img src={viewData.Image_URL} alt={viewData.Product_Name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
                </Box>
            </Modal>

            <Modal open={openEdit} onClose={handleEditClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        Edit Product
                    </Typography>
                    <TextField
                        label="Name"
                        name="Product_Name"
                        value={formData.Product_Name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Stock"
                        name="Stock"
                        value={formData.Stock}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Price"
                        name="Price"
                        value={formData.Price}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Category"
                        name="Category_Id"
                        value={formData.Category_Id}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        label="Image URL"
                        name="Image_URL"
                        value={formData.Image_URL}
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

export default Products;

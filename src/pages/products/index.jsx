import * as React from 'react';
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Button from 'react-bootstrap/Button'; // Cambiado a Bootstrap
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
        Image: null,  // Cambiado para almacenar el archivo en sí
    });
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState(''); // Añadido para almacenar la URL de vista previa
    const [productData, setProductData] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [formErrors, setFormErrors] = React.useState({});

    React.useEffect(() => {
        fetchCategories();
        fetchProductData();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:1056/api/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

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
            Image: null
        });
        setImagePreviewUrl(''); // Resetear la vista previa
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

    const handleEditClose = () => {
        setOpenEdit(false);
        setImagePreviewUrl(''); // Resetear la vista previa
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, Image: file });

        // Crear una URL de vista previa
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.Product_Name) errors.Product_Name = 'El nombre del producto es obligatorio';
        if (!formData.Stock || isNaN(formData.Stock) || formData.Stock < 0) errors.Stock = 'El stock debe ser un número positivo';
        if (!formData.Price || isNaN(formData.Price) || formData.Price < 0) errors.Price = 'El precio debe ser un número positivo';
        if (!formData.Category_Id) errors.Category_Id = 'La categoría es obligatoria';

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            const data = new FormData();
            for (const key in formData) {
                data.append(key, formData[key]);
            }

            try {
                await axios.post('http://localhost:1056/api/products', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
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
                    console.error('Error desconocido:', err);
                }
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleUpdate = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            const data = new FormData();
            for (const key in formData) {
                data.append(key, formData[key]);
            }

            try {
                await axios.put(`http://localhost:1056/api/products/${formData.id}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
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
                    console.error('Error desconocido:', err);
                }
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:1056/api/products/${id}`);
            fetchProductData();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Gestión de Productos</span>
                        </div>
                        <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
                            <div role="presentation">
                                <Breadcrumbs aria-label="breadcrumb">
                                    <Chip label="Inicio" />
                                    <Chip label="Productos" />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-4 d-flex align-items-center'>
                                <Button variant="primary" onClick={handleOpen}>
                                    Registrar
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
                                <p>Cargando...</p>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <table className='table table-bordered table-hover v-align'>
                                    <thead className='table-primary'>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Stock</th>
                                            <th>Precio</th>
                                            <th>Categoría</th>
                                            <th>Imagen</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productData.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.id}</td>
                                                <td>{product.Product_Name}</td>
                                                <td>{product.Stock}</td>
                                                <td>{product.Price}</td>
                                                <td>{product.Category_Id}</td>
                                                <td>
                                                    <img src={product.Image} alt="product" style={{ width: '100px', height: 'auto' }} />
                                                </td>
                                                <td className='actions'>
                                                    <Button variant="secondary" onClick={() => handleViewOpen(product)}>
                                                        
                                                    </Button>{' '}
                                                    <Button variant="info" onClick={() => handleEditOpen(product)}>
                                                        
                                                    </Button>{' '}
                                                    <Button variant="danger" onClick={() => handleDelete(product.id)}>
                                                        
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <Pagination count={10} shape="rounded" className='mt-3' />
                    </div>
                </div>
            </div>

            {/* Modal para registrar */}
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
                <Box sx={style}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Registrar Producto
                    </Typography>
                    <div className='mt-3'>
                        <TextField
                            name="Product_Name"
                            label="Nombre del Producto"
                            value={formData.Product_Name}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!formErrors.Product_Name}
                            helperText={formErrors.Product_Name}
                        />
                    </div>
                    <div className='mt-3'>
                        <TextField
                            name="Stock"
                            label="Stock"
                            value={formData.Stock}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!formErrors.Stock}
                            helperText={formErrors.Stock}
                        />
                    </div>
                    <div className='mt-3'>
                        <TextField
                            name="Price"
                            label="Precio"
                            value={formData.Price}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!formErrors.Price}
                            helperText={formErrors.Price}
                        />
                    </div>
                    <div className='mt-3'>
                        <FormControl fullWidth>
                            <InputLabel id="category-label">Categoría</InputLabel>
                            <Select
                                labelId="category-label"
                                id="category-select"
                                name="Category_Id"
                                value={formData.Category_Id}
                                label="Categoría"
                                onChange={handleInputChange}
                                error={!!formErrors.Category_Id}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className='mt-3'>
                        <Button variant="secondary" as="label" htmlFor="file-input">
                            Subir Imagen
                        </Button>
                        <input
                            id="file-input"
                            type="file"
                            onChange={handleFileChange}
                            hidden
                        />
                    </div>
                    {imagePreviewUrl && (
                        <div className='mt-3'>
                            <img src={imagePreviewUrl} alt="Vista previa" style={{ width: '100%', height: 'auto' }} />
                        </div>
                    )}
                    <div className='mt-3'>
                        <Button variant="primary" onClick={handleSubmit}>
                            Guardar
                        </Button>{' '}
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Modal para ver */}
            <Modal open={openView} onClose={handleViewClose} aria-labelledby="modal-title-view" aria-describedby="modal-description-view">
                <Box sx={style}>
                    <Typography id="modal-title-view" variant="h6" component="h2">
                        Ver Producto
                    </Typography>
                    <div className='mt-3'>
                        <p><strong>Nombre del Producto:</strong> {viewData.Product_Name}</p>
                        <p><strong>Stock:</strong> {viewData.Stock}</p>
                        <p><strong>Precio:</strong> {viewData.Price}</p>
                        <p><strong>Categoría:</strong> {viewData.name}</p>
                        <p><strong>Imagen:</strong></p>
                        <img src={viewData.Image} alt="product" style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <div className='mt-3'>
                        <Button variant="secondary" onClick={handleViewClose}>
                            Cerrar
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Modal para editar */}
            <Modal open={openEdit} onClose={handleEditClose} aria-labelledby="modal-title-edit" aria-describedby="modal-description-edit">
                <Box sx={style}>
                    <Typography id="modal-title-edit" variant="h6" component="h2">
                        Editar Producto
                    </Typography>
                    <div className='mt-3'>
                        <TextField
                            name="Product_Name"
                            label="Nombre del Producto"
                            value={formData.Product_Name}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!formErrors.Product_Name}
                            helperText={formErrors.Product_Name}
                        />
                    </div>
                    <div className='mt-3'>
                        <TextField
                            name="Stock"
                            label="Stock"
                            value={formData.Stock}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!formErrors.Stock}
                            helperText={formErrors.Stock}
                        />
                    </div>
                    <div className='mt-3'>
                        <TextField
                            name="Price"
                            label="Precio"
                            value={formData.Price}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!formErrors.Price}
                            helperText={formErrors.Price}
                        />
                    </div>
                    <div className='mt-3'>
                        <FormControl fullWidth>
                            <InputLabel id="category-label-edit">Categoría</InputLabel>
                            <Select
                                labelId="category-label-edit"
                                id="category-select-edit"
                                name="Category_Id"
                                value={formData.Category_Id}
                                label="Categoría"
                                onChange={handleInputChange}
                                error={!!formErrors.Category_Id}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className='mt-3'>
                        <Button variant="secondary" as="label" htmlFor="file-input-edit">
                            Subir Imagen
                        </Button>
                        <input
                            id="file-input-edit"
                            type="file"
                            onChange={handleFileChange}
                            hidden
                        />
                    </div>
                    {imagePreviewUrl && (
                        <div className='mt-3'>
                            <img src={imagePreviewUrl} alt="Vista previa" style={{ width: '100%', height: 'auto' }} />
                        </div>
                    )}
                    <div className='mt-3'>
                        <Button variant="primary" onClick={handleUpdate}>
                            Guardar Cambios
                        </Button>{' '}
                        <Button variant="secondary" onClick={handleEditClose}>
                            Cancelar
                        </Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
};

export default Products;

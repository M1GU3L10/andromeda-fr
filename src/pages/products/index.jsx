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
        Image: null,
    });
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState('');
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
        setImagePreviewUrl('');
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
        setImagePreviewUrl('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, Image: file });

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
                show_alerta('Producto agregado exitosamente', 'success');
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
                show_alerta('Error al agregar el producto', 'error');
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
                show_alerta('Producto actualizado exitosamente', 'success');
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
                show_alerta('Error al actualizar el producto', 'error');
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleDelete = async (id, name) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title: `¿Estás seguro que deseas eliminar el producto ${name}?`,
            icon: 'question',
            text: 'No se podrá dar marcha atrás',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:1056/api/products/${id}`);
                    fetchProductData();
                    show_alerta('Producto eliminado exitosamente', 'success');
                } catch (err) {
                    console.error('Error deleting product:', err);
                    show_alerta('Error al eliminar el producto', 'error');
                }
            } else {
                show_alerta('El producto NO fue eliminado', 'info');
            }
        });
    };

    const handleSwitchChange = (id) => async (event) => {
        const newStatus = event.target.checked ? 'A' : 'I';
        try {
            await axios.put(`http://localhost:1056/api/products/${id}`, { status: newStatus });
            fetchProductData();
            show_alerta(`Estado del producto actualizado a ${newStatus === 'A' ? 'Activo' : 'Inactivo'}`, 'success');
        } catch (err) {
            console.error('Error updating product status:', err);
            show_alerta('Error al actualizar el estado del producto', 'error');
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
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Home"
                                        icon={<HomeIcon fontSize="small" />}
                                    />
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Productos"
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
                                            <th>Stock</th>
                                            <th>Precio</th>
                                            <th>Categoría</th>
                                            <th>Imagen</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productData.map((product, i) => (
                                            <tr key={product.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{product.Product_Name}</td>
                                                <td>{product.Stock}</td>
                                                <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</td>
                                                <td>{categories.find(cat => cat.id === product.Category_Id)?.name || 'No disponible'}</td>
                                                <td>
                                                    {product.Image && (
                                                        <img src={`http://localhost:1056/${product.Image}`} alt={product.Product_Name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                    )}
                                                </td>
                                                <td><div className='actions d-flex align-items-center'>
                                                    
                                                        <Button color='primary' className='primary' onClick={() => handleViewOpen(product)}><FaEye /></Button>
                                                        <Button color="secondary" className='secondary' onClick={() => handleEditOpen(product)}><FaPencilAlt /></Button>
                                                        <Button color='error' className='delete' onClick={() => handleDelete(product.id, product.Product_Name)}><IoTrashSharp /></Button>
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

            {/* Modal para agregar producto */}
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        Agregar Producto
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Nombre del Producto"
                        name="Product_Name"
                        value={formData.Product_Name}
                        onChange={handleInputChange}
                        error={!!formErrors.Product_Name}
                        helperText={formErrors.Product_Name}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Stock"
                        type="number"
                        name="Stock"
                        value={formData.Stock}
                        onChange={handleInputChange}
                        error={!!formErrors.Stock}
                        helperText={formErrors.Stock}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Precio"
                        type="number"
                        name="Price"
                        value={formData.Price}
                        onChange={handleInputChange}
                        error={!!formErrors.Price}
                        helperText={formErrors.Price}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="category-label">Categoría</InputLabel>
                        <Select
                            labelId="category-label"
                            id="category-select"
                            name="Category_Id"
                            value={formData.Category_Id}
                            onChange={handleInputChange}
                            error={!!formErrors.Category_Id}
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                        {formErrors.Category_Id && <Typography color="error">{formErrors.Category_Id}</Typography>}
                    </FormControl>
                    <input
                        accept="image/*"
                        type="file"
                        id="image-upload"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload">
                        <Button variant="contained" component="span" sx={{ mt: 2 }}>
                            Subir Imagen
                        </Button>
                    </label>
                    {imagePreviewUrl && (
                        <Box mt={2}>
                            <img src={imagePreviewUrl} alt="Vista previa" style={{ width: '100%', height: 'auto' }} />
                        </Box>
                    )}
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

            {/* Modal para ver producto */}
            <Modal
                open={openView}
                onClose={handleViewClose}
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        Ver Producto
                    </Typography>
                    <Typography variant="body1"><strong>ID:</strong> {viewData.id}</Typography>
                    <Typography variant="body1"><strong>Nombre:</strong> {viewData.Product_Name}</Typography>
                    <Typography variant="body1"><strong>Stock:</strong> {viewData.Stock}</Typography>
                    <Typography variant="body1"><strong>Precio:</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(viewData.Price)}</Typography>
                    <Typography variant="body1"><strong>Categoría:</strong> {categories.find(cat => cat.id === viewData.Category_Id)?.name || 'No disponible'}</Typography>
                    {viewData.Image && (
                        <img src={`http://localhost:1056/${viewData.Image}`} alt={viewData.Product_Name} style={{ width: '100%', height: 'auto', marginTop: '16px' }} />
                    )}
                </Box>
            </Modal>

            {/* Modal para editar producto */}
            <Modal
                open={openEdit}
                onClose={handleEditClose}
            >
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        Editar Producto
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Nombre del Producto"
                        name="Product_Name"
                        value={formData.Product_Name}
                        onChange={handleInputChange}
                        error={!!formErrors.Product_Name}
                        helperText={formErrors.Product_Name}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Stock"
                        type="number"
                        name="Stock"
                        value={formData.Stock}
                        onChange={handleInputChange}
                        error={!!formErrors.Stock}
                        helperText={formErrors.Stock}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Precio"
                        type="number"
                        name="Price"
                        value={formData.Price}
                        onChange={handleInputChange}
                        error={!!formErrors.Price}
                        helperText={formErrors.Price}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="category-edit-label">Categoría</InputLabel>
                        <Select
                            labelId="category-edit-label"
                            id="category-edit-select"
                            name="Category_Id"
                            value={formData.Category_Id}
                            onChange={handleInputChange}
                            error={!!formErrors.Category_Id}
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                        {formErrors.Category_Id && <Typography color="error">{formErrors.Category_Id}</Typography>}
                    </FormControl>
                    <input
                        accept="image/*"
                        type="file"
                        id="image-upload-edit"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload-edit">
                        <Button variant="contained" component="span" sx={{ mt: 2 }}>
                            Subir Imagen
                        </Button>
                    </label>
                    {imagePreviewUrl && (
                        <Box mt={2}>
                            <img src={imagePreviewUrl} alt="Vista previa" style={{ width: '100%', height: 'auto' }} />
                        </Box>
                    )}
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

export default Products;
import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { MdOutlineSave } from "react-icons/md";
import SearchBox from '../../components/SearchBox';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Switch from '@mui/material/Switch';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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

const Products = () => {
    const [columnsPerPage, setColumnsPerPage] = React.useState('');
    const [operation, setOperation] = React.useState(1);
    const [title, setTitle] = React.useState('');
    const [viewData, setViewData] = React.useState({});
    const [formData, setFormData] = React.useState({
        id: '',
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
            show_alerta('Error al cargar las categorías', 'error');
        }
    };

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:1056/api/products');
            setProductData(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar los productos');
            setLoading(false);
            show_alerta('Error al cargar los productos', 'error');
        }
    };

    const handleChange = (event) => {
        setColumnsPerPage(event.target.value);
    };

    const openModal = (op, id, Product_Name, Stock, Price, Category_Id, Image) => {
        setOperation(op);
        setFormData({
            id: id || '',
            Product_Name: Product_Name || '',
            Stock: Stock || '',
            Price: Price || '',
            Category_Id: Category_Id || '',
            Image: null,
        });
        setImagePreviewUrl(Image || '');
        setFormErrors({});
        setTitle(op === 1 ? 'Registrar Producto' : 'Editar Producto');
        window.setTimeout(function () {
            document.getElementById('Product_Name').focus();
        }, 500);
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
        if (!formData.Product_Name.trim()) errors.Product_Name = 'El nombre del producto es obligatorio';
        if (!formData.Stock || isNaN(parseInt(formData.Stock)) || parseInt(formData.Stock) < 0) errors.Stock = 'El stock debe ser un número entero positivo o cero';
        if (!formData.Price || isNaN(parseFloat(formData.Price)) || parseFloat(formData.Price) < 0) errors.Price = 'El precio debe ser un número decimal positivo';
        if (!formData.Category_Id) errors.Category_Id = 'La categoría es obligatoria';

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            const formDataToSend = new FormData();
            formDataToSend.append('Product_Name', formData.Product_Name.trim());
            formDataToSend.append('Stock', parseInt(formData.Stock));
            formDataToSend.append('Price', parseFloat(formData.Price).toFixed(2));
            formDataToSend.append('Category_Id', formData.Category_Id);
            
            if (formData.Image instanceof File) {
                formDataToSend.append('Image', formData.Image);
                formDataToSend.append('ImageFileName', formData.Image.name);
                formDataToSend.append('ImageMimeType', formData.Image.type);
            }
    
            try {
                const response = await axios.post('http://localhost:1056/api/products', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
    
                if (response.status === 200 || response.status === 201) {
                    document.getElementById('btnCerrar').click();
                    fetchProductData();
                    show_alerta('Producto agregado exitosamente', 'success');
                } else {
                    show_alerta('Hubo un problema al agregar el producto', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                if (error.response && error.response.data && error.response.data.errors) {
                    const serverErrors = {};
                    error.response.data.errors.forEach(err => {
                        serverErrors[err.path] = err.msg;
                    });
                    setFormErrors(serverErrors);
                    show_alerta('Por favor, corrija los errores en el formulario', 'error');
                } else {
                    show_alerta('Error al agregar el producto: ' + (error.response?.data?.message || error.message || 'Error desconocido'), 'error');
                }
            }
        } else {
            setFormErrors(errors);
            show_alerta('Por favor, corrija los errores en el formulario', 'error');
        }
    };

    const handleUpdate = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length === 0) {
            const formDataToSend = new FormData();
            formDataToSend.append('Product_Name', formData.Product_Name.trim());
            formDataToSend.append('Stock', parseInt(formData.Stock));
            formDataToSend.append('Price', parseFloat(formData.Price).toFixed(2));
            formDataToSend.append('Category_Id', formData.Category_Id);
            
            if (formData.Image instanceof File) {
                formDataToSend.append('Image', formData.Image);
                formDataToSend.append('ImageFileName', formData.Image.name);
                formDataToSend.append('ImageMimeType', formData.Image.type);
            }

            try {
                const response = await axios.put(`http://localhost:1056/api/products/${formData.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.status === 200) {
                    document.getElementById('btnCerrar').click();
                    fetchProductData();
                    show_alerta('Producto actualizado exitosamente', 'success');
                } else {
                    show_alerta('Hubo un problema al actualizar el producto', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                if (error.response && error.response.data && error.response.data.errors) {
                    const serverErrors = {};
                    error.response.data.errors.forEach(err => {
                        serverErrors[err.path] = err.msg;
                    });
                    setFormErrors(serverErrors);
                    show_alerta('Por favor, corrija los errores en el formulario', 'error');
                } else {
                    show_alerta('Error al actualizar el producto: ' + (error.response?.data?.message || error.message || 'Error desconocido'), 'error');
                }
            }
        } else {
            setFormErrors(errors);
            show_alerta('Por favor, corrija los errores en el formulario', 'error');
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
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained" data-bs-toggle='modal' data-bs-target='#modalProducts'><BsPlusSquareFill />Registrar</Button>
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
                                                        <img src={product.Image} alt={product.Product_Name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                    )}
                                                </td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Button color='primary' className='primary' data-bs-toggle='modal' data-bs-target='#modalViewProduct' onClick={() => setViewData(product)}><FaEye /></Button>
                                                        <Button color="secondary" data-bs-toggle='modal' data-bs-target='#modalProducts' className='secondary' onClick={() => openModal(2, product.id, product.Product_Name, product.Stock, product.Price, product.Category_Id, product.Image)}><FaPencilAlt /></Button>
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

            {/* Modal para agregar/editar producto */}
            <div id="modalProducts" className="modal fade" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <label className="h5">{title}</label>
                            <button type="button" id="btnCerrar" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input type="hidden" id="id" value={formData.id}></input>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    id="Product_Name"
                                    name="Product_Name"
                                    className={`form-control ${formErrors.Product_Name ? 'is-invalid' : ''}`}
                                    placeholder="Nombre del Producto"
                                    value={formData.Product_Name}
                                    onChange={handleInputChange}
                                />
                                {formErrors.Product_Name && <div className="invalid-feedback">{formErrors.Product_Name}</div>}
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="number"
                                    id="Stock"
                                    name="Stock"
                                    className={`form-control ${formErrors.Stock ? 'is-invalid' : ''}`}
                                    placeholder="Stock"
                                    value={formData.Stock}
                                    onChange={handleInputChange}
                                />
                                {formErrors.Stock && <div className="invalid-feedback">{formErrors.Stock}</div>}
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="number"
                                    id="Price"
                                    name="Price"
                                    className={`form-control ${formErrors.Price ? 'is-invalid' : ''}`}
                                    placeholder="Precio"
                                    value={formData.Price}
                                    onChange={handleInputChange}
                                    step="0.01"
                                />
                                {formErrors.Price && <div className="invalid-feedback">{formErrors.Price}</div>}
                            </div>
                            <div className="input-group mb-3">
                                <select
                                    id="Category_Id"
                                    name="Category_Id"
                                    className={`form-control ${formErrors.Category_Id ? 'is-invalid' : ''}`}
                                    value={formData.Category_Id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccione una categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {formErrors.Category_Id && <div className="invalid-feedback">{formErrors.Category_Id}</div>}
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type="file"
                                    id="Image"
                                    name="Image"
                                    className="form-control"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {imagePreviewUrl && (
                                <div className="mb-3">
                                    <img src={imagePreviewUrl} alt="Vista previa" style={{ width: '100%', height: 'auto' }} />
                                </div>
                            )}
                            <div className='modal-footer w-100 m-3'>
                                <div className='d-grid col-3 Modal-buton' onClick={operation === 1 ? handleSubmit : handleUpdate}>
                                    <Button type='button' className='btn-sucess'><MdOutlineSave/>Guardar</Button>
                                </div>
                                <Button type='button' id='btnCerrar' className='btn-blue' data-bs-dismiss='modal'>Cerrar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para ver producto */}
            <div id="modalViewProduct" className="modal fade" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <label className="h5">Ver Producto</label>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p><strong>ID:</strong> {viewData.id}</p>
                            <p><strong>Nombre:</strong> {viewData.Product_Name}</p>
                            <p><strong>Stock:</strong> {viewData.Stock}</p>
                            <p><strong>Categoría:</strong> {categories.find(cat => cat.id === viewData.Category_Id)?.name || 'No disponible'}</p>
                            <p><strong>Precio:</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(viewData.Price)}</p>
                            {viewData.Image && (
                                <div className="text-center mt-3">
                                    <img src={viewData.Image} alt={viewData.Product_Name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Products;
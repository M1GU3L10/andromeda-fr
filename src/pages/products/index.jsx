import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp, IoSearch } from "react-icons/io5";
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import Switch from '@mui/material/Switch';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal, Form } from 'react-bootstrap';
import Pagination from '../../components/pagination/index';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.06),
    },
    '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.12),
    },
}));

const BlueSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: blue[600],
        '&:hover': {
            backgroundColor: alpha(blue[600], theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: blue[600],
    },
}));

const Products = () => {
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [viewData, setViewData] = useState({});
    const [formData, setFormData] = useState({
        id: '',
        Product_Name: '',
        Price: '',
        Category_Id: '',
        Image: '',
        Stock: '',
        status: 'A',
    });
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [productData, setProductData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
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
            const productsWithParsedImage = response.data.map(product => ({
                ...product,
                Image: product.Image ? `data:image/jpeg;base64,${product.Image}` : null
            }));
            setProductData(productsWithParsedImage);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar los productos');
            setLoading(false);
            show_alerta('Error al cargar los productos', 'error');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let updatedValue = value;

        if (name === 'Price') {
            updatedValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: updatedValue
        }));
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
        const errors = {};

        if (!formData.Product_Name || formData.Product_Name.trim() === '') {
            errors.Product_Name = 'El nombre del producto es obligatorio';
        }

        if (!formData.Price || isNaN(formData.Price) || parseFloat(formData.Price) <= 0) {
            errors.Price = 'El precio debe ser un número mayor a cero';
        }

        if (!formData.Category_Id || isNaN(formData.Category_Id)) {
            errors.Category_Id = 'Debe seleccionar una categoría válida';
        }

        return errors;
    };

    const handleUpdate = async () => {
        const errors = validateForm()
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        const dataToSend = {
            Product_Name: formData.Product_Name.trim(),
            Price: parseFloat(formData.Price),
            Category_Id: parseInt(formData.Category_Id),
            Product_Id: formData.id,
            status: formData.status
        }

        try {
            const response = await axios.put(`http://localhost:1056/api/products/${dataToSend.Product_Id}`, dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 200 || response.status === 204) {
                handleClose()
                fetchProductData()
                show_alerta('Producto actualizado exitosamente', 'success')
            } else {
                show_alerta('Hubo un problema al actualizar el producto', 'error')
            }
        } catch (error) {
            console.error('Error:', error)
            show_alerta('Error al actualizar el producto: ' + (error.response?.data?.message || error.message || 'Error desconocido'), 'error')
        }
    }

    const handleSubmit = async () => {
        const errors = validateForm()
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        const dataToSend = {
            Product_Name: formData.Product_Name.trim(),
            Price: parseFloat(formData.Price),
            Category_Id: parseInt(formData.Category_Id),
            status: formData.status
        }

        try {
            const response = await axios.post('http://localhost:1056/api/products', dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 200 || response.status === 201) {
                handleClose()
                fetchProductData()
                show_alerta('Producto agregado exitosamente', 'success')
            } else {
                show_alerta('Hubo un problema al agregar el producto', 'error')
            }
        } catch (error) {
            console.error('Error:', error)
            show_alerta('Error al agregar el producto: ' + (error.response?.data?.message || error.message || 'Error desconocido'), 'error')
        }
    }

    const openModal = (op, id, Product_Name, Price, Category_Id, Image, Stock, status) => {
        setOperation(op);
        setFormData({
            id,
            Product_Name: Product_Name || '',
            Price: Price || '',
            Category_Id: Category_Id || '',
            Image: null,
            Stock: Stock || '',
            status: status || 'A',
        });
        setImagePreviewUrl(Image || '');
        setFormErrors({});
        setTitle(op === 1 ? 'Registrar Producto' : 'Editar Producto');
        setShowModal(true);
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

    const handleSwitchChange = async (productId, checked) => {
        const productToUpdate = productData.find(product => product.id === productId);
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} el producto "${productToUpdate.Product_Name}"?`,
            icon: 'question',
            text: 'Esta acción puede afectar la disponibilidad del producto.',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedProduct = {
                    ...productToUpdate,
                    status: checked ? 'A' : 'I'
                };
                try {
                    const response = await axios.put(`http://localhost:1056/api/products/${productId}`, updatedProduct);
                    if (response.status === 200) {
                        setProductData(productData.map(product =>
                            product.id === productId ? { ...product, status: updatedProduct.status } : product
                        ));
                        show_alerta('Estado del producto actualizado exitosamente', 'success');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    show_alerta('Error al actualizar el estado del producto: ' + (error.response?.data?.message || error.message), 'error');
                }
            } else {
                setProductData(productData.map(product =>
                    product.id === productId ? { ...product, status: !checked ? 'A' : 'I' } : product
                ));
                show_alerta('Estado del producto no cambiado', 'info');
            }
        });
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredItems = productData.filter((product) =>
        product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const handleViewDetails = (product) => {
        setViewData(product);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
    };

    return (
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
                                    icon={<GiHairStrands fontSize="small" />} />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card shadow border-0 p-3'>
                    <div className='row '>
                        <div className='col-sm-5 d-flex align-items-center'>
                            <Button className='btn-register' onClick={() => openModal(1)} variant="contained"><BsPlusSquareFill />Registrar</Button>
                        </div>
                        <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                            <div className="searchBox position-relative d-flex align-items-center">
                                <IoSearch className="mr-2" />
                                <input value={searchTerm} onChange={handleSearchChange} type="text" placeholder='Buscar...' className='form-control' />
                            </div>
                        </div>
                    </div>

                    <div className='table-responsive mt-3'>
                        <table className='table table-bordered table-hover v-align table-striped'>
                            <thead className='table-primary'>
                                <tr>
                                    <th>#</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>Stock</th>
                                    <th>Imagen</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((product, i) => (
                                        <tr key={product.id}>
                                            <td>{(i + 1) + (currentPage - 1) * itemsPerPage}</td>
                                            <td>{product.Product_Name}</td>
                                            <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</td>
                                            <td>{categories.find(cat => cat.id === product.Category_Id)?.name || 'N/A'}</td>
                                            <td>{product.Stock}</td>
                                            <td>{product.Image}</td>
                                            <td><span className={`productStatus ${product.status === 'A' ? '' : 'Inactive'}`}>{product.status === 'A' ? 'Activo' : 'Inactivo'}</span></td>
                                            <td>
                                                <div className='actions d-flex align-items-center'>
                                                    <BlueSwitch
                                                        checked={product.status === 'A'}
                                                        onChange={(e) => handleSwitchChange(product.id, e.target.checked)}
                                                    />
                                                    <Button color='primary' className='primary' onClick={() => handleViewDetails(product)}><FaEye /></Button>
                                                    {product.status === 'A' && (
                                                        <>
                                                            <Button color="secondary" className='secondary' onClick={() => openModal(2, product.id, product.Product_Name, product.Price, product.Category_Id, product.Image, product.Stock, product.status)}><FaPencilAlt /></Button>
                                                            <Button color='error' className='delete' onClick={() => handleDelete(product.id, product.Product_Name)}><IoTrashSharp /></Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className='text-center'>No hay Productos disponibles</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {filteredItems.length > itemsPerPage && (
                            <div className="d-flex table-footer">
                                <Pagination
                                    setCurrentPage={handlePageChange}
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para agregar/editar producto */}
            <Modal show={showModal}>
                <Modal.Header >
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Producto</Form.Label>
                            <Form.Control
                                type="text"
                                name="Product_Name"
                                value={formData.Product_Name}
                                onChange={handleInputChange}
                                isInvalid={!!formErrors.Product_Name}
                                pattern=".*\S.*"  // Asegura que el campo no esté vacío, pero permite espacios
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.Product_Name}
                            </Form.Control.Feedback>
                        </Form.Group>


                        <Form.Group className="mb-3">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control
                                type="number"
                                name="Price"
                                value={formData.Price}
                                onChange={handleInputChange}
                                isInvalid={!!formErrors.Price}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.Price}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Categoría</Form.Label>
                            <Form.Select
                                name="Category_Id"
                                value={formData.Category_Id}
                                onChange={handleInputChange}
                                isInvalid={!!formErrors.Category_Id}
                            >
                                <option value="">Seleccione una categoría</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.Category_Id}
                            </Form.Control.Feedback>
                        </Form.Group>





                        <Form.Group className="mb-3">
                            <Form.Label>Imagen</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                            />
                            {imagePreviewUrl && (
                                <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                      <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} className='btn-sucess'>
                        Guardar
                    </Button>
                  
                </Modal.Footer>
            </Modal>

            {/* Modal para ver detalles del producto */}
            <Modal show={showDetailModal} onHide={handleCloseDetail}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Nombre:</strong> {viewData.Product_Name}</p>
                    <p><strong>Precio:</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(viewData.Price)}</p>
                    <p><strong>Categoría:</strong> {categories.find(cat => cat.id === viewData.Category_Id)?.name || 'N/A'}</p>
                    <p><strong>Stock:</strong> {viewData.Stock}</p>
                    <p><strong>Estado:</strong> {viewData.status === 'A' ? 'Activo' : 'Inactivo'}</p>
                    {viewData.Image && (
                        <img src={viewData.Image} alt="Producto" style={{ maxWidth: '100%', marginTop: '10px' }} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetail}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Products;




























{/* <style>
{`
.modal-header-custom {
    color: #000;
    border-bottom: 1px solid #dee2e6;
    padding: 10px;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
}

.modal-body-custom {
    padding: 15px;
}

.modal-footer-custom {
    border-top: none;
    padding: 10px;
    background-color: #f1f1f1;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-radius: 15px;
}

.input-custom {
    border: 1px solid #ced4da;
    border-radius: 10px;
    padding: 8px;
    font-size: 14px;
}

.img-preview {
    max-width: 100%;
    margin-top: 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
}
`}
</style> */}

{/* <Modal show={showModal} onHide={handleClose} centered className="modal-custom">
    <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body className="modal-body-custom">
        <Form>
            <Form.Group className="mb-3">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control
                    type="text"
                    name="Product_Name"
                    value={formData.Product_Name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.Product_Name}
                    className="input-custom"
                    placeholder="Ingrese el nombre del producto"
                />
                <Form.Control.Feedback type="invalid">
                    {formErrors.Product_Name}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                    type="number"
                    name="Price"
                    value={formData.Price}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.Price}
                    className="input-custom"
                    placeholder="Ingrese el precio"
                />
                <Form.Control.Feedback type="invalid">
                    {formErrors.Price}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                    name="Category_Id"
                    value={formData.Category_Id}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.Category_Id}
                    className="input-custom"
                >
                    <option value="">Seleccione una categoría</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {formErrors.Category_Id}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control
                    type="file"
                    onChange={handleFileChange}
                />
                {imagePreviewUrl && (
                    <img src={imagePreviewUrl} alt="Preview" className="img-preview" />
                )}
            </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
            Cerrar
        </Button>
        <Button variant="primary" onClick={handleSubmit} className='btn-sucess'>
            Guardar
        </Button>
    </Modal.Footer>
</Modal> */}

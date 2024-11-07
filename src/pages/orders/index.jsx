'use client'

import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { emphasize, styled, alpha } from '@mui/material/styles';
import { Button, Breadcrumbs, Chip, Switch } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { GiShoppingCart } from 'react-icons/gi';
import { BsPlusSquareFill } from 'react-icons/bs';
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { IoTrashSharp, IoSearch } from 'react-icons/io5';
import { MdOutlineSave } from 'react-icons/md';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import Pagination from '../../components/pagination/index';
import { blue } from '@mui/material/colors';


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
}))

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
}))

const Orders = () => {
  const url = 'http://localhost:1056/api/orders';
  const usersUrl = 'http://localhost:1056/api/users';
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);  // Estado para los productos
  const [users, setUsers] = useState([]);  // Estado para los usuarios
  const [userNames, setUserNames] = useState({});
  const [formValues, setFormValues] = useState({
    id: '',
    Billnumber: '',
    OrderDate: '',
    registrationDate: '',
    total_price: '',
    status: '',
    id_usuario: '',
    orderDetails: []  // Detalles de la orden
  });


  // Función para cargar las órdenes desde la API
  const fetchOrders = async () => {
    try {
      const response = await axios.get(url);
      setOrders(response.data);
    } catch (error) {
      console.error('Error al obtener las órdenes:', error);
    }
  };

  // Función para obtener productos y usuarios
  const fetchProductsAndUsers = async () => {
    try {
      const productsResponse = await axios.get('http://localhost:1056/api/products');
      const usersResponse = await axios.get('http://localhost:1056/api/users');
      setProducts(productsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error al obtener productos y usuarios:', error);
    }
  };

  // useEffect para cargar las órdenes y los productos/usuarios cuando el componente se monta
  useEffect(() => {
    fetchOrders();
    fetchProductsAndUsers();
  }, []);
  const [operation, setOperation] = React.useState(1)
  const [title, setTitle] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [ordersPerPage] = React.useState(8)
  const [showModal, setShowModal] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})

  const statusOptions = ['Completada', 'Cancelada', 'En proceso']

  React.useEffect(() => {
    getOrders()
  }, [])

  const getOrders = async () => {
    try {
      const response = await axios.get(url)
      setOrders(response.data)
    } catch (error) {
      showAlert('Error al obtener órdenes', 'error')
    }
  }
  useEffect(() => {
    // Función para obtener el nombre de usuario por su id
    const fetchUserNames = async () => {
      try {
        const response = await axios.get('http://localhost:1056/api/users'); // API que devuelve los usuarios
        const users = response.data;
        
        // Mapear los nombres de usuario y almacenarlos en el estado
        const userNamesMap = users.reduce((acc, user) => {
          acc[user.id] = user.name; // Suponiendo que el objeto de usuario tiene 'id' y 'name'
          return acc;
        }, {});

        setUserNames(userNamesMap); // Actualizar el estado con los nombres de los usuarios
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    };

    fetchUserNames();
  }, []);
  const showAlert = (message, icon) => {
    Swal.fire({
      title: message,
      icon: icon,
      confirmButtonText: 'Ok'
    })
  }

  const searcher = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const filteredOrders = orders.filter((order) =>
    order.Billnumber.toLowerCase().includes(search.toLowerCase()) ||
    order.status.toLowerCase().includes(search.toLowerCase())
  )

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  const nPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const openModal = (op, order = null) => {
    setOperation(op);
    setTitle(op === 1 ? 'Registrar orden' : 'Editar orden');

    setFormValues(op === 1
      ? {
        id: '',
        Billnumber: '',
        OrderDate: new Date().toISOString().split('T')[0],
        registrationDate: new Date().toISOString().split('T')[0],
        total_price: '',
        status: '',
        id_usuario: '', // Aquí irá el id del usuario cuando se registre una nueva orden
        orderDetails: []
      }
      : {
        id: order.id,
        Billnumber: order.Billnumber,
        OrderDate: order.OrderDate,
        registrationDate: order.registrationDate,
        total_price: order.total_price,
        status: order.status,
        id_usuario: order.id_usuario.toString(), // El id_usuario viene de la orden al editarla
        orderDetails: order.OrderDetails || []
      }
    );

    setShowModal(true);
  };

  // Función para guardar una nueva orden o actualizar una existente
  const handleSaveOrder = async () => {
    try {
      const orderData = { ...formValues };

      // Si la operación es de creación (op === 1), hacer un POST
      if (operation === 1) {
        const response = await axios.post(url, orderData);
        const orderDetails = formValues.orderDetails.map(detail => ({
          ...detail,
          id_order: response.data.id // Asociar el id de la orden con los detalles
        }));
        await axios.post('http://localhost:1056/api/orderdetails', orderDetails);
      }
      // Si la operación es de edición (op !== 1), hacer un PUT
      else {
        await axios.put(`${url}/${formValues.id}`, orderData);
        const orderDetails = formValues.orderDetails.map(detail => ({
          ...detail,
          id_order: formValues.id // Asociar el id de la orden con los detalles
        }));
        await axios.put('http://localhost:1056/api/orderdetails', orderDetails);
      }

      // Cerrar el modal y recargar las órdenes
      setShowModal(false);
      fetchOrders();  // Refrescar la lista de órdenes
    } catch (error) {
      console.error('Error al guardar la orden:', error);
    }
  };

  const handleClose = () => {
    setShowModal(false)
    setErrors({})
    setTouched({})
  }

  const handleValidation = (name, value) => {
    let error = ''
    switch (name) {

      case 'total_price':
        error = value.trim() === '' ? 'El monto total es requerido' : ''
        break
      case 'status':
        error = value.trim() === '' ? 'El estado es requerido' : ''
        break
      case 'id_usuario':
        error = value.trim() === '' ? 'El ID de usuario es requerido' : ''
        break
      default:
        break
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: error }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormValues(prevValues => ({ ...prevValues, [name]: value }))
    handleValidation(name, value)
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }))
    handleValidation(name, e.target.value)
  }

  const validar = () => {
    const newErrors = {}
    Object.keys(formValues).forEach(key => {
      if (formValues[key].trim() === '' && key !== 'id') {
        newErrors[key] = `El campo ${key} es requerido`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validar()) {
      const metodo = operation === 1 ? 'POST' : 'PUT'
      enviarSolicitud(metodo, formValues)
    } else {
      showAlert('Por favor, complete todos los campos requeridos', 'warning')
    }
  }

  const enviarSolicitud = async (metodo, parametros) => {
    try {
      const response = await axios({
        method: metodo,
        url: metodo === 'PUT' ? `${url}/${parametros.id}` : url,
        data: parametros,
      })
      showAlert('Operación exitosa', 'success')
      handleClose()
      getOrders()
    } catch (error) {
      showAlert(`Error en la solicitud: ${error.response?.data?.message || error.message}`, 'error')
    }
  }

  const deleteOrder = (id, billNumber) => {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
      title: `¿Estás seguro que deseas eliminar la orden ${billNumber}?`,
      icon: 'question',
      text: 'No se podrá dar marcha atrás',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${url}/${id}`)
          .then(() => {
            showAlert('Orden eliminada correctamente', 'success')
            getOrders()
          })
          .catch((error) => {
            showAlert('Error al eliminar la orden', 'error')
            console.error('Error details:', error)
          })
      } else {
        showAlert('La orden NO fue eliminada', 'info')
      }
    })
  }

  const handleViewDetails = async (order) => {
    let orderDetailsHtml = '';
  
    try {
      // Realizar la solicitud GET a la API para obtener los productos
      const response = await axios.get('http://localhost:1056/api/products');
      const products = response.data; // Suponiendo que la API devuelve una lista de productos
  
      // Iterar sobre los detalles de la orden y generar el HTML para cada producto
      for (const detail of order.OrderDetails) {
        // Buscar el nombre del producto basado en el id_producto
        const product = products.find(p => p.id === detail.id_producto);
  
        // Si se encuentra el producto, generar el HTML, si no, mostrar 'Desconocido'
        orderDetailsHtml += `
          <p><strong>Producto:</strong> ${product ? product.Product_Name : 'Desconocido'}</p>
          <p><strong>Cantidad:</strong> ${detail.quantity}</p>
          <p><strong>Precio Unitario:</strong> ${detail.unitPrice}</p>
          <p><strong>Total:</strong> ${detail.total_price}</p>
          <hr />
        `;
      }
  
      // Mostrar los detalles de la orden y los productos en el SweetAlert
      Swal.fire({
        title: 'Detalles de la Orden',
        html: `
          <div class="text-left">
            <p><strong>Número de Factura:</strong> ${order.Billnumber}</p>
            <p><strong>Fecha de Orden:</strong> ${new Date(order.OrderDate).toLocaleDateString()}</p>
            <p><strong>Fecha de Registro:</strong> ${new Date(order.registrationDate).toLocaleDateString()}</p>
            <p><strong>Monto Total:</strong> ${order.total_price}</p>
            <p><strong>Estado:</strong> ${order.status}</p>
            <p><strong>Usuario ID:</strong> ${order.id_usuario}</p>
            <p><strong>Expiración Token:</strong> ${new Date(order.Token_Expiration).toLocaleString()}</p>
            <hr />
            <p><strong>Detalles del Pedido:</strong></p>
            ${orderDetailsHtml}
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    } catch (error) {
      // Si ocurre un error al obtener los productos, mostrar un mensaje de error
      console.error('Error al obtener los productos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la información de los productos.',
        icon: 'error',
        confirmButtonText: 'Cerrar'
      });
    }
  }
  
  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-5'>
            <span className='Title'>Pedidos</span>
          </div>
          <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
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
                label="Pedidos"
                icon={<GiShoppingCart fontSize="small" />}
              />
            </Breadcrumbs>
          </div>
        </div>
        <div className='card shadow border-0 p-3'>
          <div className='row'>
            <div className='col-sm-5 d-flex align-items-center'>
              <Button className='btn-register' onClick={() => openModal(1)} variant="contained"><BsPlusSquareFill />Registrar</Button>
            </div>
            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
              <div className="searchBox position-relative d-flex align-items-center">
                <IoSearch className="mr-2" />
                <input value={search} onChange={searcher} type="text" placeholder='Buscar...' className='form-control' />
              </div>
            </div>
          </div>
          <div className='table-responsive mt-3'>
            <table className='table table-bordered table-hover v-align table-striped'>
              <thead className='table-primary'>
                <tr>
                  <th>#</th>
                  <th>Número de Factura</th>
                  <th>Fecha de Orden</th>
                  <th>Monto Total</th>
                  <th>Estado</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, i) => (
                  <tr key={order.id}>
                    <td>{indexOfFirstOrder + i + 1}</td>
                    <td>{order.Billnumber}</td>
                    <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                    <td>{order.total_price}</td>
                    <td>{order.status}</td>
                    <td>{userNames[order.id_usuario] || 'Cargando...'}</td> {/* Mostrar el nombre del usuario */}

                    {/* Mostrar detalles del producto dentro de la orden */}
                   

                    <td>
                      <div className='actions d-flex align-items-center'>
                        <Button color='primary' className='primary' onClick={() => handleViewDetails(order)}><FaEye /></Button>
                        <Button color="secondary" className='secondary' onClick={() => openModal(2, order)}><FaPencilAlt /></Button>
                        <Button color='error' className='delete' onClick={() => deleteOrder(order.id, order.Billnumber)}><IoTrashSharp /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length > 0 && (
              <div className="d-flex table-footer">
                <Pagination
                  setCurrentPages={setCurrentPage}
                  currentPages={currentPage}
                  nPages={nPages}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Número de Factura</Form.Label>
                  <Form.Control
                    type="text"
                    name="Billnumber"
                    value={formValues.Billnumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.Billnumber && !!errors.Billnumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Billnumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Fecha de Orden</Form.Label>
                  <Form.Control
                    type="date"
                    name="OrderDate"
                    value={formValues.OrderDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Fecha de Registro</Form.Label>
                  <Form.Control
                    type="date"
                    name="registrationDate"
                    value={formValues.registrationDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Monto Total</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="total_price"
                    value={formValues.total_price}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.total_price && !!errors.total_price}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.total_price}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Estado</Form.Label>
                  <Form.Select
                    name="status"
                    value={formValues.status}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.status && !!errors.status}
                  >
                    <option value="">Seleccione un estado</option>
                    {statusOptions.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                  {errors.status && (
                    <div className="invalid-feedback">
                      {errors.status}
                    </div>
                  )}

                </Form.Group>
              </Col>
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Usuario ID</Form.Label>
                  <Form.Control
                    type="number"
                    name="id_usuario"
                    value={formValues.id_usuario}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.id_usuario && !!errors.id_usuario}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.id_usuario}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className='btn-red' onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="primary" className='btn-sucess' onClick={handleSubmit}>
            <MdOutlineSave /> Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Orders
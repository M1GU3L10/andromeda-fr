'use client'

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { emphasize, styled } from '@mui/material/styles'
import { Button, Breadcrumbs, Chip } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import { GiShoppingCart } from 'react-icons/gi'
import { BsPlusSquareFill } from 'react-icons/bs'
import { FaEye, FaPencilAlt, FaMoneyBillWave } from 'react-icons/fa'
import { IoTrashSharp, IoSearch } from 'react-icons/io5'
import { MdOutlineSave } from 'react-icons/md'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Modal, Form } from 'react-bootstrap'
import Pagination from '../../components/pagination'

const API_URL = 'http://localhost:1056/api'

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

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [userNames, setUserNames] = useState({})
  const [formValues, setFormValues] = useState({
    id: '',
    Billnumber: '',
    OrderDate: new Date().toISOString().split('T')[0],
    registrationDate: new Date().toISOString().split('T')[0],
    total_price: '',
    status: '',
    id_usuario: '',
    Token_Expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    orderDetails: []
  })
  const [operation, setOperation] = useState(1)
  const [title, setTitle] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(8)
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({})

  const statusOptions = ['Completada', 'Cancelada', 'Pendiente']

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`)
      setOrders(response.data)
    } catch (error) {
      showAlert('Error al obtener órdenes', 'error')
    }
  }, [])

  const fetchProductsAndUsers = useCallback(async () => {
    try {
      const [productsResponse, usersResponse] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/users`)
      ])
      setProducts(productsResponse.data)
      setUsers(usersResponse.data)
    } catch (error) {
      console.error('Error al obtener productos y usuarios:', error)
    }
  }, [])

  const fetchUserNames = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/users`)
      const userNamesMap = response.data.reduce((acc, user) => {
        acc[user.id] = user.name
        return acc
      }, {})
      setUserNames(userNamesMap)
    } catch (error) {
      console.error('Error al obtener los usuarios', error)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchProductsAndUsers()
    fetchUserNames()
  }, [fetchOrders, fetchProductsAndUsers, fetchUserNames])

  const generateBillNumber = () => {
    return `FAC-${Date.now()}`
  }

  const openModal = (op, order = null) => {
    setOperation(op)
    setTitle(op === 1 ? 'Registrar orden' : 'Editar orden')
    if (op === 1) {
      setFormValues({
        id: '',
        Billnumber: generateBillNumber(),
        OrderDate: new Date().toISOString().split('T')[0],
        registrationDate: new Date().toISOString().split('T')[0],
        total_price: '',
        status: '',
        id_usuario: '',
        Token_Expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        orderDetails: []
      })
    } else {
      setFormValues({
        ...order,
        id_usuario: order.id_usuario.toString(),
        orderDetails: order.OrderDetails || []
      })
    }
    setShowModal(true)
    setErrors({})
  }

  const handleClose = () => {
    setShowModal(false)
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormValues(prevValues => ({ ...prevValues, [name]: value }))
  }

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...formValues.orderDetails]
    newDetails[index] = { ...newDetails[index], [field]: value }

    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) : parseFloat(newDetails[index].quantity)
      const unitPrice = field === 'unitPrice' ? parseFloat(value) : parseFloat(newDetails[index].unitPrice)
      newDetails[index].total_price = (quantity * unitPrice).toFixed(2)
    }

    setFormValues({ ...formValues, orderDetails: newDetails })
  }

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find(product => product.id === parseInt(productId))
    if (selectedProduct) {
      const newDetails = [...formValues.orderDetails]
      newDetails[index] = {
        ...newDetails[index],
        id_producto: parseInt(productId),
        unitPrice: selectedProduct.Price,
        quantity: newDetails[index].quantity || '1',
        total_price: ((newDetails[index].quantity || 1) * selectedProduct.Price).toFixed(2)
      }
      setFormValues(prevValues => ({
        ...prevValues,
        orderDetails: newDetails
      }))
    }
  }

  const handleAddDetail = () => {
    setFormValues({
      ...formValues,
      orderDetails: [...formValues.orderDetails, { quantity: '', unitPrice: '', id_producto: '', total_price: '' }]
    })
  }

  const handleRemoveDetail = (index) => {
    const newOrderDetails = [...formValues.orderDetails]
    newOrderDetails.splice(index, 1)
    setFormValues({
      ...formValues,
      orderDetails: newOrderDetails
    })
  }

  const calculateTotalPrice = useCallback(() => {
    const total = formValues.orderDetails.reduce((sum, detail) => {
      return sum + (parseFloat(detail.total_price) || 0)
    }, 0)
    setFormValues(prevValues => ({ ...prevValues, total_price: total.toFixed(2) }))
  }, [formValues.orderDetails])

  useEffect(() => {
    calculateTotalPrice()
  }, [formValues.orderDetails, calculateTotalPrice])

  const validateForm = () => {
    const newErrors = {}
    if (!formValues.Billnumber) newErrors.Billnumber = 'El número de factura es requerido'
    if (!formValues.OrderDate) newErrors.OrderDate = 'La fecha de orden es requerida'
    if (!formValues.status) newErrors.status = 'El estado es requerido'
    if (!formValues.id_usuario) newErrors.id_usuario = 'El usuario es requerido'
    if (formValues.orderDetails.length === 0) newErrors.orderDetails = 'Debe agregar al menos un detalle'
    formValues.orderDetails.forEach((detail, index) => {
      if (!detail.id_producto) newErrors[`product_${index}`] = 'Seleccione un producto'
      if (!detail.quantity || parseFloat(detail.quantity) <= 0) newErrors[`quantity_${index}`] = 'La cantidad debe ser mayor que 0'
      if (!detail.unitPrice || parseFloat(detail.unitPrice) <= 0) newErrors[`unitPrice_${index}`] = 'El precio unitario debe ser mayor que 0'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      let success = false; // Variable para rastrear si la operación fue exitosa
      try {
        const orderData = {
          ...formValues,
          total_price: parseFloat(formValues.total_price),
          id_usuario: parseInt(formValues.id_usuario),
        };

        let response;
        if (operation === 1) {
          // Crear una nueva orden
          response = await axios.post(`${API_URL}/orders`, orderData);
          const orderId = response.data.id;
          const orderDetails = formValues.orderDetails.map((detail) => ({
            ...detail,
            id_order: orderId,
            quantity: parseInt(detail.quantity),
            unitPrice: parseFloat(detail.unitPrice),
            total_price: parseFloat(detail.total_price),
            id_producto: parseInt(detail.id_producto),
          }));

          await axios.post(`${API_URL}/order-details`, orderDetails);
        } else {
          // Actualizar una orden existente
          await axios.put(`${API_URL}/orders/${formValues.id}`, orderData);
          const orderDetails = formValues.orderDetails.map((detail) => ({
            ...detail,
            id_order: formValues.id,
            quantity: parseInt(detail.quantity),
            unitPrice: parseFloat(detail.unitPrice),
            total_price: parseFloat(detail.total_price),
            id_producto: parseInt(detail.id_producto),
          }));

          await axios.post(`${API_URL}/order-details`, orderDetails);
        }

        success = true; // Indica que la operación fue exitosa
      } catch (error) {
        console.log('La orden se guardó exitosamente');
        showAlert('¡Orden guardada exitosamente!', 'success');

      } finally {
        // Ocultar el modal, recargar la tabla y mostrar la alerta de éxito si no hubo errores
        setShowModal(false);
        await fetchOrders();
        if (success) {
          showAlert('Orden guardada exitosamente', 'success');
        }
      }
    } else {
      showAlert('Por favor, completa todos los campos requeridos', 'warning');
    }
  };








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
        axios.delete(`${API_URL}/orders/${id}`)
          .then(() => {
            showAlert('Orden eliminada correctamente', 'success')
            fetchOrders()
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

  const handleViewDetails = (order) => {
    let orderDetailsHtml = order.OrderDetails.map(detail => {
      const product = products.find(p => p.id === detail.id_producto)
      return `
        <p><strong>Producto:</strong> ${product ? product.Product_Name : 'Desconocido'}</p>
        <p><strong>Cantidad:</strong> ${detail.quantity}</p>
        <p><strong>Precio Unitario:</strong> ${detail.unitPrice}</p>
        <p><strong>Total:</strong> ${detail.total_price}</p>
        <hr />
      `
    }).join('')

    Swal.fire({
      title: 'Detalles de la Orden',
      html: `
        <div class="text-left">
          <p><strong>Número de Factura:</strong> ${order.Billnumber}</p>
          <p><strong>Fecha de Orden:</strong> ${new Date(order.OrderDate).toLocaleDateString()}</p>
          <p><strong>Monto Total:</strong> ${order.total_price}</p>
          <p><strong>Estado:</strong> ${order.status}</p>
          <p><strong>Usuario:</strong> ${userNames[order.id_usuario] || 'Desconocido'}</p>
          <p><strong>Expiración Token:</strong> ${new Date(order.Token_Expiration).toLocaleString()}</p>
          <hr />
          <p><strong>Detalles del Pedido:</strong></p>
          ${orderDetailsHtml}
        </div>
      `,
      confirmButtonText: 'Cerrar'
    })
  }

  const showAlert = (message, icon) => {
    Swal.fire({
      title: message,
      icon: icon,
      confirmButtonText: 'Ok'
    })
  }

  const filteredOrders = orders.filter((order) =>
    order.Billnumber.toLowerCase().includes(search.toLowerCase()) ||
    order.status.toLowerCase().includes(search.toLowerCase()) ||
    (userNames[order.id_usuario] && userNames[order.id_usuario].toLowerCase().includes(search.toLowerCase()))
  )

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const nPages = Math.ceil(filteredOrders.length / ordersPerPage)

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-5'>
            <span className='Title'>Pedidos</span>
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
                  label="Salidas"
                  icon={<FaMoneyBillWave fontSize="small" />}
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
        </div>
        <div className='card shadow border-0 p-3'>
          <div className='row'>
            <div className='col-sm-5 d-flex align-items-center'>
              <Button className='btn-register' onClick={() => openModal(1)} variant="contained"><BsPlusSquareFill />Registrar</Button>
            </div>
            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
              <div className="searchBox position-relative d-flex align-items-center">
                <IoSearch className="mr-2" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder='Buscar...' className='form-control' />
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
                    <td>{userNames[order.id_usuario] || 'Cargando...'}</td>
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
            {filteredOrders.length > 0 ? (
              <div className="d-flex table-footer">
                <Pagination
                  setCurrentPages={setCurrentPage}
                  currentPages={currentPage}
                  nPages={nPages}
                />
              </div>
            ) : (
              <div className="d-flex table-footer"></div>
            )}
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='pb-2'>
              <Form.Label className='required'>Número de Factura</Form.Label>
              <Form.Control
                type="text"
                name="Billnumber"
                value={formValues.Billnumber}
                onChange={handleInputChange}
                disabled
              />
            </Form.Group>
            <Form.Group className='pb-2'>
              <Form.Label className='required'>Fecha de Orden</Form.Label>
              <Form.Control
                type="date"
                name="OrderDate"
                value={formValues.OrderDate}
                onChange={handleInputChange}
              />
              {errors.OrderDate && <span className="text-danger">{errors.OrderDate}</span>}
            </Form.Group>
            <Form.Group className='pb-2'>
              <Form.Label className='required'>Estado</Form.Label>
              <Form.Select
                name="status"
                value={formValues.status}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un estado</option>
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </Form.Select>
              {errors.status && <span className="text-danger">{errors.status}</span>}
            </Form.Group>
            <Form.Group className='pb-2'>
              <Form.Label className='required'>Usuario</Form.Label>
              <Form.Select
                name="id_usuario"
                value={formValues.id_usuario}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un usuario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </Form.Select>
              {errors.id_usuario && <span className="text-danger">{errors.id_usuario}</span>}
            </Form.Group>
            <div>
              <h5>Detalles de la Orden</h5>
              {errors.orderDetails && <span className="text-danger">{errors.orderDetails}</span>}
              {formValues.orderDetails.map((detail, index) => (
                <div key={index} className="mb-3">
                  <Form.Group className='pb-2'>
                    <Form.Label className='required'>Producto</Form.Label>
                    <Form.Select
                      value={detail.id_producto || ""}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                    >
                      <option value="">Seleccione un producto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.Product_Name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors[`product_${index}`] && <span className="text-danger">{errors[`product_${index}`]}</span>}
                  </Form.Group>
                  <Form.Group className='pb-2'>
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      value={detail.quantity}
                      onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)}
                    />
                    {errors[`quantity_${index}`] && <span className="text-danger">{errors[`quantity_${index}`]}</span>}
                  </Form.Group>
                  <Form.Group className='pb-2'>
                    <Form.Label>Precio Unitario</Form.Label>
                    <Form.Control
                      type="number"
                      value={detail.unitPrice}
                      onChange={(e) => handleDetailChange(index, 'unitPrice', e.target.value)}
                      disabled
                    />
                    {errors[`unitPrice_${index}`] && <span className="text-danger">{errors[`unitPrice_${index}`]}</span>}
                  </Form.Group>
                  <Form.Group className='pb-2'>
                    <Form.Label>Total</Form.Label>
                    <Form.Control
                      type="number"
                      value={detail.total_price}
                      disabled
                    />
                  </Form.Group>
                  <Button variant="danger" onClick={() => handleRemoveDetail(index)}>Eliminar</Button>
                </div>
              ))}
              <Button variant="secondary" onClick={handleAddDetail}>Agregar detalle</Button>
            </div>
            <Form.Group className='pb-2 mt-3'>
              <Form.Label>Monto Total</Form.Label>
              <Form.Control
                type="number"
                name="total_price"
                value={formValues.total_price}
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit} className='btn-sucess'>
            <MdOutlineSave /> Guardar
          </Button>
          <Button variant="secondary" onClick={handleClose} className='btn-red'>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Orders
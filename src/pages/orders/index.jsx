  'use client'

    import * as React from 'react'
    import { emphasize, styled } from '@mui/material/styles'
    import axios from 'axios'
    import Breadcrumbs from '@mui/material/Breadcrumbs'
    import Chip from '@mui/material/Chip'
    import HomeIcon from '@mui/icons-material/Home'
    import { GiShoppingCart } from "react-icons/gi"
    import Button from '@mui/material/Button'
    import { BsPlusSquareFill } from "react-icons/bs"
    import { FaEye, FaPencilAlt } from "react-icons/fa"
    import { IoTrashSharp } from "react-icons/io5"
    import { IoSearch } from "react-icons/io5"
    import { show_alerta } from '../../assets/functions'
    import withReactContent from 'sweetalert2-react-content'
    import Swal from 'sweetalert2'
    import 'bootstrap/dist/css/bootstrap.min.css'
    import 'bootstrap/dist/js/bootstrap.bundle.min.js'
    import { Modal, Form } from 'react-bootstrap'
    import Pagination from '../../components/pagination/index'

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
      const url = 'http://localhost:1056/api/orders'
      const usersUrl = 'http://localhost:1056/api/users'
      const [orders, setOrders] = React.useState([])
      const [users, setUsers] = React.useState([])
      const [id, setId] = React.useState('')
      const [Order_Date, setOrderDate] = React.useState('')
      const [Order_Time, setOrderTime] = React.useState('')
      const [Total_Amount, setTotalAmount] = React.useState('')
      const [Status, setStatus] = React.useState('')
      const [User_Id, setUserId] = React.useState('')
      const [operation, setOperation] = React.useState(1)
      const [title, setTitle] = React.useState('')
      const [search, setSearch] = React.useState('')
      const [currentPage, setCurrentPage] = React.useState(1)
      const [ordersPerPage] = React.useState(8)
      const [showModal, setShowModal] = React.useState(false)
      const [showDetailModal, setShowDetailModal] = React.useState(false)
      const [detailData, setDetailData] = React.useState({})

      const statusOptions = ['Completado', 'Cancelado', 'En proceso']

      React.useEffect(() => {
        getOrders()
        getUsers()
      }, [])

      const getOrders = async () => {
        try {
          const response = await axios.get(url)
          setOrders(response.data)
        } catch (error) {
          show_alerta('Error al obtener órdenes', 'error')
        }
      }

      const getUsers = async () => {
        try {
          const response = await axios.get(usersUrl);
          setUsers(response.data);
          console.log('Users loaded:', response.data); // Verificar los datos obtenidos
        } catch (error) {
          show_alerta('Error al obtener usuarios', 'error');
          console.error('Error al obtener usuarios:', error);
        }
      };

      const getUserName = (userId) => {
        const user = users.find(u => u.id === userId); // Busca el usuario por su ID
        return user ? user.name : 'Usuario no encontrado'; // Devuelve el nombre si existe, si no, un mensaje de error
      };
      
      

      const searcher = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
      }

      const filteredOrders = orders.filter((order) =>
        order.Order_Date.toLowerCase().includes(search.toLowerCase()) ||
        order.Status.toLowerCase().includes(search.toLowerCase())
      )

      const indexOfLastOrder = currentPage * ordersPerPage
      const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
      const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

      const nPages = Math.ceil(filteredOrders.length / ordersPerPage)

      const openModal = (op, order = null) => {
        setId('')
        setOrderDate('')
        setOrderTime('')
        setTotalAmount('')
        setStatus('')
        setUserId('')
        setOperation(op)

        if (op === 1) {
          setTitle('Registrar orden')
          const now = new Date()
          setOrderDate(now.toISOString().split('T')[0])
          setOrderTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))
        } else if (op === 2 && order) {
          setTitle('Editar orden')
          setId(order.id)
          setOrderDate(new Date(order.Order_Date).toISOString().split('T')[0])
          setOrderTime(new Date(`2000-01-01T${order.Order_Time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))
          setTotalAmount(order.Total_Amount)
          setStatus(order.Status)
          setUserId(order.User_Id.toString())
        }
        setShowModal(true)
      }

      const handleClose = () => {
        setShowModal(false)
      }

      const validar = () => {
        if (Order_Date.trim() === '' || Order_Time.trim() === '' || Total_Amount.trim() === '' || Status.trim() === '' || User_Id.trim() === '') {
          show_alerta('Todos los campos son obligatorios', 'warning')
          return false
        }
        return true
      }

      const handleSubmit = () => {
        if (validar()) {
          const now = new Date();
      
          // Crear una fecha para `Order_Date` y mantener solo el formato `YYYY-MM-DDTHH:MM:SSZ`
          const orderDateISO = new Date(`${Order_Date}T${Order_Time}`).toISOString();
      
          // Mantener solo el formato `HH:MM:SS` para `Order_Time`
          const formattedOrderTime = new Date(`${Order_Date}T${Order_Time}`).toTimeString().split(' ')[0];
      
          const parametros = {
            Order_Date: orderDateISO, // Enviar en formato ISO completo
            Order_Time: formattedOrderTime, // Enviar solo la hora HH:MM:SS
            Total_Amount: parseFloat(Total_Amount).toFixed(2),
            Status: Status,
            User_Id: parseInt(User_Id),
            Token_Expiration: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          };
      
          // Solo incluir id si estamos editando una orden existente
          if (operation === 2 && id) {
            parametros.id = parseInt(id);
          }
      
          console.log('Sending data:', parametros);
      
          const metodo = operation === 1 ? 'POST' : 'PUT';
          enviarSolicitud(metodo, parametros);
        }
      };
      const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' && parametros.id ? `${url}/${parametros.id}` : url;
        try {
          const response = await axios({
            method: metodo,
            url: urlWithId,
            data: parametros,
          });
          console.log('Response:', response);
          show_alerta('Operación exitosa', 'success');
          if (metodo === 'POST') {
            showExpirationMessage(response.data.Token_Expiration);
          }
          handleClose();
          getOrders();
        } catch (error) {
          console.error('Error details:', error.response);
          
          // Imprimir los detalles del error
          if (error.response?.data?.errors) {
            console.error('Validation errors:', error.response.data.errors);
          }
      
          show_alerta(`Error en la solicitud: ${error.response?.data?.message || error.message}`, 'error');
        }
      };
      
      const showExpirationMessage = (expirationDate) => {
        const expDate = new Date(expirationDate)
        Swal.fire({
          title: 'Pedido registrado',
          html: `
            <p>La orden ha sido registrada exitosamente.</p>
            <p>El token expirará el ${expDate.toLocaleDateString()} a las ${expDate.toLocaleTimeString()}</p>
          `,
          icon: 'info',
          confirmButtonText: 'Entendido'
        })
      }

      const deleteOrder = (id, Order_Date) => {
        const MySwal = withReactContent(Swal)
        MySwal.fire({
          title: `¿Estás seguro que deseas eliminar la orden del ${new Date(Order_Date).toLocaleDateString()}?`,
          icon: 'question',
          text: 'No se podrá dar marcha atrás',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            enviarSolicitud('DELETE', { id: id })
          } else {
            show_alerta('La orden NO fue eliminada', 'info')
          }
        })
      }

      const handleViewDetails = (order) => {
        setDetailData(order)
        setShowDetailModal(true)
      }

      const handleCloseDetail = () => {
        setShowDetailModal(false)
      }

      const translateStatus = (status) => {
        const statusMap = {
          'Completado': 'Completado',
          'En proceso': 'En proceso',
          'Cancelado': 'Cancelado',
          
        }
        return statusMap[status] || status
      }

      return (
        <div className="right-content w-100">
          <div className="row d-flex align-items-center w-100">
            <div className="spacing d-flex align-items-center">
              <div className='col-sm-5'>
                <span className='Title'>Órdenes</span>
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
                      label="Órdenes"
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
                    <input value={search} onChange={searcher} type="text" placeholder='Buscar...' className='form-control' />
                  </div>
                </div>
              </div>
              <div className='table-responsive mt-3'>
                <table className='table table-bordered table-hover v-align table-striped'>
                  <thead className='table-primary'>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Monto Total</th>
                      <th>Estado</th>
                      <th>Usuario ID</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, i) => (
                      <tr key={order.id}>
                        <td>{indexOfFirstOrder + i + 1}</td>
                        <td>{new Date(order.Order_Date).toLocaleDateString()}</td>
                        <td>{new Date(`2000-01-01T${order.Order_Time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                        <td>{order.Total_Amount}</td>
                        <td>{order.Status}</td>
                        <td>{getUserName(order.User_Id)}</td> {/* Muestra el nombre del usuario */}
                          
                        <td>
                          <div className='actions d-flex align-items-center'>
                            <Button color='primary' className='primary' onClick={() => handleViewDetails(order)}><FaEye /></Button>
                            <Button color="secondary" className='secondary' onClick={() => openModal(2, order)}><FaPencilAlt /></Button>
                            <Button color='error' className='delete' onClick={() => deleteOrder(order.id, order.Order_Date)}><IoTrashSharp /></Button>
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
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={Order_Date}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hora</Form.Label>
                  <Form.Control
                    type="time"
                    value={Order_Time}
                    onChange={(e) => setOrderTime(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Monto Total</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={Total_Amount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="Monto Total"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={Status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Sel
    eccione un estado</option>
                    {statusOptions.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Usuario</Form.Label>
                  <Form.Select
                    value={User_Id}
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <option value="">Seleccione un usuario</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleSubmit} className='btn-sucess'>
                Guardar
              </Button>
              <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showDetailModal} onHide={handleCloseDetail}>
            <Modal.Header closeButton>
              <Modal.Title>Detalle de la Orden</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>Fecha:</strong> {new Date(detailData.Order_Date).toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {new Date(`2000-01-01T${detailData.Order_Time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              <p><strong>Monto Total:</strong> {detailData.Total_Amount}</p>
              <p><strong>Estado:</strong> {translateStatus(detailData.Status)}</p>
              <p><strong>Usuario ID:</strong> {detailData.User_Id}</p>
              <p><strong>Expiración Token:</strong> {new Date(detailData.Token_Expiration).toLocaleString()}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseDetail}>Cerrar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      )
    }

    export default Orders
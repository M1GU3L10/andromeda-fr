'use client'

import * as React from 'react'
import { emphasize, styled } from '@mui/material/styles'
import axios from 'axios'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Chip from '@mui/material/Chip'
import HomeIcon from '@mui/icons-material/Home'
import { GiShoppingBag } from "react-icons/gi"
import Button from '@mui/material/Button'
import { BsPlusSquareFill } from "react-icons/bs"
import { FaEye, FaPencilAlt } from "react-icons/fa"
import { IoTrashSharp, IoSearch } from "react-icons/io5"
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

const Products = () => {
  const url = 'http://localhost:1056/api/products'
  const [products, setProducts] = React.useState([])
  const [id, setId] = React.useState('')
  const [Product_Name, setProductName] = React.useState('')
  const [Description, setDescription] = React.useState('')
  const [Price, setPrice] = React.useState('')
  const [Stock, setStock] = React.useState('')
  const [Category, setCategory] = React.useState('')
  const [operation, setOperation] = React.useState(1)
  const [title, setTitle] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [productsPerPage] = React.useState(8)
  const [showModal, setShowModal] = React.useState(false)
  const [showDetailModal, setShowDetailModal] = React.useState(false)
  const [detailData, setDetailData] = React.useState({})

  const categoryOptions = ['Electrónicos', 'Ropa', 'Hogar', 'Alimentos', 'Otros']

  React.useEffect(() => {
    getProducts()
  }, [])

  const getProducts = async () => {
    try {
      const response = await axios.get(url)
      setProducts(response.data)
    } catch (error) {
      show_alerta('Error al obtener productos', 'error')
    }
  }

  const searcher = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const filteredProducts = products.filter((product) =>
    product.Product_Name.toLowerCase().includes(search.toLowerCase()) ||
    product.Category.toLowerCase().includes(search.toLowerCase()) ||
    product.Price.toString().includes(search)
  )

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const nPages = Math.ceil(filteredProducts.length / productsPerPage)

  const openModal = (op, product = null) => {
    setId('')
    setProductName('')
    setDescription('')
    setPrice('')
    setStock('')
    setCategory('')
    setOperation(op)

    if (op === 1) {
      setTitle('Registrar producto')
    } else if (op === 2 && product) {
      setTitle('Editar producto')
      setId(product.id)
      setProductName(product.Product_Name)
      setDescription(product.Description)
      setPrice(product.Price.toString())
      setStock(product.Stock.toString())
      setCategory(product.Category)
    }
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const validar = () => {
    if (Product_Name.trim() === '' || Description.trim() === '' || Price.trim() === '' || Stock.trim() === '' || Category.trim() === '') {
      show_alerta('Todos los campos son obligatorios', 'warning')
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (validar()) {
      const parametros = {
        Product_Name,
        Description,
        Price: parseFloat(Price),
        Stock: parseInt(Stock),
        Category
      }
      
      if (operation === 2 && id) {
        parametros.id = parseInt(id)
      }
      
      const metodo = operation === 1 ? 'POST' : 'PUT'
      enviarSolicitud(metodo, parametros)
    }
  }

  const enviarSolicitud = async (metodo, parametros) => {
    const urlWithId = metodo === 'PUT' && parametros.id ? `${url}/${parametros.id}` : url
    try {
      await axios({
        method: metodo,
        url: urlWithId,
        data: parametros,
      })
      show_alerta('Operación exitosa', 'success')
      handleClose()
      getProducts()
    } catch (error) {
      show_alerta(`Error en la solicitud: ${error.response?.data?.message || error.message}`, 'error')
    }
  }

  const deleteProduct = (id, Product_Name) => {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
      title: `¿Estás seguro que deseas eliminar el producto "${Product_Name}"?`,
      icon: 'question',
      text: 'No se podrá dar marcha atrás',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${url}/${id}`)
          .then(() => {
            show_alerta('Producto eliminado correctamente', 'success')
            getProducts()
          })
          .catch((error) => {
            show_alerta('Error al eliminar el producto', 'error')
            console.error('Error details:', error)
          })
      } else {
        show_alerta('El producto NO fue eliminado', 'info')
      }
    })
  }

  const handleViewDetails = (product) => {
    setDetailData(product)
    setShowDetailModal(true)
  }

  const handleCloseDetail = () => {
    setShowDetailModal(false)
  }

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-5'>
            <span className='Title'>Productos</span>
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
                  icon={<GiShoppingBag fontSize="small" />}
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
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, i) => (
                  <tr key={product.id}>
                    <td>{indexOfFirstProduct + i + 1}</td>
                    <td>{product.Product_Name}</td>
                    <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</td>
                    <td>{product.Stock}</td>
                    <td>{product.Category}</td>
                    <td>
                      <div className='actions d-flex align-items-center'>
                        <Button color='primary' className='primary' onClick={() => handleViewDetails(product)}><FaEye /></Button>
                        <Button color="secondary" className='secondary' onClick={() => openModal(2, product)}><FaPencilAlt /></Button>
                        <Button color='error' className='delete' onClick={() => deleteProduct(product.id, product.Product_Name)}><IoTrashSharp /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length > 0 ? (
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
              <Form.Label>Nombre del Producto</Form.Label>
              <Form.Control
                type="text"
                value={Product_Name}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Nombre del Producto"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={Description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del Producto"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={Price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Precio"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                value={Stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={Category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Seleccione una categoría</option>
                {categoryOptions.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
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
          <Modal.Title>Detalle del Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Nombre:</strong> {detailData.Product_Name}</p>
          <p><strong>Descripción:</strong> {detailData.Description}</p>
          <p><strong>Precio:</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(detailData.Price)}</p>
          <p><strong>Stock:</strong> {detailData.Stock}</p>
          <p><strong>Categoría:</strong> {detailData.Category}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseDetail}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Products
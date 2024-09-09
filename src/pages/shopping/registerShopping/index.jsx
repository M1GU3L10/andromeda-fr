import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FcSalesPerformance } from "react-icons/fc";
import { FaMoneyBillWave } from "react-icons/fa";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BsPlusSquareFill } from "react-icons/bs";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { FaEye } from "react-icons/fa";
import { TbFileDownload } from "react-icons/tb";
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";


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
})

const RegisterSales = () => {
    //UseStates
    const url = 'http://localhost:1056/api/sales'
    const urlUsers = 'http://localhost:1056/api/users'
    const [sales, SetSales] = useState([])
    const [users, SetUsers] = useState([])
    //End useStates

    useEffect(() => {
        getUsers();
    }, [])


    const getUsers = async () => {
        const response = await axios.get(urlUsers)
        SetUsers(response.data)
    }

    const userName = (userId) => {
        const user = users.find(user => user.id === userId)
        return user ? user.name : 'Desconocido'
    }
    return (
        <>
            <div className="right-content w-100">
                <div class="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Registrar Ventas</span>
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
                                        label="Ventas"
                                        icon={<FcSalesPerformance fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card border-0 p-3 d-flex colorTransparent'>
                        <div className='row'>
                            <div className='col-sm-7'>
                                <div className='card-detail shadow border-0'>
                                    <div className='row p-3'>
                                        <div className='bcg-w col-sm-7 d-flex align-items-center'>
                                            <div className="position-relative d-flex align-items-center">
                                                <span className='Title'>Detalle de venta</span>
                                            </div>
                                        </div>
                                        <div className='col-sm-5 d-flex align-items-center justify-content-end'>
                                            <div className="searchBox position-relative d-flex align-items-center">
                                                <IoSearch className="mr-2" />
                                                <input type="text" placeholder='Buscar...' className='form-control' />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='table-responsive mt-3 w-80'>
                                        <table className='table table-bordered table-hover v-align table-striped '>
                                            <thead className='table-light'>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio unt</th>
                                                    <th>Subtotal</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Camisa adidas</td>
                                                    <td>5</td>
                                                    <td>200000</td>
                                                    <td>1000000</td>
                                                    <td >
                                                        <div className='d-flex align-items-center'>
                                                            <Button color='error' className='delete' ><IoTrashSharp /></Button>
                                                            <div className='actions-quantity'>
                                                                <Button className='primary'><FaPlus /></Button>
                                                                <Button className='primary'><FaMinus /></Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                                        <span className='Monto'>Total:</span>
                                        <span className='valor'>$1000000</span>
                                    </div>
                                </div>

                            </div>
                            <div className='col-sm-5'>
                                <div className='card-detail shadow border-0'>
                                    <div className="cont-title w-100">
                                        <span className='Title'>Info de venta</span>
                                    </div>
                                    <div className='d-flex align-items-center'>
                                        <div className="d-flex align-items-center w-100 p-4">
                                            <Form className='form'>
                                                <Form.Group as={Row} className="mb-3" controlId="formBasicEmail">
                                                    <Col sm="6">
                                                        <Form.Label># Factura</Form.Label>
                                                        <Form.Control type="text" placeholder="text" />
                                                    </Col>
                                                    <Col sm="6">
                                                        <Form.Label>Fecha venta</Form.Label>
                                                        <Form.Control type="text" placeholder="text" />
                                                    </Col>
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Usuario</Form.Label>
                                                    <Form.Select
                                                        id='userId'
                                                        name="userId"
                                                    >
                                                        <option value="">Seleccionar usuario</option>
                                                        <option value="">User 1</option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">

                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group className='d-flex align-items-center justify-content-end'>
                                                    <Button variant="primary" type="submit" className='btn-sucess'>
                                                        Guardar
                                                    </Button>
                                                    <Button variant="secondary" className='btn-red'>
                                                        Cerrar
                                                    </Button>
                                                </Form.Group>
                                            </Form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterSales;
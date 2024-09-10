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
import { Link } from 'react-router-dom';


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

const Sales = () => {
    //UseStates
    const url = 'http://localhost:1056/api/sales'
    const urlUsers = 'http://localhost:1056/api/users'
    const [sales, SetSales] = useState([])
    const [users, SetUsers] = useState([])
    //End useStates

    useEffect(() => {
        getSales();
        getUsers();
    }, [])

    const getSales = async () => {
        const response = await axios.get(url)
        SetSales(response.data)
    }

    const getUsers = async () => {
        const response = await axios.get(urlUsers)
        SetUsers(response.data)
    }

    const userName = (userId) =>{
        const user = users.find(user => user.id === userId)
        return user ? user.name : 'Desconocido'
    }
    return (
        <>
            <div className="right-content w-100">
                <div class="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Ventas</span>
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
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Link className='btn-register btn btn-primary' variant="contained" to="/salesRegister"><BsPlusSquareFill />Registrar</Link>
                            </div>
                            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                                <div className="searchBox position-relative d-flex align-items-center">
                                    <IoSearch className="mr-2" />
                                    <input type="text" placeholder='Buscar...' className='form-control' />
                                </div>
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            <table className='table table-bordered table-hover v-align table-striped'>
                                <thead className='table-primary'>
                                    <tr>
                                        <th>#</th>
                                        <th>Nmro factura</th>
                                        <th>Fecha venta</th>
                                        <th>Hora registro</th>
                                        <th>MontoTotal</th>
                                        <th>Usuario</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        sales.map((sale, i) => (
                                            <tr key={sale.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{sale.Billnumber}</td>
                                                <td>{sale.SaleDate}</td>
                                                <td>{sale.registrationDate}</td>
                                                <td>{sale.total_price}</td>
                                                <td>{userName(sale.id_usuario)}</td>
                                                <td>{sale.status}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Button color="primary" className='primary' ><FaEye /></Button>
                                                        <Button color='warning' className='warning'><TbFileDownload /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sales;
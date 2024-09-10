import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaCartPlus } from "react-icons/fa6";
import { IoCart } from "react-icons/io5";
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
import Pagination from '../../components/pagination/index';



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

const Shopping = () => {
    //useStates
    const url = 'http://localhost:1056/api/shopping'
    const urlSupplier = 'http://localhost:1056/api/suppliers'
    const [shopping, SetShopping] = useState([])
    const [suppliers, SetSuppliers] = useState([])
    const [dataQt, setDataQt] = useState(5);
    const [currentPages, setCurrentPages] = useState(1);
    const [search, setSearch] = useState('');  // Estado para la búsqueda


    useEffect(() => {
        getShopping();
        getSuppliers();
    }, [])


    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(shopping.length / dataQt);


    let results = [];
    if (!search) {
        results = shopping.slice(indexStart, indexEnd); 
    } else {
        results = shopping.filter((dato) =>
            dato.code.toLowerCase().includes(search.toLowerCase())
        );
    }


    const getShopping = async () => {
        const response = await axios.get(url)
        SetShopping(response.data)
    }

    const getSuppliers = async () => {
        const response = await axios.get(urlSupplier)
        SetSuppliers(response.data)
    }

    const supplierName = (supplierId) => {
        const supplier = suppliers.find(supplier => supplier.id === supplierId)
        return supplier ? supplier.Supplier_Name : 'Desconocido'
    }


    return (
        <>
            <div className="right-content w-100">
                <div class="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Compras</span>
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
                                        label="Ingresos"
                                        icon={<IoCart fontSize="small" />}
                                    />
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Compras"
                                        icon={<FaCartPlus fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Link className='btn-register btn btn-primary' to="/shoppingRegister">
                                    <BsPlusSquareFill /> Registrar
                                </Link>
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
                                        <th>codigo</th>
                                        <th>Fecha compra</th>
                                        <th>Fecha registro</th>
                                        <th>Monto Total</th>
                                        <th>Proveedor</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        shopping.map((shopping, i) => (
                                            <tr key={shopping.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{shopping.code}</td>
                                                <td>{shopping.purchaseDate}</td>
                                                <td>{shopping.registrationDate}</td>
                                                <td>{shopping.total_price}</td>
                                                <td>{supplierName(shopping.supplierId)}</td>
                                                <td>{shopping.status}</td>
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
                            {
                                results.length > 0 ? (
                                    <div className="d-flex table-footer">
                                        <Pagination
                                            setCurrentPages={setCurrentPages}
                                            currentPages={currentPages}
                                            nPages={nPages} />
                                    </div>
                                ) : (<div className="d-flex table-footer">
                                </div>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}



export default Shopping;
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
import { useNavigate } from 'react-router-dom';
import DocumentPdf from './viewShopping';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import Modal from 'react-bootstrap/Modal'; // Importación del modal de React-Bootstrap
import { Switch } from '@mui/material';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';



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

const Shopping = () => {
    const [shopping, setShopping] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [dataQt, setDataQt] = useState(5);
    const [currentPages, setCurrentPages] = useState(1);
    const [search, setSearch] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedShopping, setSelectedShopping] = useState(null);

    useEffect(() => {
        getShopping();
        getSuppliers();
        getProducts();
    }, []);

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const filteredResults = shopping.filter((dato) =>
        dato.code.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedResults = filteredResults.slice(indexStart, indexEnd);
    const nPages = Math.ceil(filteredResults.length / dataQt);

    const getShopping = async () => {
        const response = await axios.get('http://localhost:1056/api/shopping');
        setShopping(response.data);
    };

    const getSuppliers = async () => {
        const response = await axios.get('http://localhost:1056/api/suppliers');
        setSuppliers(response.data);
    };

    const getProducts = async () => {
        try {
            const response = await axios.get('http://localhost:1056/api/products');
            setProducts(response.data || []); // Asegúrate de que response.data sea un array
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]); // Inicializa como un array vacío en caso de error
        }
    };


    const supplierName = (supplierId) => {
        const supplier = suppliers.find(supplier => supplier.id === supplierId);
        return supplier ? supplier.Supplier_Name : 'Desconocido';
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPages(1); // Resetear la paginación al hacer una búsqueda
    };

    const handleOpenModal = (shopping) => {
        setSelectedShopping(shopping);
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedShopping(null);
    };

    const handleSwitchChange = async (shoppingId, currentStatus) => {
        if (currentStatus === 'anulada') {
            Swal.fire('No permitido', 'No se puede cambiar el estado de una compra anulada.', 'warning');
            return;
        }
    
        const newStatus = currentStatus === 'completada' ? 'anulada' : 'completada';
        const MySwal = withReactContent(Swal);
    
        MySwal.fire({
            title: `¿Estás seguro que deseas ${newStatus === 'completada' ? 'completar' : 'anular'} la compra?`,
            icon: 'question',
            text: `Esta acción cambiará el estado de la compra a "${newStatus}".`,
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    let response;
                    if (newStatus === 'anulada') {
                        // Si se anula la compra, se llama a la ruta específica para cancelar
                        response = await axios.patch(`http://localhost:1056/api/shopping/${shoppingId}/cancel`, { status: 'anulada' });
                    } else {
                        // Si se completa la compra, simplemente se actualiza el estado
                        response = await axios.put(`http://localhost:1056/api/shopping/${shoppingId}`, { status: 'completada' });
                    }
    
                    if (response.status === 200) {
                        // Actualización exitosa del estado de la compra
                        setShopping(prevShopping => prevShopping.map(item =>
                            item.id === shoppingId ? { ...item, status: newStatus } : item
                        ));
                        Swal.fire('Estado actualizado', `El estado de la compra se ha actualizado a ${newStatus}.`, 'success');
                    }
                } catch (error) {
                    console.error('Error al actualizar el estado de la compra:', error);
                    Swal.fire('Error', 'Hubo un problema al actualizar el estado de la compra.', 'error');
                }
            }
        });
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
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
                                    <input
                                        type="text"
                                        placeholder='Buscar...'
                                        className='form-control'
                                        value={search}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            <table className='table table-bordered table-hover v-align table-striped'>
                                <thead className='table-primary'>
                                    <tr>
                                        <th>#</th>
                                        <th>Codigo</th>
                                        <th>Fecha compra</th>
                                        <th>Fecha registro</th>
                                        <th>Monto Total</th>
                                        <th>Proveedor</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedResults.length > 0 ? (
                                        paginatedResults.map((shopping, i) => (
                                            <tr key={shopping.id}>
                                                <td>{(indexStart + i + 1)}</td>
                                                <td>{shopping.code}</td>
                                                <td>{shopping.purchaseDate}</td>
                                                <td>{shopping.registrationDate}</td>
                                                <td>{shopping.total_price}</td>
                                                <td>{supplierName(shopping.supplierId)}</td>
                                                <td>{shopping.status}</td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Switch
                                                            checked={shopping.status.toLowerCase() === 'completada'}
                                                            onChange={(e) => handleSwitchChange(shopping.id, shopping.status.toLowerCase())}
                                                        />
                                                        <Button color='primary' className='primary' onClick={() => handleOpenModal(shopping)}>
                                                            <FaEye />
                                                        </Button>
                                                        <PDFDownloadLink document={<DocumentPdf shopping={shopping} />} fileName={`Detalle Compra ${shopping.code}.pdf`}>
                                                            <Button color='warning' className='warning'><TbFileDownload /></Button>
                                                        </PDFDownloadLink>
                                                    </div>
                                                </td>


                                            </tr>
                                        ))
                                    ) : 
                                    (
                                        <tr>
                                            <td colSpan={7} className='text-center'>No hay compras disponibles</td>
                                        </tr>
                                    )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showDetailModal}>
                <Modal.Body>
                    {selectedShopping && products.length > 0 && (
                        <PDFViewer className='Pdf-Modal' width="100%" height="500px">
                            <DocumentPdf shopping={selectedShopping} suppliers={suppliers} products={products} />
                        </PDFViewer>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Shopping;
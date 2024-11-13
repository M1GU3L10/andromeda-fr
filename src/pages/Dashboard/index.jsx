import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { IoCart } from "react-icons/io5";

const appointmentsData = [
    { status: 'completada', value: 10 },
    { status: 'cancelada', value: 5 },
    { status: 'pendiente', value: 8 },
];

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

const Dashboard = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [appointments, setAppointments] = useState(appointmentsData);
    const [shopping, setShopping] = useState([]);

    // Group and sum appointments by status
    const groupedAppointments = [
        {
            status: 'Completada',
            value: appointments.filter(app => app.status === 'completada').reduce((acc, app) => acc + app.value, 0),
        },
        {
            status: 'Cancelada',
            value: appointments.filter(app => app.status === 'cancelada').reduce((acc, app) => acc + app.value, 0),
        },
        {
            status: 'Pendiente',
            value: appointments.filter(app => app.status === 'pendiente').reduce((acc, app) => acc + app.value, 0),
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const salesResponse = await fetch('http://localhost:1056/api/sales');
                const salesData = await salesResponse.json();
                const formattedSales = salesData.map(sale => ({
                    date: sale.SaleDate,
                    total: sale.total_price,
                    status: sale.status
                }));
                setSales(formattedSales);

                const productsResponse = await fetch('http://localhost:1056/api/products');
                const productsData = await productsResponse.json();
                const formattedProducts = productsData.map(product => ({
                    name: product.Product_Name,
                    stock: product.Stock,
                    price: parseFloat(product.Price)
                }));
                setProducts(formattedProducts);

                const appointmentsResponse = await fetch('http://localhost:1056/api/appointment');
                const appointmentsData = await appointmentsResponse.json();
                const formattedAppointments = appointmentsData.map(appointment => ({
                    status: appointment.status,
                    value: 1
                }));
                setAppointments(formattedAppointments);

                const shoppingResponse = await fetch('http://localhost:1056/api/shopping');
                const shoppingData = await shoppingResponse.json();
                const formattedShopping = shoppingData.map(shop => ({
                    date: shop.purchaseDate,
                    total: shop.total_price,
                    status: shop.status
                }));
                setShopping(formattedShopping);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Dashboard</span>
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
                                    label="Dashboard"
                                    icon={<IoCart fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>

                <div className='card shadow border-0 p-3'>
                    <div className="row">
                        {/* Sales Chart */}
                        <div className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">Ventas</h5>
                                    <div className="chart-container">
                                        <LineChart width={500} height={300} data={sales}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Ventas" />
                                        </LineChart>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Chart */}
                        <div className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">Inventario de Productos</h5>
                                    <div className="chart-container">
                                        <BarChart width={500} height={300} data={products}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="stock" fill="#82ca9d" name="Stock" barSize={15} />
                                            <Bar dataKey="price" fill="#ffc658" name="Precio" barSize={15} />
                                        </BarChart>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Appointments Chart */}
                        <div className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">Citas</h5>
                                    <div className="chart-container">
                                        <PieChart width={500} height={300}>
                                            <Pie
                                                data={groupedAppointments}
                                                dataKey="value"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                label
                                            >
                                                <Cell key="completada" fill="#006400" />  {/* Verde Oscuro para Citas Completadas */}

                                                <Cell key="cancelada" fill="#FF0000" />  {/* Rojo para Citas Canceladas */}


                                                <Cell key="pendiente" fill="#808080" />  
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shopping Chart */}
                        <div className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">Compras</h5>
                                    <div className="chart-container">
                                        <LineChart width={500} height={300} data={shopping}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="total" stroke="#ff0000" name="Total Compras" />
                                        </LineChart>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

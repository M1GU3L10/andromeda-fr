import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { IoCart } from "react-icons/io5";

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
    const [appointments, setAppointments] = useState([]);
    const [shopping, setShopping] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sales data
                const salesResponse = await fetch('http://localhost:1056/api/sales');
                const salesData = await salesResponse.json();
                const formattedSales = salesData.map(sale => ({
                    date: sale.SaleDate,
                    total: sale.total_price,
                    status: sale.status
                }));
                setSales(formattedSales);

                // Fetch products data
                const productsResponse = await fetch('http://localhost:1056/api/products');
                const productsData = await productsResponse.json();
                const formattedProducts = productsData.map(product => ({
                    name: product.Product_Name,
                    stock: product.Stock,
                    price: parseFloat(product.Price)
                }));
                setProducts(formattedProducts);

                // Fetch appointments data
                const appointmentsResponse = await fetch('http://localhost:1056/api/appointment');
                const appointmentsData = await appointmentsResponse.json();
                const formattedAppointments = appointmentsData.map(appointment => ({
                    date: appointment.Date,
                    total: parseFloat(appointment.Total),
                    status: appointment.status
                }));
                setAppointments(formattedAppointments);

                // Fetch shopping data
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
                                        <LineChart width={500} height={300} data={products}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="stock" stroke="#82ca9d" name="Stock" />
                                            <Line type="monotone" dataKey="price" stroke="#ffc658" name="Precio" />
                                        </LineChart>
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
                                        <LineChart width={500} height={300} data={appointments}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="total" stroke="#ff7300" name="Total Citas" />
                                        </LineChart>
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
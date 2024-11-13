import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';

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
  const [shoppingData, setShoppingData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const salesResponse = await fetch('http://localhost:1056/api/sales');
      const salesData = await salesResponse.json();
      setSales(salesData);

      const productsResponse = await fetch('http://localhost:1056/api/products');
      const productsData = await productsResponse.json();
      setProducts(productsData);

      const appointmentsResponse = await fetch('http://localhost:1056/api/appointments');
      const appointmentsData = await appointmentsResponse.json();
      setAppointments(appointmentsData);

      const shoppingResponse = await fetch('http://localhost:1056/api/shopping');
      const shoppingData = await shoppingResponse.json();
      setShoppingData(shoppingData);
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="right-content w-100">
        <div className="row d-flex align-items-center w-100">
          <div className="spacing d-flex align-items-center">
            <div className="col-sm-5">
              <span className="Title">Dashboard</span>
            </div>
            <div className="col-sm-7 d-flex align-items-center justify-content-end pe-4">
              <div role="presentation">
                <Breadcrumbs aria-label="breadcrumb">
                  <StyledBreadcrumb
                    component="a"
                    href="#"
                    label="Home"
                    icon={<HomeIcon fontSize="small" />}
                  />
                </Breadcrumbs>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-sm-6">
          <Card>
            <CardHeader title="Sales" />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sales}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="col-sm-6">
          <Card>
            <CardHeader title="Product Inventory" />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={products}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="stock" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-sm-6">
          <Card>
            <CardHeader title="Appointments" />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={appointments}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="col-sm-6">
          <Card>
            <CardHeader title="Shopping Data" />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={shoppingData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_sales" stroke="#ff7b00" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

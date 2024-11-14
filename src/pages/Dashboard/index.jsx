'use client'

import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer
} from 'recharts'
import { emphasize, styled } from '@mui/material/styles'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Chip from '@mui/material/Chip'
import HomeIcon from '@mui/icons-material/Home'
import { IoCart } from "react-icons/io5"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { renderToString } from 'react-dom/server'
import Chart from 'chart.js/auto'

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
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

// Styles for PDF
const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff' },
  section: { margin: 10, padding: 10 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  subtitle: { fontSize: 18, marginTop: 15, marginBottom: 10 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 'auto', marginTop: 5, fontSize: 10 },
  chart: { width: '100%', height: 200, marginVertical: 10 },
})

// Helper function to convert chart to image
const chartToImage = async (chartConfig) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    
    const tempDiv = document.createElement('div')
    tempDiv.style.width = '800px'
    tempDiv.style.height = '400px'
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    document.body.appendChild(tempDiv)

    const chart = new Chart(ctx, {
      ...chartConfig,
      options: {
        ...chartConfig.options,
        animation: false,
        responsive: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    })

    requestAnimationFrame(() => {
      const imageData = canvas.toDataURL('image/png', 1.0)
      chart.destroy()
      document.body.removeChild(tempDiv)
      resolve(imageData)
    })
  })
}

// DashboardPDF component
const DashboardPDF = ({ sales, products, appointments, shopping, chartImages }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Informe del Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Ventas</Text>
        {chartImages.salesChart && <Image style={styles.chart} src={chartImages.salesChart} />}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Fecha</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Total</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Estado</Text></View>
          </View>
          {sales.slice(0, 5).map((sale, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{sale.date}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{sale.total}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{sale.status}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Productos</Text>
        {chartImages.productsChart && <Image style={styles.chart} src={chartImages.productsChart} />}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Nombre</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Stock</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Precio</Text></View>
          </View>
          {products.slice(0, 5).map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{product.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{product.stock}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{product.price}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Citas</Text>
        {chartImages.appointmentsChart && <Image style={styles.chart} src={chartImages.appointmentsChart} />}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Estado</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Cantidad</Text></View>
          </View>
          {appointments.map((appointment, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{appointment.status}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{appointment.value}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Compras</Text>
        {chartImages.shoppingChart && <Image style={styles.chart} src={chartImages.shoppingChart} />}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Fecha</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Total</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Estado</Text></View>
          </View>
          {shopping.slice(0, 5).map((shop, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{shop.date}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{shop.total}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{shop.status}</Text></View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
)

const createChartConfigs = (data) => ({
  sales: {
    type: 'line',
    data: {
      labels: data.sales.map(sale => sale.date),
      datasets: [{
        label: 'Total Ventas',
        data: data.sales.map(sale => sale.total),
        borderColor: '#4C6EF5',
        backgroundColor: 'rgba(76, 110, 245, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  },
  products: {
    type: 'bar',
    data: {
      labels: data.products.map(product => product.name),
      datasets: [
        {
          label: 'Stock',
          data: data.products.map(product => product.stock),
          backgroundColor: '#82ca9d'
        },
        {
          label: 'Precio',
          data: data.products.map(product => product.price),
          backgroundColor: '#ffc658'
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  },
  appointments: {
    type: 'pie',
    data: {
      labels: ['Completada', 'Cancelada', 'Pendiente'],
      datasets: [{
        data: [
          data.appointments.filter(app => app.status === 'completada').length,
          data.appointments.filter(app => app.status === 'cancelada').length,
          data.appointments.filter(app => app.status === 'pendiente').length
        ],
        backgroundColor: ['#4C6EF5', '#F28B82', '#B0BEC5']
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  },
  shopping: {
    type: 'line',
    data: {
      labels: data.shopping.map(shop => shop.date),
      datasets: [{
        label: 'Total Compras',
        data: data.shopping.map(shop => shop.total),
        borderColor: '#F28B82',
        backgroundColor: 'rgba(242, 139, 130, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  }
})

export default function Dashboard() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [appointments, setAppointments] = useState([])
  const [shopping, setShopping] = useState([])
  const [chartImages, setChartImages] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesResponse = await fetch('http://localhost:1056/api/sales')
        const salesData = await salesResponse.json()
        const formattedSales = salesData.map(sale => ({
          date: sale.SaleDate,
          total: sale.total_price,
          status: sale.status
        }))
        setSales(formattedSales)

        const productsResponse = await fetch('http://localhost:1056/api/products')
        const productsData = await productsResponse.json()
        const formattedProducts = productsData.map(product => ({
          name: product.Product_Name,
          stock: product.Stock,
          price: parseFloat(product.Price)
        }))
        setProducts(formattedProducts)

        const appointmentsResponse = await fetch('http://localhost:1056/api/appointment')
        const appointmentsData = await appointmentsResponse.json()
        const formattedAppointments = appointmentsData.map(appointment => ({
          status: appointment.status,
          value: 1
        }))
        setAppointments(formattedAppointments)

        const shoppingResponse = await fetch('http://localhost:1056/api/shopping')
        const shoppingData = await shoppingResponse.json()
        const formattedShopping = shoppingData.map(shop => ({
          date: shop.purchaseDate,
          total: shop.total_price,
          status: shop.status
        }))
        setShopping(formattedShopping)

        // Generate chart images
        const chartConfigs = createChartConfigs({
          sales: formattedSales,
          products: formattedProducts,
          appointments: formattedAppointments,
          shopping: formattedShopping
        })

        const salesChart = await chartToImage(chartConfigs.sales)
        const productsChart = await chartToImage(chartConfigs.products)
        const appointmentsChart = await chartToImage(chartConfigs.appointments)
        const shoppingChart = await chartToImage(chartConfigs.shopping)

        setChartImages({
          salesChart,
          productsChart,
          appointmentsChart,
          shoppingChart
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // Group and sum appointments by status
  const groupedAppointments = [
    {
      status: 'Completada',
      value: appointments.filter(app => app.status === 'completada').length,
    },
    {
      status: 'Cancelada',
      value: appointments.filter(app => app.status === 'cancelada').length,
    },
    {
      status: 'Pendiente',
      value: appointments.filter(app => app.status === 'pendiente').length,
    }
  ]

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
              <div className="card h-100" style={{
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease-in-out'
              }}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Ventas</h5>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={sales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#4C6EF5" strokeWidth={2} name="Total Ventas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Chart */}
            <div className="col-md-6 mb-4">
              <div className="card h-100" style={{
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease-in-out'
              }}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Inventario de Productos</h5>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={products}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" fill="#82ca9d" name="Stock" />
                        <Bar dataKey="price" fill="#ffc658" name="Precio" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Chart */}
            <div className="col-md-6 mb-4">
              <div className="card h-100" style={{
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease-in-out'
              }}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Citas</h5>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={groupedAppointments}
                          dataKey="value"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {groupedAppointments.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#4C6EF5', '#F28B82', '#B0BEC5'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Shopping Chart */}
            <div className="col-md-6 mb-4">
              <div className="card h-100" style={{
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease-in-out'
              }}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Compras</h5>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={shopping}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#F28B82" strokeWidth={2} name="Total Compras" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-center">
              <PDFDownloadLink 
                document={<DashboardPDF sales={sales} products={products} appointments={groupedAppointments} shopping={shopping} chartImages={chartImages} />} 
                fileName="dashboard-report.pdf"
              >
                {({ blob, url, loading, error }) => (
                  <button 
                    className="btn btn-primary btn-lg"
                    style={{
                      backgroundColor: '#4C6EF5',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Generando informe...' : 'Generar y Descargar Informe PDF'}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import axios from "axios";

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    header: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
        color: '#4A4A4A',
        textTransform: 'uppercase',
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoColumn: {
        flex: 1,
    },
    infoItem: {
        marginBottom: 5,
    },
    label: {
        fontSize: 8,
        color: '#888888',
    },
    value: {
        fontSize: 10,
        color: '#333333',
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCell: {
        margin: 'auto',
        marginTop: 3,
        marginBottom: 3,
        fontSize: 8,
    },
    total: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        fontSize: 6,
        color: '#888888',
        textAlign: 'center',
    },
});

const DocumentPdf = ({ sale }) => {
    const urlUsers = 'http://localhost:1056/api/users'
    const urlProducts = 'http://localhost:1056/api/products'
    const [users, SetUsers] = useState([])
    const [products, setProducts] = useState([])

    useEffect(() => {
        getUsers();
        getProducts();
    }, [])

    const getUsers = async () => {
        const response = await axios.get(urlUsers)
        SetUsers(response.data)
    }

    const getProducts = async () =>{
        const response = await axios.get(urlProducts)
        setProducts(response.data)
    }

    const NameProduct = (productId) =>{
        const product = products.find(product => product.id == productId)
        return product ? product.Product_Name : 'Producto Desconocido'
    }

    const userName = (userId) => {
        const user = users.find(user => user.id === userId)
        return user ? user.name : 'Desconocido'
    }


    return (
        <Document>
            <Page size="A6" style={styles.page}>
                <Text style={styles.header}>Factura #{sale.Billnumber}</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Fecha de Venta</Text>
                            <Text style={styles.value}>{new Date(sale.SaleDate).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Estado</Text>
                            <Text style={styles.value}>{sale.status}</Text>
                        </View>
                    </View>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Cliente</Text>
                            <Text style={styles.value}>{userName(sale.id_usuario)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Fecha de Registro</Text>
                            <Text style={styles.value}>
                                {sale.registrationDate ? new Date(sale.registrationDate).toLocaleDateString() : 'No registrada'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={[styles.tableRow, { backgroundColor: '#F0F0F0' }]}>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>Producto</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>Cantidad</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>Precio Unit.</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>Total</Text>
                        </View>
                    </View>
                    {sale.SaleDetails.map((detail, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{NameProduct(detail.id_producto)}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{detail.quantity}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>${detail.unitPrice.toLocaleString()}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>${detail.total_price.toLocaleString()}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={styles.total}>
                    Total: ${sale.total_price.toLocaleString()}
                </Text>

                <Text style={styles.footer}>
                    Creado: {new Date(sale.createdAt).toLocaleString()} |
                    Actualizado: {new Date(sale.updatedAt).toLocaleString()}
                </Text>
            </Page>
        </Document>
    );
}

export default DocumentPdf;
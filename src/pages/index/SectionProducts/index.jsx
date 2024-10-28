import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ShoppingCart, Heart } from "lucide-react";
import { useState, useEffect } from 'react';
import axios from 'axios';

const SectionProducts = () => {
    const url = 'http://localhost:1056/api/products';
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        const response = await axios.get(url);
        setProducts(response.data);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 bg-gray-50">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                breakpoints={{
                    640: { slidesPerView: 1, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 30 },
                    1024: { slidesPerView: 3, spaceBetween: 40 },
                }}
                className="py-8"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id}>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 w-[300px] h-[300px]">
                            <div className="relative h-40">
                                <img
                                    src={product.Image}
                                    alt={product.Product_Name}
                                    className="w-full h-40 object-cover object-center"
                                />
                                <span className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {product.Category_Id}
                                </span>
                                <button className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                                    <Heart className="w-5 h-5 text-red-500" />
                                </button>
                            </div>

                            <div className="p-4">
                                <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-1">
                                    {product.Product_Name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-blue-600">
                                        ${product.Price}
                                    </span>
                                    <button className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                                        <ShoppingCart className="w-4 h-4" />
                                        <span className="text-sm font-medium">Añadir</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default SectionProducts;
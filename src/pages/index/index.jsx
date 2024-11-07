import React, { useRef } from 'react';
import Header from './Header';
import ServicesSection from './SectionServices';
import ProductSection from './SectionProducts';
import SectionFooter from './SectionFooter';
import Button from '@mui/material/Button';


const Index = () => {
    const servicesRef = useRef(null);

    const scrollToServices = () => {
        if (servicesRef.current) {
            servicesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Header scrollToServices={scrollToServices} />
            <section className="zona1">
                <div className="hero-content">
                    <h1>
                        Sólo los mejores barberos
                    </h1>
                    <p>
                        La barbería es el lugar donde puedes conseguir un corte de pelo de alta calidad de barberos certificados, que no sólo son profesionales, sino también maestros con talento.
                    </p>
                    <Button
                        variant="outlined"
                        className="read-more-btn"
                    >
                        VER MAS
                    </Button>
                </div>
            </section>

            <section ref={servicesRef}> 
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 className='tittle-landingPage'>Nuestros servicios</h2>
                </div>
                <p className='description-landingPage'>En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.</p>
                <div className='w-100 section-services'>
                    <ServicesSection />
                </div>
            </section>

            <section className='section-products'>
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 className='tittle-landingPage'>Nuestros Mejores Productos</h2>
                </div>
                <p className='description-landingPage White'>En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.</p>
                <div className='w-100'>
                    <ProductSection />
                </div>
            </section>
            <SectionFooter />
        </>
    );
};

export default Index;
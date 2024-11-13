import { FaWhatsapp } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { PiPhoneIncoming } from "react-icons/pi";
import { IoTimeOutline } from "react-icons/io5";
import { FaFacebook } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

const SectionFooter = () => {
    return (
        <>
            <div className="w-100 content-footer">
                <div className="row w-100">
                    <div className="col-sm-4 p-5 text-center columna-footer">
                        <h4 className="title-footer">Contáctenos</h4>
                        <div>
                            <span><FaWhatsapp /> Whatsapp:3143161922</span>
                        </div>
                    </div>
                    <div className="col-sm-4 p-5 text-center columna-footer">
                        <h4 className="title-footer">Visítanos</h4>
                        <div>
                            <span><LuMapPin /> Calle 80 #80-45</span>
                        </div>
                        <div>
                            <span>Medellín, Antioquia</span>
                        </div>
                    </div>
                    <div className="col-sm-4 p-5 text-center columna-footer">
                        <h4 className="title-footer">Horas</h4>
                        <div>
                            <span><IoTimeOutline />Lunes a Domingo: 7am - 9:15pm</span>
                        </div>
                        <div>
                            <span>Lunes: Cerrado</span>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-center redes-footer">
                    <div>
                        <span><FaFacebook /></span>
                        <span><FaInstagramSquare /></span>
                        <span><SiGmail /></span>
                        <span>barberiaOrion2@gmail.com</span>
                    </div>
                </div>
            </div>
          
        </>
    )
}

export default SectionFooter;
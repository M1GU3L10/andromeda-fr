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
            <div className="contact-form-container">
                <div className="form-footer">
                    <h4 className="text-center description-footer">
                        Nos encantaría saber acerca de su experiencia. Por favor, siéntase libre de contactar a los administradores con cualquier pregunta o solicitud.
                    </h4>
                </div>
                <form className="contact-form">
                    <div className="row w-100">
                        <div className="col-sm-6">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input type="email" id="email" name="email" placeholder="Tu correo electrónico" required />
                        </div>
                        <div className="col-sm-6">
                            <label htmlFor="subject">Asunto</label>
                            <input type="text" id="subject" name="subject" placeholder="Asunto de tu mensaje" required />
                        </div>
                    </div>
                    <label htmlFor="message">Mensaje</label>
                    <textarea id="message" name="message" rows="4" placeholder="Escribe tu mensaje aquí..." required></textarea>

                    <button type="submit" className="submit-button">Enviar Mensaje</button>
                </form>
            </div>
        </>
    )
}

export default SectionFooter;
import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GiHairStrands } from "react-icons/gi";
import { RxScissors } from "react-icons/rx";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import SearchBox from '../../components/SearchBox';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

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
})


const Services = () => {
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };
    return (
        <>
            <div className="right-content w-100">
                <div class="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Servicios</span>
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
                                        label="Servicios"
                                        icon={<GiHairStrands fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-4 d-flex align-items-center'>
                                <Button className='btn-register' variant="contained"><BsPlusSquareFill />Registrar</Button>
                            </div>
                            <div className='col-sm-4 d-flex align-items-center cardFilters'>
                                <FormControl sx={{ m: 0, minWidth: 120 }} size="small">
                                    <InputLabel id="demo-select-small-label">Columnas</InputLabel>
                                    <Select
                                        labelId="demo-select-small-label"
                                        id="demo-select-small"
                                        value={age}
                                        label="Columnas"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="">
                                            <em>12</em>
                                        </MenuItem>
                                        <MenuItem value={10}>24</MenuItem>
                                        <MenuItem value={20}>36</MenuItem>
                                        <MenuItem value={30}>48</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='col-sm-4 d-flex align-items-center justify-content-end'>
                                <SearchBox />
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            <table className='table table-bordered table-hover v-align'>
                                <thead className='table-primary'>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Precio</th>
                                        <th>Descripción</th>
                                        <th>Tiempo</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Corte de cabello</td>
                                        <td>20000</td>
                                        <td>El corte que el cliente desee</td>
                                        <td>60 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color="secondary" className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Corte de barba</td>
                                        <td>7000</td>
                                        <td>Marcar barba</td>
                                        <td>30 Minutos</td>
                                        <td>Activo</td>
                                        <td>
                                            <div className='actions d-flex align-items-center'>
                                                <Button color='primary' className='primary'><FaEye /></Button>
                                                <Button color='secondary' className='secondary'><FaPencilAlt /></Button>
                                                <Button color='error' className='delete'><IoTrashSharp /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="d-flex table-footer">
                                <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Services;
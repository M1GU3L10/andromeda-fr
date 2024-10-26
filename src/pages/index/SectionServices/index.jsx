import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fade from '@mui/material/Fade';
import { useState, useEffect } from 'react';
import axios from 'axios';

const SectionServices = () => {
    const [expanded, setExpanded] = React.useState(false);
    const url = 'http://localhost:1056/api/services';
    const [services, setServices] = useState([]);

    useEffect(() => {
        getServices();
    }, []);

    const getServices = async () => {
        const response = await axios.get(url);
        setServices(response.data);
    };

    const handleExpansion = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div>
            {services.map((service) => (
                <Accordion
                    key={service.id}
                    expanded={expanded === service.id}
                    onChange={handleExpansion(service.id)}
                    slots={{ transition: Fade }}
                    slotProps={{ transition: { timeout: 400 } }}
                    sx={{
                        '& .MuiAccordionDetails-root': {
                            display: 'block',
                        },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel-${service.id}-content`}
                        id={`panel-${service.id}-header`}
                    >
                        <Typography>{service.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>{service.description}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default SectionServices;

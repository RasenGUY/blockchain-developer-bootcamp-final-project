import React from 'react'; 
import { Container } from 'react-bootstrap';
import Hero from '../../components/home/Hero';
import Helmet from 'react-helmet';

export default function Home() {
    return (

        <Container id="home" fluid>
            <Helmet>
                <title>IkonDao</title>
            </Helmet>

            
            <Hero />
        </Container>
    )
}

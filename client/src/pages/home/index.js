import React from 'react'; 
import { Container } from 'react-bootstrap';
import Hero from '../../components/home/Hero';
// import Hero from './components//home/Register.js';

export default function Home() {

    return (
        <Container id="home" fluid>
            <Hero />
        </Container>
    )
}

import React from 'react';
import { Link } from 'react-router-dom'; 
import { Container, Navbar, Nav, Button} from 'react-bootstrap';
import logo from '../../public/static/logos/logo-1.png';

export default function Header() {
    return (
        <Navbar expand='lg' fixed="top" bg="teal" variant="light">
            <Container id="ikondaoNav">
                <Navbar.Brand style={{fontSize: "2.5rem"}}>
                    <img 
                    style={{verticalAlign: 'bottom'}}
                    src={logo}
                    width={'60rem'}
                    />{" "}
                    <Link to="/">IkonDAO</Link>
                </Navbar.Brand>
                <Navbar.Toggle style={{width: "5rem", height: "3.5rem"}} aria-controls="ikondao-responsive-nabar" />
                <Navbar.Collapse  id="ikondao-responsive-nabar" className="justify-content-end">
                    <Nav as="ul">
                        <Nav.Link as="li">
                            <Link  to="/proposals">Proposals</Link>
                        </Nav.Link>
                        <Nav.Link as="li">
                            <Link to="/nfts">Nfts</Link>
                        </Nav.Link>
                        <Nav.Link as="li">
                            <Link to="/vectors">Vectors</Link>
                        </Nav.Link>
                        <Button size="lg" className="callout-button">connect</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>        
        </Navbar>
    )
}

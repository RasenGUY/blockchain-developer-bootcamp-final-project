import React from 'react';
import { Container, Navbar, Nav, Button} from 'react-bootstrap';
import logo from '../../public/static/logos/logo-1.png';

export default function Header() {
    return (
        <Navbar expand='lg' fixed="top" bg="teal" variant="light">
            <Container>
                <Navbar.Brand style={{fontSize: "2.5rem"}} href="/">
                    <img 
                    style={{verticalAlign: 'bottom'}}
                    src={logo}
                    width={'60rem'}
                    />{" "}
                    IkonDAO
                </Navbar.Brand>
                <Navbar.Toggle style={{width: "5rem", height: "3.5rem"}} aria-controls="ikondao-responsive-nabar" />
                <Navbar.Collapse  id="ikondao-responsive-nabar" className="justify-content-end">
                    <Nav>
                        <Nav.Link href="/proposals">Proposals</Nav.Link>
                        <Nav.Link  href="/nfts">NFTs</Nav.Link>
                        <Nav.Link href="/vectors">Vectors</Nav.Link>
                        <Button size="lg" className="connect-button">connect</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>        
        </Navbar>
    )
}

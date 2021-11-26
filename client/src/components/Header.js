import React, {useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import { Container, Navbar, Nav, Button} from 'react-bootstrap';
import logo from '../../public/static/logos/logo-1.png';

// for wallet connect workflow
import { useWallet } from '@gimmixorg/use-wallet';
import { settings } from '../providers'; 
import { Web3Provider, WebSocketProvider} from '@ethersproject/providers';
const Web3 = require('web3');


// appContext 
import { useAppContext } from '../AppContext';

export default function Header() {
    const { account, connect, disconnect, provider } = useWallet();
    const { memberAddress, setMemberAddress, setInjectedProvider, injectedProvider } = useAppContext();
    const [connected, setConnected] = useState();
    
    const login = ()=> {
        connect(settings).catch(e => console.log(e));
        setConnected(true);
    } 

    const logout = ()=>{
        disconnect();
        setConnected(false);
        setInjectedProvider(undefined);
    }
    
    useEffect(()=>{
        setMemberAddress(account);
        if(!connected){
            setInjectedProvider(undefined);
        }
        if (provider){
            // setInjectedProvider(new Web3Provider(provider, "rinkeby"));
            setInjectedProvider(new Web3(`https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_ID}`));
        }
    }, [account, connected])


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
                        <Nav.Link as="li">
                            {
                            !connected 
                            ? <Button onClick={login}size="lg" className="callout-button">connect</Button> 
                            : <Button onClick={logout}size="lg" className="callout-button">Disconnect</Button>
                            }
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>        
        </Navbar>
    )
}

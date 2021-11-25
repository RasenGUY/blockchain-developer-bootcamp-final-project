import React, {useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import { Container, Navbar, Nav, Button} from 'react-bootstrap';
import logo from '../../public/static/logos/logo-1.png';

// for wallet connect workflow
import Web3Modal from "web3modal";
import { settings } from '../providers'; 
const ethers = require('ethers');
const web3Modal = new Web3Modal(settings); // instantiaties web3modal 

// conext 
import { useAppContext } from '../AppContext';


export default function Header() {
    
    const setAddress = useAppContext().setMemberAddress;

    const [connected, setConnected] = useState(false);
    const [ injectedProvider, setInjectedProvider ] = useState();
    
    // logs out of web3Modal 
    const logoutOfWeb3Modal = async () => {
    
        await web3Modal.clearCachedProvider();

        if (injectedProvider && typeof injectedProvider.disconnect == "function") {
            await injectedProvider.disconnect();
        }
        if (injectedProvider && typeof injectedProvider.close == 'function'){
            await injectedProvider.close();
        } 
        
        setConnected(false);

        setTimeout(() => {
            window.location.reload();
        }, 1);
    }
    

    // helps to connect to wallt
    const loginToWeb3Modal = useCallback(async () => {
        
        var provider; 
        try {
            provider = await web3Modal.connect(); // connects to web3 rpc via modal
            setConnected(true); // displays connect button
            setAddress(provider.selectedAddress); // set the member address
            
        } catch (e){
            // console.log("User denied connection request");
            console.log(e); 
        }

        if (provider){
            provider.on("chainChanged", chainId => {
                console.log(`chain changed to ${chainId}! updating providers`);
                setInjectedProvider(new ethers.providers.Web3Provider(provider));
            });
            provider.on("accountsChanged", () => {
                console.log(`account changed!`);
                setInjectedProvider(new ethers.providers.Web3Provider(provider));
            });
            provider.on("disconnect", (code, reason) => {
                logoutOfWeb3Modal();
                setConnected(true);
            });
        }

        
    }, [setInjectedProvider]);

    useEffect(() => { // loads web3modal if it is already provided
        if (web3Modal.cachedProvider) {
          loginToWeb3Modal();
        }
    }, [loginToWeb3Modal]);



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
                            ? <Button onClick={loginToWeb3Modal}size="lg" className="callout-button">connect</Button> 
                            : <Button onClick={logoutOfWeb3Modal}size="lg" className="callout-button">Disconnect</Button>
                            }
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>        
        </Navbar>
    )
}

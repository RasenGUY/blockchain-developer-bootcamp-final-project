import React, {useState, useEffect} from 'react';
import { NavLink } from 'react-router-dom'; 
import { Card, Button } from 'react-bootstrap';

// for making calls to proxy 
import { useContract } from '../../hooks/useContract';
import daoContract from '../../contracts/IkonDAO.json';
// import { useAppContext } from '../../AppContext'; 
import {callContract} from '../../helpers/transactor';

// for finding out whether is member
import { MEMBER_ROLE } from '../../contstants';


export default function Register() {
    
    const cardStyle = { width: "75%" };
    const [isMember, setIsMember] = useState();
    const cInst = useContract(process.env.PROXY_CONTRACT, daoContract.abi);
    
    useEffect(()=>{ 
        if(window.ethereum.selectedAddress){
            cInst.methods.hasRole(MEMBER_ROLE, window.ethereum.selectedAddress).call().then(res => setIsMember(res));   
            window.ethereum.on("accountsChanged", ()=> {
                cInst.methods.hasRole(MEMBER_ROLE, window.ethereum.selectedAddress).call().then(res => setIsMember(res));   
            })
        }
    }, []);

    
    
    const register = () => {
        // register user
        // user can be notified here on complettion
        const data = cInst.methods.createMember().encodeABI(); 
        callContract(process.env.PROXY_CONTRACT, data)
        .then(receipt => {
            console.log(receipt);
            // set account is member after transaction receipt
            cInst.methods.hasRole(MEMBER_ROLE, window.ethereum.selectedAddress).call().then(res => setIsMember(res)); 
        }).catch(e => console.log(e));
    }


    return (
        <Card className="create text-center" style={cardStyle} >
            <Card.Header style={{padding: "2rem"}}>
                <h1>
                    Welcome to the Ikon DAO 
                </h1>
            </Card.Header>
            <Card.Body style={{padding: "2.5rem 5rem"}}>
                <Card.Title style={{padding: "2rem"}}>
                    <h2>
                        an open nft platform for Graphic artists
                    </h2>
                </Card.Title>
                <Card.Text style={{padding: "2rem", fontSize: "1.125rem"}}>
                    Our platform is based on openness and working towards the welbeing and of our members. It's not about self-interest but about social-interest. 
                </Card.Text>
                {
                    !isMember 
                    ? <Button style={{padding: "0.5rem"}} size="lg" className="callout-button" onClick={register}>Become A Member</Button>
                    : <NavLink to={`/proposals`} className="btn callout-button">Proposals</NavLink>
                }
            </Card.Body>
        </Card>
    )
}

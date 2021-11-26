import React, {useState, useEffect} from 'react'; 
import { Card, Button } from 'react-bootstrap';

// for making calls to proxy 
import { useContract } from '../../hooks/useContract';
import daoContract from '../../contracts/abis/IkonDAO.json';
import { useAppContext } from '../../AppContext'; 

// for finding out wheter is member
import { MEMBER_ROLE } from '../../contstants';


export default function Register() {
    
    const cardStyle = { width: "75%" };
    const {injectedProvider, memberAddress} = useAppContext();
    // const [isMember, setIsMember] = useState();
    if (memberAddress){
        // const contractInst = useContract(process.env.PROXY_CONTRACT, JSON.parse(JSON.stringify(daoContract.abi)));
        // const abi = JSON.stringify(daoContract.abi)
        const prov = injectedProvider;
        const cInst = new prov.eth.Contract(daoContract.abi, process.env.PROXY_CONTRACT);
        
        (async() => {
            
            console.log(await cInst.methods.hasRole(MEMBER_ROLE, memberAddress).call());
        })()
        // // console.log(contractInst);
        // console.log(contractInst.provider);
        // console.log(MEMBER_ROLE)
        // contractInst.functions.hasRole(String(MEMBER_ROLE), String(memberAddress)).then(result => console.log(result));
        // console.log(memberAddress)
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
                 {/* button should display if user is not member */}
                <Button style={{padding: "0.5rem"}} size="lg" className="callout-button">Become A Member</Button>
            </Card.Body>
        </Card>
    )
}

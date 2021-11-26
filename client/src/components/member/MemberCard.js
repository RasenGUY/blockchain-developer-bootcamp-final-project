import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { Card, ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { shortenAddress } from '../../utils/shortenAddress';
// import {}

// context
import {useAppContext} from '../../AppContext';

export default function MemberCard() {
    const memberAddress = useAppContext().memberAddress;
    // const [memberVotes, setMemberVotes] = useState(); 

    
    return (
        <Card className="align-items-center" style={{position: 'fixed', top: '12rem', padding: "2rem 1rem"}}>
            <div style={{borderRadius: "100%", height: "7.5rem", width: "7.5rem", backgroundImage: `url(https://via.placeholder.com/150)`}}>
            </div>
            <Card.Body style={{padding: "1rem, 0rem"}}>
                <Card.Title>{shortenAddress(memberAddress)}</Card.Title>
            </Card.Body>
            <ListGroup className="list-group-flush">
                <ListGroupItem style={{padding: "1rem, 0rem"}}>member votes goes here</ListGroupItem>
                <ListGroupItem style={{padding: "1rem, 0rem"}}>member tokens goes here</ListGroupItem>
            </ListGroup>
            <NavLink className="btn callout-button" to={"/proposals/create"}>Create a proposal</NavLink>
        </Card>
    )
}

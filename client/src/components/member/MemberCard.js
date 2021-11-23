import React from 'react'
import { Card, ListGroup, ListGroupItem, Button, Col} from 'react-bootstrap';

export default function MemberCard() {
    return (
        <Card className="align-items-center" style={{position: 'fixed', top: '12rem', padding: "2rem 1rem"}}>
            <div style={{borderRadius: "100%", height: "7.5rem", width: "7.5rem", backgroundImage: `url(https://via.placeholder.com/150)`}}>
            </div>
            <Card.Body style={{padding: "1rem, 0rem"}}>
                <Card.Title>Member address</Card.Title>
            </Card.Body>
            <ListGroup className="list-group-flush">
                <ListGroupItem style={{padding: "1rem, 0rem"}} >member votes goes here</ListGroupItem>
                <ListGroupItem style={{padding: "1rem, 0rem"}}>member tokens goes here</ListGroupItem>
            </ListGroup>
            <Button className="callout-button">Create a proposal</Button>
        </Card>
    )
}

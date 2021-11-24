import React from 'react';
import { Col, Card, ListGroup, ListGroupItem } from 'react-bootstrap';

export default function VectorCard({hash, name, description, externalLink, category, handle, type}) {
    return (
        <Col lg="4" style={{padding: '2rem'}}>
            <Card >
                {/* image hash get storage link from web3.storage */}
                <Card.Img variant="top" src="https://via.placeholder.com/25"/>
                <Card.Body>
                    <Card.Title>{name}</Card.Title>
                    <Card.Text>
                        {description}
                    </Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>Category: {category}</ListGroupItem>
                    {/* image hash get storage link from web3.storage */}
                    <ListGroupItem>Handle: {handle}</ListGroupItem>
                    <ListGroupItem>Type: {type}</ListGroupItem>
                </ListGroup>
                <Card.Body>
                    <Card.Link className="btn btn-primary" href="#">download</Card.Link>
                </Card.Body>
            </Card>
        </Col>
    )
}

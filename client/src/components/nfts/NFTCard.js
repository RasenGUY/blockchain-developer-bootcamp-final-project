import React from 'react';
import { Col, Card, ListGroup, ListGroupItem } from 'react-bootstrap';

export default function NFTCard({hash, name, description, externalLink, category, handle, tokenId, type}) {
    // hash is used to create web3.storage link
    return (
            <Col lg="4" style={{padding: '2rem'}}>
                <Card >
                    {/* image hash get storage link from web3.storage */}
                    <Card.Img variant="top" src="https://via.placeholder.com/25" />
                    <Card.Header>token-id: {tokenId}</Card.Header>
                    <Card.Body>
                        <Card.Title>{name}</Card.Title>
                        <Card.Text>
                            {description}
                        </Card.Text>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroupItem>Category: {category}</ListGroupItem>
                        {/* image hash get storage link from web3.storage */}
                        <ListGroupItem>ExternalLink: {externalLink}</ListGroupItem>
                        <ListGroupItem>Handle: {handle}</ListGroupItem>
                        <ListGroupItem>Type: {type}</ListGroupItem>
                    </ListGroup>
                    <Card.Body>
                        <Card.Link href="#">Buy</Card.Link>
                    </Card.Body>
                </Card>
            </Col>

    )
}

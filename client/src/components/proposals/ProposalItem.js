import React from 'react'
import { Card, Button, Badge, Container  } from 'react-bootstrap';

export default function ProposalItem({id}) {
    // id will be used to fetch proposal info from app Context
    return (
        <Container className="proposalItem" style={{padding: "2rem 0rem"}}  as="div" fluid>
            <Card >
                <Card.Header as='div'>
                    <Badge>Status</Badge>
                    <Badge>Type</Badge>
                </Card.Header>
                <Card.Body>
                    <Card.Title>proposal type and {id} goes here</Card.Title>
                    <Card.Text>
                        proposal description goes here
                    </Card.Text>
                    <Button className="callout-button">Cast a vote</Button>
                </Card.Body>
            </Card>
        </Container>
    )
}

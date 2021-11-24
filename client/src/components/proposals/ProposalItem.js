import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { Card, Badge, Container  } from 'react-bootstrap';

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
                    <NavLink to={`/proposals/${id}`}>Cast a Vote</NavLink>
                </Card.Body>
            </Card>
        </Container>
    )
}

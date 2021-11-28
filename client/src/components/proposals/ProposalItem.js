import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { Card, Badge, Container  } from 'react-bootstrap';
import { shortenAddress } from '../../utils/shortenAddress'; 
import { useProposalState } from '../../hooks/useProposalStatus';

export default function ProposalItem({id, type, title, description, value, proposor }) {
    
    const proposalStatus = {
        0: {text: 'Pending', color: 'secondary'},
        1: {text: 'Active', color: 'info'}, 
        2: {text: 'Canceled', color: 'dark'},
        3: {text: 'Defeated!', color: 'danger'},
        4: {text: 'Succeeded', color: 'success'},
        5: {text: 'Queued', color: 'primary'},
        6: {text: 'Expired', color: 'warning'},
        7: {text: 'Failed', color: 'danger'}
    }

    const state = useProposalState(id);
    
    return (
        <Container className="proposalItem" style={{padding: "2rem 0rem"}}  as="div" fluid>
            <Card >
                <Card.Header as='div'  className="d-flex flex-column justify-content-start">
                        <Badge className="mt-2" bg={state ? proposalStatus[state].color : null} style={{width: "15%"}} >{state ? proposalStatus[state].text : null}</Badge>
                        <Badge className="mt-2" style={{width: "15%"}}>{type}</Badge>
                        <Badge className="mt-2" style={{width: "9.2%"}}>{shortenAddress(id)}</Badge>
                        <Badge className="mt-2" style={{width: "32.5%"}}>{proposor}</Badge>
                </Card.Header>
                <Card.Body className="mt-2">
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        { description }
                        <br/>
                        {`Proposed change: ${value}`}
                    </Card.Text>

                    <NavLink to={`/proposals/${id}`}>Cast a Vote</NavLink>
                </Card.Body>
            </Card>
        </Container>
    )
}

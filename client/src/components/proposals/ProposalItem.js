import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { Card, Badge, Container  } from 'react-bootstrap';
import { shortenAddress } from '../../utils/shortenAddress'; 
import { useProposalState } from '../../hooks/useProposalState';
import { proposalStates } from '../../helpers/proposalStates';

export default function ProposalItem({id, type, title, description, value, proposor }) {
    const states = proposalStates;
    const state = useProposalState(id);
    
    return (
        <Container className="proposalItem" style={{padding: "2rem 0rem"}}  as="div" fluid>
            <Card >
                <Card.Header as='div'  className="d-flex flex-column justify-content-start">
                        <Badge className="mt-2" bg={state ? states[state].color : null} style={{width: "15%"}} >{state ? states[state].text : "..loading"}</Badge>
                        <Badge className="mt-2" style={{width: "15%"}}>{type}</Badge>
                        <Badge className="mt-2" style={{width: "9.2%"}}>{shortenAddress(id)}</Badge>
                        <Badge className="mt-2" style={{width: "32.5%"}}>{proposor}</Badge>
                </Card.Header>
                <Card.Body className="mt-2">
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        { description }
                </Card.Text>
                <div>
                <h6>Proposed: </h6>
                {
                    value.map((v, i) => (
                        <span style={{display: "block", fontSize: '0.8rem'}} key={i}>
                            <b>{v[0]}:</b> {v[1]}
                        </span>
                    ))
                }
                </div>

                    <NavLink to={`/proposals/${id}`}>Cast a Vote</NavLink>
                </Card.Body>
            </Card>
        </Container>
    )
}

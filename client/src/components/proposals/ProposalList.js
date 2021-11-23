import React from 'react';
import { Container } from 'react-bootstrap';
import MemberCard from '../member/MemberCard'; 
import ProposalItem from './ProposalItem';
import { Col } from 'react-bootstrap';

export default function ProposalList() {
    const ids = Array(10).fill('').map(item => 1 + Math.floor(Math.random() * 10 + 1)); // fake ids

    const fakeProposals = (ids.map(id => <ProposalItem key={Math.random()} 
    id={id} />))

    return (
        <>
            <Container className="d-flex flex-row" style={{marginTop: "10rem"}}>
                <Col lg="3">
                    <Container as="div" fluid>
                        <MemberCard />
                    </Container>
                </Col>
                <Col lg="9">
                    <Container as="div" fluid>
                        {fakeProposals}
                    </Container>
                </Col>
            </Container>
        </>
    )
}

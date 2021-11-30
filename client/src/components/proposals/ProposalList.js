import React, {useEffect, useState} from 'react';
import MemberCard from '../member/MemberCard'; 
import ProposalItem from './ProposalItem';
import { Col, Container } from 'react-bootstrap';

// for loading the proposal intially
import { useProposals } from '../../hooks/useProposals';

export default function ProposalList() {
    const [loaded, setLoaded] = useState(); 
    const proposals = useProposals(setLoaded);

    return (
        <Container className="d-flex flex-row" style={{marginTop: "10rem"}}>
            <Col lg="3">
                <Container as="div" fluid>
                    <MemberCard />
                </Container>
            </Col>
            <Col lg="9">
                <Container as="div" fluid>
                    {
                        proposals && loaded
                        ? [...proposals.entries()].map(kvp => (
                            <ProposalItem 
                            key={kvp[0]} 
                            id={kvp[0]} 
                            type={kvp[1].type} 
                            title={kvp[1].title} 
                            description={kvp[1].description}
                            value={kvp[1].value}
                            proposor={kvp[1].proposor}
                        />))
                        : <h1>...Loading</h1> 
                    }
                </Container>
            </Col>
        </Container>
    )
}

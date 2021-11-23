import React from 'react'; 
import { Container } from 'react-bootstrap';
import ProposalList from '../../components/proposals/ProposalList';


export default function ProposalsIndex() {
    return (
        <Container id="proposals" fluid>
            <ProposalList />
        </Container>
    )
}

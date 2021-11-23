import React from 'react'; 
import { Container } from 'react-bootstrap';
import ProposalList from '../../components/proposals/ProposalList';
import Helmet from 'react-helmet';

export default function ProposalsIndex() {
    return (
        <Container id="proposals" fluid>
            <Helmet>
                <title>Proposals</title>
            </Helmet>

            <ProposalList />
        </Container>
    )
}

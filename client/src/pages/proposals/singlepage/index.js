import React from 'react'
import Helmet from 'react-helmet';
import ProposalSingle from '../../../components/proposals/ProposalSingle';
import { Container } from 'react-bootstrap';

export default function ProposalSingleIndex() {
    return (
        <Container id="proposals-single" fluid>
            <Helmet>
                <title>Proposal</title>
            </Helmet>
            <ProposalSingle />
            <Outlet />

        </Container>
    )
}

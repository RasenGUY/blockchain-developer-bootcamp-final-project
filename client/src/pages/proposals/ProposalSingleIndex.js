import React from 'react'
import ProposalSingle from '../../components/proposals/ProposalSingle';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';


export default function ProposalSingleIndex() {
    return (
        <>
            <Helmet>
                <title>Proposal</title>
            </Helmet>
            <Container fluid>
                <ProposalSingle />
            </Container>
        </>

    )
}

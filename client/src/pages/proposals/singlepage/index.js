import React from 'react'
import Helmet from 'react-helmet';
import ProposalSingle from '../../../components/proposals/ProposalSingle';

export default function ProposalSingleIndex() {
    return (
        <Container id="proposals-single" fluid>
            <Helmet>
                <title>Proposal</title>
            </Helmet>

            <ProposalSingle />
        </Container>
    )
}

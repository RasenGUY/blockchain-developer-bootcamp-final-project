import React from 'react'
import Helmet from 'react-helmet';
import { Container, Col , Row} from 'react-bootstrap';
import ProposalInfo from './ProposalInfo';
import VoteInfoCard from './VoteInfoCard';
import CastVote from './CastVote';

export default function ProposalSingle({id}) {
    // fetch more state with the given id
    return (
        <>
            <Helmet>
                    <title>Proposal</title>
            </Helmet>
            <Container fluid>
                <Container  style={{marginTop: "10rem"}}>
                    <Row className="d-flex flex-row">
                        <Col lg="9">
                            <Container as="div" fluid>
                                <ProposalInfo />
                            </Container>
                            <Container className="text-center" as="div" fluid>
                                <CastVote />
                            </Container>
                        </Col>
                        <Col lg="3">
                            <VoteInfoCard />
                        </Col>
                    </Row>
                </Container>
            </Container>
        </>
    )
}

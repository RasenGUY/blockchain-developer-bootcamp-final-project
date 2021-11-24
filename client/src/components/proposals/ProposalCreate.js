import React, {useState} from 'react';
import AccountabilityProposalForm from './AccountabilityProposalForm'; 
import NftProposalForm from './NftProposalForm'; 
import SystemProposalForm from './SystemProposalForm'; 
import { Col, Row, Container, Card, ListGroup } from 'react-bootstrap';


export default function ProposalCreate() {
    const [option, setOption] = useState('nft');
    return (
        <Container style={{marginTop: "10rem"}}>
            <Row className="d-flex flex-row">
                <Col lg="9">
                    {option === 'nft' &&  <NftProposalForm />}
                    {option === 'accountability' &&  <AccountabilityProposalForm />}
                    {option === 'system' &&  <SystemProposalForm />}
                </Col>
                <Col lg="3">
                    <Card style={{ width: '18rem' }}>
                        <ListGroup variant="flush">
                            <ListGroup.Item 
                                onClick={e => setOption(String(e.target.textContent).toLowerCase())}
                            >Nft
                            </ListGroup.Item>
                            <ListGroup.Item 
                                onClick={e => setOption(String(e.target.textContent).toLowerCase())}
                            >Accountability
                            </ListGroup.Item>
                            <ListGroup.Item 
                                onClick={e => setOption(String(e.target.textContent).toLowerCase())}
                            >System
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>        
    )
}

import React, {useEffect, useState} from 'react';
import MemberCard from '../member/MemberCard'; 
import ProposalItem from './ProposalItem';
import { Col, Container } from 'react-bootstrap';

// for loading the proposal intially
import { useProposals } from '../../hooks/useProposals';

export default function ProposalList() {
    const [loaded, setLoaded] = useState(); 
    const proposals = useProposals(setLoaded);
    const [renderItems, setRenderItems ] = useState();

    useEffect(()=>{
        if (proposals){
            let list = [];
            proposals.forEach((proposal, id) => {
                list.push(
                    <ProposalItem 
                    key={id} 
                    id={id} 
                    type={proposal.type}
                    title={proposal.title} 
                    description={proposal.description}
                    value={proposal.value}
                    proposor={proposal.proposor}
                />)
            })
            setRenderItems(list);
        }
    }, [loaded])

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
                        loaded && renderItems
                        ? renderItems
                        : <h1>...Loading</h1> 
                    }
                </Container>
            </Col>
        </Container>
    )
}

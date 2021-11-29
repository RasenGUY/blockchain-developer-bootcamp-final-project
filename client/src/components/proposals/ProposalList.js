import React, {useEffect, useState} from 'react';
import MemberCard from '../member/MemberCard'; 
import ProposalItem from './ProposalItem';
import { Col, Container } from 'react-bootstrap';

// for loading the proposal intially
import { useAppContext } from '../../AppContext';
import { getIpfsData } from '../../web3-storage/ipfsStorage';

export default function ProposalList() {
    const { updateProposals, proposals: contextProposals } = useAppContext();
    const [loaded, setLoaded] = useState();
    const [proposals, setProposals] = useState();

    useEffect(()=> {
        if(contextProposals){ // if the context contains data then use that
            setProposals(contextProposals);
            setLoaded(true);
        } else { // if the context does not contain data then fetch
            getIpfsData('proposals').then(data => {
                setProposals(data);
                setLoaded(true);
            })
        }
    }, [])

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
                        loaded 
                        ? proposals.map((proposal, i) => 
                            <ProposalItem 
                                key={i} 
                                id={proposal.id} 
                                type={proposal.type}
                                title={proposal.title} 
                                description={proposal.description}
                                value={proposal.value}
                                proposor={proposal.proposor}
                            />
                        ) 
                        : <h1>...Loading</h1> 
                    }
                </Container>
            </Col>
        </Container>
    )
}

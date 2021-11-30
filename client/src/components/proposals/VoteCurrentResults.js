import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'react-bootstrap';

// for retrieving proposal information
import { useProposalInformation } from '../../hooks/useProposalInformation';
// for retrieinv total voting power of network
import { useTotalVotes } from '../../hooks/useTotalVotes';

export default function VoteCurrentResults() {
    const { proposalId }= useParams();
    const { votes } = useProposalInformation(proposalId);
    const totalVotes = useTotalVotes(); 
     

    return (
        <Card className="text-center" style={{padding: '2rem 0rem', marginTop: "2rem"}}>
            <Card.Title>Results so far</Card.Title>
            <Card.Body style={{textAlign: 'left'}}>
                <Card.Text>
                    <b>For: </b>{
                    votes && totalVotes 
                    ? String((votes['forVotes'] / 100) * totalVotes)+'%' 
                    : '...loading'}
                </Card.Text>
                <Card.Text>
                    <b>Against: </b>
                    {votes && totalVotes 
                    ? String((votes['againstVotes'] / 100) * totalVotes)+'%' 
                    : '...loading'}
                    </Card.Text>
                <Card.Text><b>Abstain: </b>
                {votes && totalVotes 
                    ? String((votes['abstainVotes'] / 100) * totalVotes)+'%' 
                    : '...loading'}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

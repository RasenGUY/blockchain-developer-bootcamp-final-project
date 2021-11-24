import React from 'react';
import { Card } from 'react-bootstrap';

export default function VoteCurrentResults() {
    return (
        <Card className="text-center" style={{padding: '2rem 0rem', marginTop: "2rem"}}>
            <Card.Title>Results so far</Card.Title>
            <Card.Body style={{textAlign: 'left'}}>
                <Card.Text><b>For: </b>total for</Card.Text>
                <Card.Text><b>Against: </b>total against</Card.Text>
                <Card.Text><b>Abstain: </b>total Abstain</Card.Text>
            </Card.Body>
        </Card>
    )
}

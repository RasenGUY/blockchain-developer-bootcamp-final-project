import React from 'react';
import { Card } from 'react-bootstrap';

export default function VoteInfoCard() {
    const address = `address of proposer`;
    return (
        <Card className="text-center" style={{padding: '2rem 0rem'}}>
            <Card.Title>Information</Card.Title>
            <Card.Body style={{textAlign: 'left'}}>
                <Card.Text><b>proposer: </b>{address}</Card.Text>
                <Card.Text><b>start: </b>start-date-goes-here</Card.Text>
                <Card.Text><b>end: </b>end date goes here</Card.Text>
                <Card.Text><b>end: </b>end date goes here</Card.Text>
            </Card.Body>
        </Card>
    )
}

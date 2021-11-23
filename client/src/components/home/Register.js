import React from 'react'; 
import { Card, Button } from 'react-bootstrap';

export default function Register() {
    const cardStyle={width: "75%"}
    return (
        <Card className="create text-center" style={cardStyle} >
            <Card.Header style={{padding: "2rem"}}>
                <h1>
                    Welcome to the Ikon DAO 
                </h1>
            </Card.Header>
            <Card.Body style={{padding: "2.5rem 5rem"}}>
                <Card.Title style={{padding: "2rem"}}>
                    <h2>
                        an open nft platform for Graphic artists
                    </h2>
                </Card.Title>
                <Card.Text style={{padding: "2rem", fontSize: "1.125rem"}}>
                    Our platform is based on openness and working towards the welbeing and of our members. It's not about self-interest but about social-interest. 
                </Card.Text>
                <Button style={{padding: "0.5rem"}} size="lg" className="callout-button">Become A Member</Button>
            </Card.Body>
        </Card>
    )
}

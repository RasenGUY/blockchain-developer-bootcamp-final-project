import React from 'react';
import { Badge } from 'react-bootstrap';

export default function ProposalInfo() {
    return (
        <article className="proposal-info text-center">
            <header>
                <div clasName="banner">
                    <Badge>Status</Badge>
                </div>
                <h1>proposal description id goes here</h1>
                <h3>Description of proposal goes here</h3>
            </header>
            <div className="images">uploaded images go here</div> 
        </article>
    )
}

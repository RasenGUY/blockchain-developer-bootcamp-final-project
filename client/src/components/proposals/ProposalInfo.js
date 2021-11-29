import React from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

// for retrieving proposal information
import { useAppContext } from '../../AppContext';
import { useProposalState } from '../../hooks/useProposalState';

// for displaying information 
import { proposalStates as states } from '../../helpers/proposalStates';

export default function ProposalInfo() {
    // fetch more state with the given id
    const { proposals } = useAppContext();
    const { proposalId } = useParams();

    // status
    const state = useProposalState(proposalId);
    
    // title
    // description
    // if there are images uploaded then get those

    return (
        <article className="proposal-info">
            <header>
                <div className="banner">
                    <Badge className="mt-2" bg={state ? states[state].color : null} style={{width: "15%"}} >{state ? states[state].text : "..loading"}</Badge>
                </div>
                <h1>{proposals.get(proposalId).title}</h1>
            </header>
                <p>{proposals.get(proposalId).description || "No Description"}</p>
                <div>
                <h4>Proposed: </h4>
                    {
                        proposals.get(proposalId).value.map((v, i) => (
                            !v[0].includes("Image") 
                            ? <p key={i} style={{display: "block", fontSize: '0.8rem'}} key={i}>
                                <b>{v[0]}:</b> {v[1]}
                            </p>
                            : 
                            <div style={{width: "7.5rem"}}>
                                <p key={i} style={{display: "block", fontSize: '0.8rem'}} key={i}>
                                    <b>Nft image:</b>
                                </p>
                                <img src={v[1]} width="100%"/> 
                            </div>
                        ))
                    }
                </div>
                
        </article>
    )
}

import React from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

// for retrieving proposal information
import { useAppContext } from '../../AppContext';
import { useProposalInformation } from '../../hooks/useProposalInformation';

// for displaying information 
import { proposalStates as states } from '../../helpers/proposalStates';

export default function ProposalInfo() {
    // fetch more state with the given id
    const { proposals } = useAppContext();
    const { proposalId } = useParams();
    const { state } = useProposalInformation(proposalId); 

    return (
        <article className="proposal-info">
            <div className="banner">
                <Badge className="mt-2" bg={state ? states[state].color : null} style={{width: "15%"}} >{state ? states[state].text : "..loading"}</Badge>
            </div>
            <header className="text-center">
                <h1>{proposals.get(proposalId).title}</h1>
            </header>
            <div className="pt-3 pb-3 text-left"> {/* body */}
                <h3>{proposals.get(proposalId).description || "No Description"}</h3>
            </div>
            <footer className="mt-5"> {/* footer */} 
            <h5><small><b>Proposed Change:</b></small></h5>
                {
                    proposals.get(proposalId).value.map((v, i) => (
                        !v[0].includes("Image") 
                        ? <p key={i} style={{display: "block", fontSize: '0.8rem'}} key={i}>
                            <em><b>{v[0]}:</b></em> {v[1]}
                        </p>
                        : 
                        <div style={{width: "7.5rem"}}>
                            <p key={i} style={{display: "block", fontSize: '0.8rem'}} key={i}>
                                <em><b>Nft image:</b></em>
                            </p>
                            <img src={v[1]} width="100%"/> 
                        </div>
                    ))
                }
            </footer>                
        </article>
    )
}

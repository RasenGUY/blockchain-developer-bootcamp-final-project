import React from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

// for retrieving proposal information
import { useProposalInformation } from '../../hooks/useProposalInformation';

// for displaying information 
import { proposalStates as states } from '../../helpers/proposalStates';

export default function ProposalInfo({proposals}) {
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
                { state ? 
                    proposals.get(proposalId).value.map((v) => (
                        !v[0].includes("Image") 
                        ? <p key={v[1]} style={{display: "block", fontSize: '0.8rem'}} >
                            <em><b>{v[0]}:</b></em> {v[1]}
                        </p>
                        : 
                        <div style={{width: "7.5rem"}}>
                            <p key={v[1]} style={{display: "block", fontSize: '0.8rem'}}>
                                <em><b>Nft image:</b></em>
                            </p>
                            <img src={v[1]} width="100%"/> 
                        </div>
                    )):
                    <h2>...gathering data</h2>
                }
            </footer>                
        </article>
    )
}

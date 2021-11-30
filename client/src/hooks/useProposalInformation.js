import React, { useState, useEffect } from 'react';
import { useContract } from "./useContract";
import { useProvider } from './useProvider'; 
import governorArtifact from "../contracts/IkonDAOGovernor.json";
 

// retireves all information related to a proposal;
export function useProposalInformation(id){
    const provider = useProvider(id);
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    const [start, setStart] = useState();
    const [deadline, setDeadline] = useState();
    const [state, setState] = useState();
    const [votes, setVotes] = useState();

    useEffect(()=> {
        
        // returns startDate of votes 
        governor.methods.proposalSnapshot(id).call()
        .then(
            res => provider.eth.getBlock(Number(res))
            .then(block => setStart(new Date(block.timestamp * 1000)))
        );
        governor.methods.proposalDeadline(id).call()
        .then(
            res => provider.eth.getBlock(Number(res))
            .then(block => setDeadline(new Date(block.timestamp * 1000)))
        );
        governor.methods.proposalVotes(id).call().then(res => setVotes(res));
        governor.methods.state(id).call().then(res => setState(res));
        
    }, [id]);
    return {start: start, deadline: deadline, state: state, votes: votes};
}
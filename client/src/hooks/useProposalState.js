import React, { useState, useEffect } from 'react';
import governorArtifact from '../contracts/IkonDAOGovernor.json';
import { useContract } from './useContract';

export function useProposalState(id){
    const [proposalState, setProposalState] = useState();
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    
    useEffect(()=>{
        governor.methods.state(id).call().then( state => 
            setProposalState(state.toString()) 
        ).catch(e => console.log(e));
    }, [id])

    return proposalState;
} 
import {useState, useEffect} from 'react';
import { useAppContext } from '../AppContext';

export function useProposals(setLoaded) {
    const { setProposals, proposals } = useAppContext();
    
    useEffect(()=> {
        if (!proposals){
            setProposals();
        }
        if(proposals){
            setLoaded(true);
        }
    }, [proposals]);

    return proposals; 
}

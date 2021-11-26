import { useMemo } from 'react';
import {
  Contract,
  // ContractInterface
} from '@ethersproject/contracts';
import { AddressZero } from '@ethersproject/constants';
import { InfuraProvider } from '@ethersproject/providers';
import { useAppContext } from '../AppContext';

export function useContract(contractAddress, ABI) {
    
    const { memberAddress, injectedProvider } = useAppContext();

    if (contractAddress === AddressZero) {
        throw Error(`Invalid 'contractAddress' parameter '${contractAddress}'.`);
    }

    const signerOrProvider = memberAddress 
    ? injectedProvider.getSigner(memberAddress) 
    : injectedProvider;


    return useMemo(() => {
        return new Contract(contractAddress, ABI, signerOrProvider);
    }, [contractAddress, ABI, injectedProvider, memberAddress]);
}

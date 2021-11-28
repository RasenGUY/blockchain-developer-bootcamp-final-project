import React, { createContext, useReducer } from 'react';
import { updateProposals, getProposals } from './web3-storage/ipfsStorage';

const initialContext = {
  proposals: undefined,
  updateProposals: async () => {},
  // nfts: undefined,
  // updateNfts: async () => {},
  // vectors: undefined,
  // updateVectors: async () => {},
};


const appReducer = (state, { type, payload }) => {
  switch (type) {
    case "UPDATE_PROPOSALS": 
      return {
        ...state,
        proposals: [...state.proposals, ...payload]
      }

    // case "UPDATE_NFTS":
    //   return {
    //     ...state,
    //     nfts: [...state.nfts, ...payload]
    //   }
    // case 'UPDATE_VECTORS': 
    //   return {
    //     ...state,
    //     vectors: [...state.vectors, ...payload]
    //   }
    default:
      return state;
  }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  // initialize  
  getProposals().then(data => initialContext.proposals = data);
  
  const [store, dispatch] = useReducer(appReducer, initialContext);
  

  const contextValue = {
    proposals: store.proposals,
    updateProposals: async payload => {
      let newData = await updateProposals(payload);
      dispatch({type: 'UPDATE_PROPOSALS', payload: newData }) // update appcontext
    }
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};



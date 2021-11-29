import React, { createContext, useReducer } from 'react';
import { updateIpfsData, getIpfsData } from './web3-storage/ipfsStorage';

const initialContext = {
  proposals: undefined,
  updateProposals: async () => {},
  graphics: undefined,
  updateGraphics: async () => {}
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
    case "UPDATE_GRAPHICS":
      return {
        ...state,
        graphics: [...state.graphics, ...payload]
      }
    default:
      return state;
  }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  
  // initialize  
  getIpfsData('proposals').then(data => initialContext.proposals = data);
  // getIpfsData('graphics').then(data => initialContext.graphics = data);

  const [store, dispatch] = useReducer(appReducer, initialContext);
  
  const contextValue = {
    proposals: store.proposals,
    updateProposals: async payload => {
      let newData = await updateIpfsData('proposals', payload);
      alert("stored proposal on ipfs");
      dispatch({type: 'UPDATE_PROPOSALS', payload: newData }); // update appcontext
    },
    graphics: store.graphics,
    updateGraphics: async payload => {
      let newData = await updateIpfsData('graphics', payload);
      alert("stored proposal on ipfs");
      dispatch({type: 'UPDATE_GRAPHICS', payload: newData }); // update appcontext
    }
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};



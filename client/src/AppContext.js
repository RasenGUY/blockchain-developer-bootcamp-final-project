import React, { createContext, useReducer } from 'react';
import { updateIpfsData, getIpfsData } from './web3-storage/ipfsStorage';

const initialContext = {
  proposals: undefined,
  setProposals: async () => {},
  updateProposals: async () => {},
  graphics: undefined,
  setGraphics: async () => {},
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
        proposals: new Map([...state.proposals]).set(payload.id, payload)
      }
    case "UPDATE_GRAPHICS":
      return {
        ...state,
        graphics: new Map([...state.proposals]).set(payload.id, payload)
      }
    case "SET_PROPOSALS": 
      return {
        ...state,
        proposals: new Map([...payload])
      }
    case "SET_GRAPHICS": 
      return {
        ...state,
        graphics: new Map([...payload])
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
    setProposals: async () => {
      let data = await getIpfsData('proposals');
      dispatch({type: 'SET_PROPOSALS', payload: data})
    },
    updateProposals: async payload => {
      let newData = await updateIpfsData('proposals', payload);
      dispatch({type: 'UPDATE_PROPOSALS', payload: newData }); // update appcontext
    },
    graphics: store.graphics,
    updateGraphics: async payload => {
      let newData = await updateIpfsData('graphics', payload); 
      dispatch({type: 'UPDATE_GRAPHICS', payload: newData }); // update appcontext
    }
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};



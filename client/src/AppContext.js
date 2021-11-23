import React, { createContext, useReducer } from 'react';
const initialContext = {
  memberAddress: "some address",
  memberVotes: "voting power of member",
  memberTokens: "token balance of owner",  
  setMemberTokens: () => {}, // fetches tokens of member
  setMemberVotes: () => {} // fetches tokens of member
};

const appReducer = (state, { type, payload }) => {
  switch (type) {
    case 'UPDATE_VOTES':
      return {
        ...state, 
        memberVotes: payload
      };
    case 'UPDATE_TOKENS':
      return {
        ...state, 
        memberTokens: payload
      };
    default:
      return state;
  }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const [store, dispatch] = useReducer(appReducer, initialContext);

  const contextValue = {
    memberAddress: store.memberAddress,
    memberVotes: store.memberVotes,
    memberTokens: store.memberTokens, 
    setMemberVotes: async (payload) => dispatch({type: "UPDATE_VOTES", payload}), 
    setMemberTokens: async (payload) => dispatch({type: "UPDATE_TOKENS", payload})
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

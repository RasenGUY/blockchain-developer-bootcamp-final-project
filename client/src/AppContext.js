import React, { createContext, useReducer } from 'react';
const initialContext = {
  userLoggedIn: true,
  injectedProvider: undefined,
  setInjectedProvider: ()=>{}, 
  toggleLoggedIn: () => {},
  memberAddress: null,
  setMemberAddress: () => {},
  memberVotes: "voting power of member",
  setMemberVotes: () => {}, // fetches tokens of member
  memberTokens: "token balance of owner",  
  setMemberTokens: () => {}, // fetches tokens of member
};

const appReducer = (state, { type, payload }) => {
  switch (type) {
    case "SET_INJECTED_PROVIDER": 
      console.log("setting injected Provider")
      return {
        ...state,
        injectedProvider: payload
      }
    case 'TOGGLE_USER_LOGGED_IN':
      return {
        ...state,
        userLoggedIn: !state.userLoggedIn
      }
    case 'SET_MEMBER_ADDRESS': 
      return {
        ...state,
        memberAddress: payload
      }
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
    userLoggedIn: store.userLoggedIn,
    memberAddress: store.memberAddress,
    injectedProvider: store.injectedProvider,
    memberVotes: store.memberVotes,
    memberTokens: store.memberTokens, 
    setInjectedProvider: payload => dispatch({type: 'SET_INJECTED_PROVIDER', payload}),
    toggleUserLoggedIn: payload => dispatch({type: 'TOGGLE_USER_LOGGED_IN', payload}),
    setMemberAddress: payload => dispatch({type: 'SET_MEMBER_ADDRESS', payload}),
    setMemberVotes: payload => dispatch({type: "UPDATE_VOTES", payload}), 
    setMemberTokens: payload => dispatch({type: "UPDATE_TOKENS", payload})
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

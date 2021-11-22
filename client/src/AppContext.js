import React, { createContext, useReducer } from 'react';
const initialContext = {
  message: 'hello world',
  updateMessage: () => {}
};

const appReducer = (state, { type, payload }) => {
  switch (type) {
    case 'UPDATE_MESSAGE':
      return {
        ...state, 
        message: payload
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
    message: store.message,
    updateMessage: async (payload) => dispatch({type: "UPDATE_MESSAGE", payload})
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

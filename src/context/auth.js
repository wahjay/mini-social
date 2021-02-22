import React, { useReducer, createContext } from 'react';
import jwtDecode from 'jwt-decode';

const initialState = {
  user: null
};

// check session storage first
if(sessionStorage.getItem('jwtToken')) {
  const decodedToken = jwtDecode(sessionStorage.getItem('jwtToken'));
  // expire
  if(decodedToken.exp * 1000 < Date.now()) {
    sessionStorage.removeItem('jwtToken');
  }
  else {
    initialState.user = decodedToken;
  }
}

// initialize context
const AuthContext = createContext({
  user: null,
  login: (userData) => {},
  logout: () => {}
});

const authReducer = (state, action) => {
  switch(action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null
      };

    default:
      return state;
  }
};

const AuthProvider = (props) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (userData) => {
    sessionStorage.setItem('jwtToken', userData.token);
    dispatch({
      type: 'LOGIN',
      payload: userData
    });
  }

  const logout = () => {
    sessionStorage.removeItem('jwtToken');
    dispatch({ type: 'LOGOUT' });
  }

  // expose {user,login,logout} data to be accessed globally
  return (
    <AuthContext.Provider
      value={{ user: state.user, login, logout }}
      {...props}
    />
  );
}

export { AuthContext, AuthProvider };

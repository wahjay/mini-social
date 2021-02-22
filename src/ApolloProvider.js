import React from 'react';
import App from './App';
import {
  InMemoryCache,
  ApolloClient,
  ApolloProvider,
  split
} from '@apollo/client';
import { setContext } from "apollo-link-context";
import { SnackbarProvider } from 'notistack';
import { createUploadLink } from 'apollo-upload-client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

/*
  The createUploadLink function will create an ApolloLink
  that works like the HttpLink, but additionally it supports file uploads.
*/
const uploadLink = createUploadLink({
  uri: 'https://mini-social-media.herokuapp.com'
});

// retrieve the token from the session storage if there is any,
// so that any request to the server will have an authorizaed token
const authLink = setContext(() => {
  const token = sessionStorage.getItem('jwtToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  }
});

// for subscription authentication
const wsLink = new WebSocketLink({
  uri: 'ws://mini-social-media.herokuapp.com/graphql',
  options: {
    reconnect: true,
    ...(sessionStorage.getItem('jwtToken') &&
        {
          connectionParams: {
            authToken: sessionStorage.getItem('jwtToken')
          }
        }
      )
  },
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * when the function returns true, wsLink will be used
// * otherwise, use HTTP as usual
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(uploadLink),
);


const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Post: {
        fields: {
          likes: {
            merge(existing = [], incoming) {
              return [...incoming]
            },
          }
        }
      }
    }
  })
});

export default (
  <ApolloProvider client={client}>
    <SnackbarProvider
      maxSnack={1}
      hideIconVariant
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={3000}
      style={{ fontSize: '14px' }}
    >
      <App />
    </SnackbarProvider>
  </ApolloProvider>
)

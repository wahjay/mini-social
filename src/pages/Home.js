import React, { useContext } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import LazyLoad from 'react-lazyload';
import { Loader, Transition } from 'semantic-ui-react';
import { useSnackbar } from 'notistack';

import { AuthContext } from '../context/auth';

import PostCard from '../components/PostCard/PostCard';
import PostForm from '../components/PostForm/PostForm';

import { FETCH_POSTS_QUERY, NEW_POST_ADDED } from '../graphql';


function Home() {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { loading, data } = useQuery(FETCH_POSTS_QUERY);

  const newPostNotificaton = () => {
    const action = key => (
      <>
        <a className="snackbar-button" onClick={() => closeSnackbar(key) }>
            Got it
        </a>
        <a href="#" className="snackbar-button" onClick={() => closeSnackbar(key) }>
            View
        </a>
      </>
    );

    const msg = 'A new post has come';
    enqueueSnackbar(msg, {
      variant: 'info',
      anchorOrigin: { vertical: 'top', horizontal: 'center' },
      autoHideDuration: 5000,
      action
    });
  }

  useSubscription(NEW_POST_ADDED, {
    onSubscriptionData({ client, subscriptionData }) {
      // write the new post to cache
      client.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: {
          getPosts: [subscriptionData.data.newPost, ...data.getPosts]
        }
      })

      newPostNotificaton();
    },
    skip: !user,
    variables: { username: user && user.username }
  });

  return (
    <div className="home-column">
      { loading ?
        <div className="loader-container">
          <Loader active size='large'></Loader>
        </div>
       :
         <Transition.Group duration={200} animation={'fade down'}>
          <div className="postcard-width">
            {user && <PostForm />}
          </div>
         {
           data.getPosts && data.getPosts.map(post => (
             <div className="postcard-width" key={post.id}>
              <LazyLoad key={post.id} height={100} offset={200} once>
                <PostCard post={post} />
              </LazyLoad>
             </div>
           ))
         }
         </Transition.Group>
      }
    </div>
  );
}

export default Home;

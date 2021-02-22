import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Icon } from 'semantic-ui-react';
import Lottie from 'react-lottie-player'
import animationData from '../../lotties/heart-like-button';
import { useSnackbar } from 'notistack';

import { LIKE_POST, FETCH_LIKES, FETCH_POSTS_QUERY } from '../../graphql';

import './LikeButton.css';

function LikeButton({ user, post: { id, likeCount, likes} }) {
  const [liked, setLiked] = useState(false);             // maintain liked state locally
  const [toggleLike, setToggleLike] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const likedButtRef = useRef();                        // used to check if likeButton is unmounted

  const [likePost, { client }] = useMutation(LIKE_POST, {
    variables: { postId: id},
    onError(err) {
      // current post might have been deleted
      let { message } = err;
      message += '. It might have been deleted.';
      enqueueSnackbar(message, {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });

      // remove curernt post from the cache
      const data = client.readQuery({ query: FETCH_POSTS_QUERY });
      const res = data.getPosts.filter(post => post.id !== id);

      client.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: {
          getPosts: [...res]
        }
      })
    }
  });

  const { data, stopPolling, startPolling, updateQuery } = useQuery(FETCH_LIKES, {
    variables: { postId: id },
    skip: !user
  });

  useEffect(() => {
    startPolling(1000);
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    if(!data) return;

    const curPost = data.fetchLikes;
    if(curPost.likeCount === likeCount) return;

    likedButtRef.current && updateQuery(prevPost => ({
        ...prevPost,
        likes: curPost.likes,
        likeCount: curPost.likeCount
    }));
  }, [data, updateQuery, likedButtRef]);

  useEffect(() => {
    if(user && likes.find(like => like.username === user.username)) {
        !liked && setLiked(true);
    }
    else liked && setLiked(false);
  }, [user, likes]);

  const updateLike = () => {
    setToggleLike(true);
    // update the database
    likePost();
    setLiked(liked => !liked);
  }

  const likeButton = user ? (
    <div className="like-button" onClick={updateLike}>
      <Icon
        className="like-icon"
        fitted
        name={liked ? 'heart' : 'heart outline'}
        {...(liked && {color: 'red'})}
      />
    </div>
  ) : (
    <Link to="/login">
      <div className="like-button">
        <Icon fitted name={liked ? 'heart' : 'heart outline'} />
      </div>
    </Link>
  );

  return (
    <div ref={likedButtRef} className="like-button-container">
      {
        toggleLike && liked &&
        <Lottie
          animationData={animationData}
          loop={false}
          play
          style={{
            position: 'absolute',
            top: '-24px',
            left: '-25px',
            width: '80px',
            height: '80px',
            zIndex: 1
          }}
          goTo={30}
          rendererSettings={{preserveAspectRatio: "xMidYMid slice"}}
          onComplete={() => setToggleLike(false)}
        />
      }
      {likeButton}
      <span>{likeCount > 0 && likeCount}</span>
    </div>
  );
}

export default LikeButton;

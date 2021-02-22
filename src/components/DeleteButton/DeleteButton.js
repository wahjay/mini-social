import React, { useState } from 'react';
import { Icon, Confirm } from 'semantic-ui-react';
import { useMutation } from '@apollo/client';

import { DELETE_POST, DELETE_COMMENT, FETCH_POSTS_QUERY } from '../../graphql';

import './DeleteButton.css';

function DeleteButton({ user, username, postId, commentId, callback }) {
  const [confirmOpen,setConfirmOpen] = useState(false);

  const mutation = commentId ? DELETE_COMMENT : DELETE_POST;

  const [deleteMutation] = useMutation(mutation, {
    update(proxy) {
      setConfirmOpen(false);

      //delete post
      if(!commentId) {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY
        });

        const res = data.getPosts.filter(post => post.id !== postId);

        // update the cache
        proxy.writeQuery({
            query: FETCH_POSTS_QUERY,
            data: {
              getPosts: [...res]
            }
        });
      }

      if(callback) callback();
    },
    variables: {
      postId,
      commentId
    }
  });

  return (
    user && user.username === username && (
      <>
        <button
          className="delete-button-container"
          style={{ float: 'right' }}
          onClick={() => setConfirmOpen(true)}
        >
          <Icon className="delete-icon" name="trash" />
        </button>
        <Confirm
          className="confirm-box"
          header={"Delete Post?"}
          content={"Are you sure ? This can not be undone."}
          confirmButton={'Delete'}
          style={{ width: '300px'}}
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={deleteMutation}
        />
      </>
    )
  );
}

export default DeleteButton;

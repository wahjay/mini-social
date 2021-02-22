import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
//import { IconButton } from '@material-ui/core';
//import ChatBubbleOutlineRounded from '@material-ui/icons/ChatBubbleOutlineRounded';

import './CommentButton.css';

function CommentButton({ user, post: { id, commentCount }, commented }) {

  const commentButton = user ? (
    <div className="comment-button">
      <Link to={`/posts/${id}`}>
        <Icon
          fitted
          name={commented ? 'comment alternate' : 'comment alternate outline'}
          {...(commented ? {color: 'teal'} : {})}
        />
      </Link>
    </div>
  ) : (
    <Link to="/login">
      <div className="comment-button">
        <Icon
          fitted
          name='comment alternate outline'
        />
      </div>
    </Link>
  );

  return (
    <div className="comment-button-container">
      {commentButton}
      <span>{commentCount > 0 && commentCount}</span>
    </div>
  );
}

export default CommentButton;

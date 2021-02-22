import React from 'react';
import { Image as Avatar } from 'semantic-ui-react';
import Twemoji from 'react-twemoji';

import PopupDate from '../PopupDate/PopupDate';
import DeleteButton from '../DeleteButton/DeleteButton';
import './Comment.css';

function Comment({ postId, commentId, user, body, username, createdAt }) {

  return (
    <div className="comment">
      <div className="comment-avatar">
        <Avatar
          circular
          size='mini'
          src='https://react.semantic-ui.com/images/avatar/large/matthew.png'
          alt=""
        />
      </div>
      <div className="comment-body">
        <div className="comment-content">
          <span>{username}</span>
          <Twemoji tag='p'>
            {body}
          </Twemoji>
        </div>
        <div className="comment-date">
          <PopupDate createdAt={createdAt} position={'bottom center'}/>
        </div>
      </div>
      {
        user && user.username === username &&
        <div className="comment-right">
          <DeleteButton user={user} username={username} postId={postId} commentId={commentId}/>
        </div>
      }
    </div>
  );
}

export default Comment;

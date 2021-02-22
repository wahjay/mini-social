import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Image as Avatar } from 'semantic-ui-react';
import TextareaAutosize from 'react-textarea-autosize';
import { useMutation } from '@apollo/client';

import { IconButton } from '@material-ui/core';
import { default as EmojiIcon } from '@material-ui/icons/SentimentSatisfiedOutlined';
import GifIcon from '@material-ui/icons/Gif';
import { default as ImageIcon } from '@material-ui/icons/CropOriginal';
import { Icon } from 'semantic-ui-react';
import { useSnackbar } from 'notistack';

import { CREATE_COMMENT, FETCH_POSTS_QUERY } from '../../graphql';
import EmojiPicker from '../EmojiPicker/EmojiPicker';
import useOutsideClick from '../../Hooks/useOutsideClick';

import './PostComment.css';

function PostComment({ postId, callback }) {
  const TRUE = 1;
  const FALSE = 0;
  const [comment, setComment] = useState('');
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openComment, setOpenComment] = useState(FALSE);
  const textareaRef = useRef();
  const { enqueueSnackbar } = useSnackbar();

  const [submitComment, { loading, client }] = useMutation(CREATE_COMMENT, {
    // this update() will be called
    // after the comment has been submited
    update(_, result) {
      // let the parents who pass the callback know
      // that current user posts a comment
      const newComment = result.data.createComment.comments[0];
      if(callback) callback(newComment);
      setComment('');
    },
    onError(err) {
      let { message } = err;
      message += '. It might have been deleted.';
      // current post might have been deleted
      enqueueSnackbar(message, {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });

      // remove curernt post from the cache
      const data = client.readQuery({ query: FETCH_POSTS_QUERY });
      const res = data.getPosts.filter(post => post.id !== postId);

      client.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: {
          getPosts: [...res]
        }
      })
    },
    variables: {
      postId,
      body: comment
    }
  });

  useEffect(() => {
    if(openEmoji) setOpenComment(TRUE);
  }, [openEmoji]);

  // outside click callback for emoji picker
  const emojiClickOutsideCB = useCallback(() => {
    openEmoji && setOpenEmoji(false);
  }, [openEmoji]);

  // outside click callback for textarea
  const textareaClickOutsideCB = useCallback(() => {
    comment.length === 0 && setOpenComment(FALSE);
  }, [comment]);

  useOutsideClick(textareaRef, textareaClickOutsideCB);

  const selectEmoji = useCallback((emoji) => {
    setComment(comment + emoji.native + ' ');
  }, [comment]);

  return (
    <div className="post-comment-container" ref={textareaRef}>
      <div className="post-comment-avatar">
        <Avatar
          circular
          size='mini'
          src='https://react.semantic-ui.com/images/avatar/large/matthew.png'
          alt=""
        />
      </div>

      <div className="post-comment-bar" expand={openComment}>
        <div className="post-comment-input">
          <TextareaAutosize
            placeholder="Write a comment..."
            type="text"
            name="body"
            onChange={e => setComment(e.target.value)}
            onFocus={() => setOpenComment(TRUE)}
            value={comment}
            cols={50}
            rows={1}
          />
        </div>
        <div className="post-comment-helper" expand={openComment} onClick={() => setOpenComment(TRUE)}>
          {
            openEmoji &&
            <EmojiPicker
              callback={emojiClickOutsideCB}
              selectEmoji={selectEmoji}
            />
          }
          <IconButton onClick={() => setOpenEmoji(true)}>
            <EmojiIcon />
          </IconButton>
          <IconButton>
            <GifIcon style={{ transform: 'scale(1.6)'}} />
          </IconButton>
          <IconButton>
            <ImageIcon />
          </IconButton>
          <IconButton
            style={{ position: 'absolute', right: 0}}
            disabled={comment.trim() === '' ? true : false}
            onClick={submitComment}>
           {
              loading ? ( <Icon name='circle notch' size='small' loading /> ) : (
                <Icon
                  name='send'
                  size='small'
                  style={{color: comment.trim() === '' ? '' : '#4E88CC' }}
                />
              )
           }
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default PostComment;

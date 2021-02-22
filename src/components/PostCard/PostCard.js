import React, { useContext, useState, useRef, useCallback } from 'react';
import { Card, Image as Avatar } from 'semantic-ui-react';
import Image, { Shimmer } from 'react-shimmer'
import Twemoji from 'react-twemoji';
import { useMutation } from '@apollo/client';

import ShowMoreText from 'react-show-more-text';
import { AuthContext } from '../../context/auth';
import LikeButton from '../LikeButton/LikeButton';
import CommentButton from '../CommentButton/CommentButton';
import DeleteButton from '../DeleteButton/DeleteButton';
import PopupDate from '../PopupDate/PopupDate';
import PostComment from '../PostComment/PostComment';
import Comment from '../Comment/Comment';
import ModalImage from '../ModalImage/ModalImage';

import useLoadMore from '../../Hooks/useLoadMore';
import useInViewport from '../../Hooks/useInViewport';

import { DELETE_POST_IMAGES } from '../../graphql';

import './PostCard.css';

function PostCard({ post: {
  body,
  createdAt,
  id,
  username,
  likeCount,
  images,
  commentCount,
  comments,
  likes
}}) {
  const { user } = useContext(AuthContext);
  const videoRef = useRef();
  const [imageClick, setImageClick] = useState(null);
  const [videoPaused, setVideoPaused] = useState(false);

  // play the video when the video is within the viewport
  const updateVideoState = useCallback((inView) => {
    if(videoPaused) return; // users pause the video manually
    if(inView) videoRef.current.paused && videoRef.current.play();
    else !videoRef.current.paused && videoRef.current.pause();
  }, [videoPaused]);

  useInViewport(videoRef, updateVideoState);


  const layout = (images) => {
    if(!images || images.length === 0) return '';
    return `image-${images.length}`;
  }

  // current post may contain giphy gif, which can't be deleted
  // each post can have at most 4 images
  const deleteable = () => {
    let res = [];
    images.forEach(image => {
      if(!image.public_id) return false;
      res.push(image.public_id);
    })

    return res;
  }

  const [deletePostImages] = useMutation(DELETE_POST_IMAGES, {
    variables: {
      public_ids: deleteable() ? deleteable() : []
    }
  });

  const isCommented = () => {
    if(!user || !comments || comments.length === 0) return false;
    return !!comments.find(comment => comment.username === user.username);
  }

  const reorderComments = (comments) => {
    // copy the array before reverse
    return comments.slice().reverse();
  }

  // comments are sorted in most recent date, but I want to display them in reversed order
  const {
    data: commentsToLoad,
    handleLoadMore,
    handleDataChange,
    reset,
    numsPerPage
  } = useLoadMore({ input: reorderComments(comments) });

  const handleVideoClick = () => {
    setVideoPaused(videoPaused => !videoPaused);
    if(videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  }

  return (
    <>
      <Card className="post-card" fluid>
        <Card.Content>
          <Avatar circular floated='left' size='mini'>
            <Image
              src='https://react.semantic-ui.com/images/avatar/large/matthew.png'
              fallback={<Shimmer width={40} height={40} />}
            />
          </Avatar>

          <DeleteButton
            user={user}
            username={username}
            postId={id}
            {...(images && images.length > 0 && deleteable() ? { callback: deletePostImages } : {})}
          />
          <Card.Header style={{ fontSize: 16 }}>{username}</Card.Header>
          <PopupDate id={id} createdAt={createdAt} />
          <Card.Description className="post-card-body">
            <ShowMoreText
              lines={-1}
              more='see more'
              less='see less'
              expanded={false}
              anchorClass='post-see-more'
            >
              <Twemoji tag='p'>
                {body}
              </Twemoji>
            </ShowMoreText>
          </Card.Description>
        </Card.Content>

        {
          images && images.length > 0 &&
          <Card.Content className={`post-card-images ${layout(images)}`}>
            {
              images.map((image, i) =>
                image.mp4 ? (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      height: 'auto',
                      width: 'auto',
                      maxHeight: '480px',
                      zIndex: 1,
                    }}
                    onClick={handleVideoClick}
                  >
                    <video
                      ref={videoRef}
                      poster={image.url}
                      src={image.mp4}
                      preload="auto"
                      playsInline
                      autoPlay
                      muted
                      loop
                    >
                    </video>
                    <div className="gif-tag">GIF</div>
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{ backgroundImage: `url(${image.url})`}}
                    onClick={() => setImageClick(image.url)}>
                  </div>
                ))
            }
          </Card.Content>
        }

        <Card.Content extra>
          <div className="buttons">
            <LikeButton user={user} post={{ id, likes, likeCount }} />
            <CommentButton user={user} post={{ id, commentCount }} commented={isCommented()}/>
          </div>
        </Card.Content>

        {
          comments && comments.length > 0 &&
          <Card.Content extra className="post-card-comment-section">
            {
              commentsToLoad.map(comment => (
                <Comment
                  key={comment.id}
                  postId={id}
                  commentId={comment.id}
                  user={user}
                  body={comment.body}
                  username={comment.username}
                  createdAt={comment.createdAt}
                />
              ))
            }
            {
              commentsToLoad.length < comments.length ?
              <span id="comments-view-more" onClick={handleLoadMore}>View more comments</span> :
              (commentsToLoad.length > numsPerPage && <span id="comments-hide" onClick={reset}>Hide</span>)
            }
          </Card.Content>
        }

        {
          user &&
          <Card.Content className="post-card-post-comment">
            <PostComment postId={id} callback={handleDataChange} />
          </Card.Content>
        }
      </Card>
      {imageClick && <ModalImage src={imageClick} close={setImageClick} /> }
    </>
  );
}

export default PostCard;

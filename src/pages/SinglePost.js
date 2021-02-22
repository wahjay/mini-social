import React, { useContext, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Loader, Grid, Image as Avatar, Card } from 'semantic-ui-react';
import Twemoji from 'react-twemoji';

import { AuthContext } from '../context/auth';

import { FETCH_POST_QUERY, FETCH_POSTS_QUERY } from '../graphql';
import PostComment from '../components/PostComment/PostComment';
import LikeButton from '../components/LikeButton/LikeButton';
import CommentButton from '../components/CommentButton/CommentButton';
import DeleteButton from '../components/DeleteButton/DeleteButton';
import PopupDate from '../components/PopupDate/PopupDate';
import Comment from '../components/Comment/Comment';
import ModalImage from '../components/ModalImage/ModalImage';

function SinglePost(props) {
    const { user } = useContext(AuthContext);
    const [imageClick, setImageClick] = useState(null);
    const postId = props.match.params.postId;

    // go back to the home page after deletion
    const deletePostCallback = () => {
      props.history.push('/');
    };

    const { loading, data, error, client } = useQuery(FETCH_POST_QUERY, {
      variables: {
        postId
      }
    })

    let postMarkup;
    if(loading) {
        postMarkup = (
          <Loader active size='large'></Loader>
        );
    }
    else if(error) {
        // remove curernt post from the cache
        const data = client.readQuery({ query: FETCH_POSTS_QUERY });
        const res = data.getPosts.filter(post => post.id !== postId);

        client.writeQuery({
          query: FETCH_POSTS_QUERY,
          data: {
            getPosts: [...res]
          }
        });

        window.location.href = "/";
    }
    else {
      const {
        id,
        body,
        createdAt,
        username,
        comments,
        likes,
        likeCount,
        commentCount,
        images
      } = data.getPost;

      postMarkup = (
        <div className="single-post-container">
          <div className="postcard-container">
            <Grid.Column computer={10}>
              <Card fluid className="single-post-card">
                <Card.Content className="single-post-card-header">
                  <Avatar
                    circular
                    floated='left'
                    size='mini'
                    src='https://react.semantic-ui.com/images/avatar/large/matthew.png'
                    alt=""
                    style={{ width: '40px', height: '40px'}}
                  />

                  <DeleteButton
                    user={user}
                    username={username}
                    postId={id}
                    callback={deletePostCallback}
                  />
                  <Card.Header>{username}</Card.Header>
                  <PopupDate id={id} createdAt={createdAt} />
                  <Card.Description className="single-post-body">
                    <Twemoji tag='p'>
                      {body}
                    </Twemoji>
                  </Card.Description>
                </Card.Content>

                {
                  images && images.length > 0 &&
                  <Card.Content className="single-post-images">
                    {
                      images.map((image, i) => (
                        <div
                          key={i}
                          style={{ backgroundImage: `url(${image.gif ? image.gif : image.url})`}}
                          onClick={() => setImageClick(image.gif ? image.gif : image.url)}>
                        </div>
                      ))
                    }
                  </Card.Content>
                }

                <Card.Content extra className="buttons">
                  <LikeButton user={user} post={{ id, likeCount, likes }} />
                  <CommentButton user={user} post={{ id, commentCount }} />
                </Card.Content>

                <Card.Content extra>
                  { user && (<PostComment postId={id} />) }
                  <br />
                  {
                    comments && comments.map(comment => (
                      <Comment
                        key={comment.id}
                        postId={id}
                        commentId={comment.id}
                        user={user}
                        body={comment.body}
                        username={username}
                        createdAt={comment.createdAt}
                      />
                    ))
                  }
                </Card.Content>
              </Card>
            </Grid.Column>
          </div>
          {imageClick && <ModalImage src={imageClick} close={setImageClick} /> }
        </div>
      );
    }

    return postMarkup;
}

export default SinglePost;

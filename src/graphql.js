import { gql } from '@apollo/client';

const FETCH_POSTS_QUERY = gql`
  {
    getPosts {
      id
      body
      createdAt
      username
      images {
        public_id
        url
        mp4
      }
      likeCount
      likes {
        username
      }
      commentCount
      comments{
        id
        username
        createdAt
        body
      }
    }
  }
`;

const FETCH_POST_QUERY = gql`
  query getPost($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      createdAt
      username
      images {
        public_id
        gif
        url
        mp4
      }
      likeCount
      likes {
        username
      }
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`;

const FETCH_LIKES = gql`
  query fetchLikes($postId: ID!) {
    fetchLikes(postId: $postId) {
      id
      likes {
        username
      }
      likeCount
    }
  }
`;

const LIKE_POST = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes {
        id
        username
      }
      likeCount
    }
  }
`;

const CREATE_POST = gql`
  mutation createPost(
    $body: String
    $images: [FileInput]
  ) {
    createPost(body: $body, images: $images) {
      id
      body
      createdAt
      username
      images {
        public_id
        url
        mp4
      }
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation createComment($postId: ID!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      id
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`;

const DELETE_POST = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

const DELETE_COMMENT = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`;

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        password: $password
        confirmPassword: $confirmPassword
        email: $email
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

const LOGIN_USER = gql`
  mutation login(
    $username: String!
    $password: String!
  ) {
    login(
      username: $username
      password: $password
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

const UPLOAD_POST_IMAGES = gql`
  mutation uploadPostImages($files: [Upload!]!) {
    uploadPostImages(files: $files) {
      mimetype
      url
      public_id
    }
  }
`;

const DELETE_POST_IMAGES = gql`
  mutation deletePostImages($public_ids : [String!]!) {
    deletePostImages(public_ids: $public_ids)
  }
`;

/* Subscription */
/*
const LIKE_ADDED_SUBSCRIPTION = gql`
  subscription OnLikeAdded($postId: ID!) {
    likeAdded(postId: $postId) {
      id
      likeCount
      likes {
        id
        username
      }
    }
  }
`;
*/

const NEW_POST_ADDED = gql`
  subscription onNewPost($username: String!) {
    newPost(username: $username) {
      id
      body
      createdAt
      username
      images {
        public_id
        url
        mp4
      }
      likeCount
      likes {
        username
      }
      commentCount
      comments{
        id
        username
        createdAt
        body
      }
    }
  }
`;


export {
  FETCH_POSTS_QUERY,
  FETCH_POST_QUERY,
  CREATE_POST,
  CREATE_COMMENT,
  REGISTER_USER,
  LOGIN_USER,
  LIKE_POST,
  DELETE_POST,
  DELETE_COMMENT,
  UPLOAD_POST_IMAGES,
  DELETE_POST_IMAGES,
  FETCH_LIKES,
  NEW_POST_ADDED
  //LIKE_ADDED_SUBSCRIPTION
};

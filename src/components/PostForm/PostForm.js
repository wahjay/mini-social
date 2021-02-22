import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import useForm from '../../Hooks/useForm';
import { Image, Button, Form } from 'semantic-ui-react';
import TextareaAutosize from 'react-textarea-autosize';
import { CREATE_POST, FETCH_POSTS_QUERY, UPLOAD_POST_IMAGES } from '../../graphql';

import { IconButton } from '@material-ui/core';
import { default as EmojiIcon } from '@material-ui/icons/SentimentSatisfiedOutlined';
import GifIcon from '@material-ui/icons/Gif';
import { default as ImageIcon } from '@material-ui/icons/CropOriginal';
import CircularProgress from '@material-ui/core/CircularProgress';

import ImageToBeUploaded from '../ImageToBeUploaded/ImageToBeUploaded';
import EmojiPicker from '../EmojiPicker/EmojiPicker';
import GifPicker from '../GifPicker/GifPicker';


import './PostForm.css';

function PostForm() {
  const initialValues = { body: '', images: [] };
  const { values, handleChange, handleSubmit } = useForm(createPostCB, initialValues);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openGif, setOpenGif] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [files, setFiles] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef(null);

  const [createPost, { loading: postSubmitting }] = useMutation(CREATE_POST, {
    update(proxy, result) {
      // get all the posts from the cache
      // after making a new post
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY
      });

      // write back to cache
      proxy.writeQuery({
          query: FETCH_POSTS_QUERY,
          data: {
            // data = [new post, all the previous posts]
            getPosts: [result.data.createPost, ...data.getPosts]
          }
      });
      // reset
      values.body = '';
      values.images = [];
    },
    variables: values
  });

  const storeItemToState = (name, val) => {
    let e = { target: {} };
    e.target.name = name;
    e.target.value = val;
    handleChange(e);
  }

  // submit the uploaded images first, then the post body
  const [uploadPostImages, { loading: imageUploading }] = useMutation(UPLOAD_POST_IMAGES, {
    update(_, result) {
      let resImages = result.data.uploadPostImages;
      resImages.forEach(image => {
        image["__typename"] && delete image["__typename"]
      });

      // store the returned image urls in the local state
      storeItemToState('images', resImages);
    }
  });

  async function createPostCB() {
    if(selectedGif) {
      const gif = selectedGif;
      setFiles([]);
      setSelectedGif(null);
      await storeItemToState('images', [gif]);
    }
    else if(files.length > 0) {
      const images = files.map(file => file.file);
      await uploadPostImages({ variables: { files: images } });
      // release the reference to the file objects in browser
      files.forEach(file => URL.revokeObjectURL(file.file));
      setFiles([]);
    }

    createPost();
  }

  // update openEmoji state based on user click
  const emojiClickOutsideCB = () => {
    openEmoji && setOpenEmoji(false);
  };

  const gifClickOutsideCB = () => {
    openGif && setOpenGif(false);
  }

  const selectEmoji = (emoji) => {
    const val = values.body + emoji.native + ' ';
    storeItemToState('body', val);
  }

  const removeFiles = (id) => {
    selectedGif && setSelectedGif(null);
    setFiles(files.filter((file, i) => i !== id ));
  }

  const uploadFile = (e) => {
    const numFiles = e.target.files.length;
    const msg = 'You can submit either 1 gif or up to 4 images.';
    const MAX_FSIZE = 10000000; // 10MB max

    if(numFiles === 0 || numFiles + files.length > 4) {
      // trigger the toast to let users know
      enqueueSnackbar(msg, { variant: 'info' });
      // clear file input
      inputRef.current.value = "";
      return;
    }

    const inputFiles = Array.from(e.target.files);
    const invalid = inputFiles.find(file => file.type === 'image/gif' || file.size > MAX_FSIZE);

    if(invalid && numFiles + files.length > 1) {
      // trigger the toast to let users know
      enqueueSnackbar(msg, { variant: 'info' });
      // clear file input
      inputRef.current.value = "";
      return;
    }

    let _files = [];
    for(let i = 0; i < numFiles; i++) {
      let file = e.target.files[i];
      let img_url = URL.createObjectURL(file);
      _files.push({ url: img_url, file: file });
    }

    setFiles([...files, ..._files]);
    inputRef.current.value = "";
  };

  const cantUploadMore = () => {
    if(selectedGif) return true;

    const hasGif = files.find(file => file.file.type === 'image/gif');
    return files.length >= 4 || !!hasGif;
  }

  const cantSelectMore = () => {
    if(selectedGif) return true;
    return files.length >= 1;
  }

  const disablePost = () => {
    return (values.body.length === 0 && files.length === 0) || postSubmitting || imageUploading;
  }

  //import Image, { Shimmer } from 'react-shimmer'
  return (
    <div className="post-form" style={imageUploading? { pointerEvents: 'none', opacity: '0.7'} : {}}>
      <div className="avatar">
        <Image
          circular
          floated='left'
          size='mini'
          src='https://react.semantic-ui.com/images/avatar/large/matthew.png'
        >
        </Image>
      </div>
      <Form className="post-form-field" onSubmit={handleSubmit}>
        <div className="textarea-container">
          <TextareaAutosize
            placeholder="Got something to say?"
            type="text"
            name="body"
            onChange={handleChange}
            value={values.body}
            cols={50}
            rows={1}
          />

          <div className="textarea-helper">
            <div className="textarea-icons">
              {
                openEmoji && (
                  <EmojiPicker
                    callback={emojiClickOutsideCB}
                    selectEmoji={selectEmoji}
                  />
                )
              }
              <IconButton onClick={() => setOpenEmoji(true)}>
                <EmojiIcon style={{ transform: 'scale(1.2)'}} />
              </IconButton>
              <IconButton onClick={() => setOpenGif(true)} disabled={cantSelectMore()}>
                <GifIcon style={{ transform: 'scale(1.6)'}} />
              </IconButton>

                <input
                  multiple
                  ref={inputRef}
                  type="file"
                  name="images"
                  accept="image/*"
                  onChange={uploadFile}
                  style={{ display: 'none'}}
                />
                <IconButton onClick={() => inputRef.current.click()} disabled={cantUploadMore()}>
                  <ImageIcon style={{ transform: 'scale(1.2)'}} />
                </IconButton>
            </div>
            <Button
              className={`post-form-button ${disablePost() ? 'button-inactive' : ''}`}
              disabled={disablePost()}
              type="submit">
                {
                  postSubmitting || imageUploading ?
                  <CircularProgress size={20} style={{ color: 'black'}}/> :
                  <span>Post</span>
                }
            </Button>
          </div>
          {
            files.length > 0 &&
             <ImageToBeUploaded images={files} removeImage={removeFiles}/>
          }
        </div>
      </Form>
      {
        openGif &&
        <GifPicker
          close={() => setOpenGif(false)}
          selectGif={setFiles}
          onSelectGif={setSelectedGif}
          callback={gifClickOutsideCB}
        />
      }
    </div>
  );
}

export default PostForm;

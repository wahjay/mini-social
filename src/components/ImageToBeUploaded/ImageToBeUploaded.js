import React, { useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@material-ui/core';
import { default as PlayIcon } from '@material-ui/icons/PlayCircleFilled';
import { Loader } from 'semantic-ui-react';
import { Image } from "react-image-and-background-image-fade";

import './ImageToBeUploaded.css';

function ImageToBeUploaded({ images, removeImage }) {
  const [play, setPlay] = useState(false);

  return (
    <div className="to-be-upload-container">
      {
        images.map((image, i) => (
          <div key={i} className="image-to-be-uploaded">
            <Image
              key={i}
              src={play ? image.gif : image.url}
              {...(image.gif ? { onClick: () => setPlay(play => !play)} : {} )}
              isResponsive
              className="image"
              renderLoader={({ hasLoaded, hasFailed }) => (
                !hasLoaded && <Loader active size='medium'></Loader>
              )}
            >
              <IconButton className="remove-button" onClick={() => removeImage(i)} size='small'>
                <CloseIcon style={{ color: 'white' }}/>
              </IconButton>
              { image.gif && !play &&
                <div style={{ position: 'absolute', left: '45%', top: '40%' }}>
                  <PlayIcon style={{ fontSize: 50, color: '#e3edf7' }}/>
                </div>
              }
              {
                image.gif && <div className="gif-tag">GIF</div>
              }
            </Image>
          </div>
        ))
      }
    </div>
  );
}

export default ImageToBeUploaded;

import React, { useEffect } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton } from '@material-ui/core';
import './ModalImage.css';

function ModalImage({ src, close }) {
  useEffect(() => {
    // disable background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return (() => {
      document.body.style.overflow = '';
    });
  }, []);

  return (
    <div className="_modal">
      <IconButton className="_modal-image-close" onClick={() => close(null)} size="medium">
        <CloseIcon style={{ color: 'white', transform: 'scale(1.3)'}}/>
      </IconButton>
      <img className="_modal-image" src={src} alt="" />
    </div>
  );
}

export default ModalImage;

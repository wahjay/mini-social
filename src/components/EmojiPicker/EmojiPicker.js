import React, { useRef, useEffect } from 'react';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import useOutsideClick from '../../Hooks/useOutsideClick';

import './EmojiPicker.css';

const emojiPickerStyle = {
  fontSize: '14px',
  position: 'absolute',
  bottom: '-350px',
  left: '-40px',
  boxShadow: '6px 6px 10px -1px rgba(0, 0, 0, 0.15), -6px -6px 10px -1px rgba(255,255,255,0.55)',
  border : '1px solid rgba(0,0,0,0)',
  borderRadius: '10px',
  background: '#e3edf7',
  zIndex: '10'
};


/* Wrapping the emoji picker so we can reuse it */
function EmojiPicker({ callback, selectEmoji }) {
  const ref = useRef(null);

  // click anywhere outside to close the emoji picker
  useOutsideClick(ref, callback);

  useEffect(() => {
    // temporarily disable all pointer events
    document.body.style['pointer-events'] = 'none';
    // However, the emoji picker should still be interactable
    let el = document.querySelector("#emoji-wrapper");
    el.style['pointer-events'] = 'auto';

    return () => {
      // all events will be enabled after the emoji picker is closed
      document.body.style['pointer-events'] = 'auto';
    };
  }, []);

  const numEmojisPerLine = () => {
    let width = window.innerWidth;
    if(width <= 350) return 7;
    else if(width <= 400) return 8;
    else return 9;
  }

  return (
    <div ref={ref} id="emoji-wrapper">
      <Picker
        set='twitter'
        showPreview={false}
        showSkinTones={false}
        autoFocus={true}
        color='#418CEF'
        perLine={numEmojisPerLine()}
        i18n={{ search: 'Search emojis', categories: { search: 'Results' } }}
        style={ emojiPickerStyle }
        onSelect={selectEmoji}
      />
    </div>
  );
}

export default EmojiPicker;

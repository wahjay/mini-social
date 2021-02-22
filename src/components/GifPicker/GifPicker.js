import React, { useState, useEffect, useRef } from 'react';
import useOutsideClick from '../../Hooks/useOutsideClick';
import { Dimmer, Loader } from 'semantic-ui-react';
import { default as BackIcon } from '@material-ui/icons/KeyboardBackspace';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import { IconButton } from '@material-ui/core';
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'


import './GifPicker.css';

const GIFPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY;
// use @giphy/js-fetch-api to fetch gifs
// apply for a new Web SDK key. Use a separate key for every platform (Android, iOS, Web)
const gf = new GiphyFetch(GIFPHY_API_KEY);

const recommend = [
  "shrug", "wink", "sad", "excited", "tired", "drunk", "surprised", "bored",
  "disappointed", "relaxed", "thank you", "party", "sorry", "dancing",
  "hello", "scared", "smile", "wow", "you got this", "ok", "idk", "applause",
  "smh", "yolo", "awww", "eww", "fml", "oh no you didnt", "funny", "cute",
  "duck", "shocked", "omg", "wtf", "oops", "sigh", "want", "on snap", "pleased",
  "meh"
];

let throttle = false;
function GifPicker({ close, selectGif, onSelectGif, callback }) {
  const ref = useRef(null);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(null);

  const getDimension = () => {
    const w = window.innerWidth || document.body.clientWidth;
    let dimension = { width: 600, columns: 4 };
    if(w <= 690) {
      dimension.width = w;
    }
    if(w <= 500) {
      dimension.columns = 3;
    }
    return dimension;
  }

  const dimension = getDimension();
  const [width, setWidth] = useState(dimension.width);
  const [columns, setColumns] = useState(dimension.columns);

  // click anywhere outside to close the gif picker
  useOutsideClick(ref, callback);

  useEffect(() => {
    let background = document.querySelector("#gifpicker-background");
    background.style.display = 'block';
    // disable background/container scrolling when modal is open
    document.body.style.overflow = 'hidden';
    let container = document.querySelector('#app-container');
    container.style.overflow = 'hidden';
    return (() => {
      document.body.style.overflow = '';
      container.style.overflow = '';
      background.style.display = 'none';
    });
  }, []);

  // trigger search only when users finish typing
  // using debounce on input event
  useEffect(() => {
    if(value === search) return;

    let timer = setTimeout(() => {
      // interestingly, without setSearch(null),
      setSearch(null);
      setSearch(value);
    }, 500);
    return(() => {
      clearTimeout(timer);
    });
  }, [value]);

  // using throttle on resize event
  useEffect(() => {
    let timer;
    function handleResize() {
      if(!throttle) {
        const dimension = getDimension();
        setWidth(dimension.width);
        setColumns(dimension.columns);
        throttle = true;
        timer = setTimeout(() => {
          throttle = false;
        }, 100);
      }
    }

    window.addEventListener('resize', handleResize);
    return (() => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    });
  }, []);

  useEffect(() => {
     (async function() {
       let hasError = false;
       try {
         const fetchGifsCategories = await Promise.all(recommend.map(async category => {
           try {
             let fetchCategory = await gf.search(category, { sort: 'relevant', offset: 0, limit: 1 });
             // no result for the current search
             if(fetchCategory.data.length === 0) {
               return {
                 name: category,
                 images: { '480w_still': { url: '' }}
               };
             }

             fetchCategory.data[0].name = category;
             return fetchCategory.data[0];
          }
          catch (err) {
            throw err;
          }
         }))
         setCategories(fetchGifsCategories);
      }
      catch(err) {
        hasError = true;
        // something wrong with the giphy fetch
        const msg = 'Oops. Something\'s wrong. Please close the gif panel and try again.';
        setErrMsg(msg);
      }
      finally {
        !hasError && setLoading(false);
      }
     })();
  }, []);

  const handleSelectCategory = (name) => {
    setSearch(name);
    setValue(name ? name : '');
  }

  const handleGifClick = (gif, e) => {
    e.preventDefault();
    // since this is just giphy url, not a file object,
    // we dont actually have a file object to store
    const file = {
      mimetype: 'image/gif',
      url: gif.images.['480w_still'].url,
      gif: gif.images.downsized_large.url,
      mp4: gif.images.original_mp4.mp4
    };
    // adding file property here just to conform to the uploaded files object structure
    selectGif([{
      url: gif.images.['480w_still'].url,   // poster url
      gif: gif.images.downsized_large.url,  // gif url
      file: { type: 'image/gif' }
    }]);
    onSelectGif(file);
    close();
  }

  let gifpickerContent;
  if(loading || categories.length === 0) {
    gifpickerContent = (
      <Dimmer active>
        <Loader size='large' style={{ color: 'white' }}>{errMsg}</Loader>
      </Dimmer>
    );
  }
  else if(search) {
    console.log('resize!', width)
    const searchFn = (offset: number) => gf.search(search, { sort: 'relevant', offset, limit: 50 });
    gifpickerContent = (
      <div className="gifpicker-categories-wrapper">
        <Grid
          width={width}
          columns={columns}
          gutter={2}
          borderRadius={0}
          fetchGifs={searchFn}
          onGifClick={handleGifClick}
        />
      </div>
    );
  }
  else {
    gifpickerContent = (
      <div className="gifpicker-categories-wrapper">
        <div className="gifpicker-categories">
          {
            categories.length > 0 && categories.map((category, i) => (
              <div
                onClick={() => handleSelectCategory(category.name)}
                key={i}
                style={{ backgroundImage: `url(${category.images['480w_still'].url})`}}>
                <span>{category.name}</span>
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={ref} className="gifpicker-container">
        <div className="gifpicker-top">
          {
            search ? (
              <IconButton onClick={() => handleSelectCategory(null)}>
                <BackIcon style={{ color: 'white' }}/>
              </IconButton>
            ) : (
              <IconButton onClick={close}>
                <CloseIcon style={{ color: 'white' }}/>
              </IconButton>
            )
          }
          <div className="gifpicker-search">
            <SearchIcon />
            <input
              placeholder="Search for GIFs"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        {gifpickerContent}
      </div>
      <div id="gifpicker-background"></div>
    </>
  );
}

export default GifPicker;

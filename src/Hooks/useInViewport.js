import { useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

// for lazy loading
function useInViewport(ref, callback) {

  const handleScroll = useCallback(() => {
    if(!ref || !ref.current) return;

    const bounding = ref.current.getBoundingClientRect();
    const isInViewport = (
      (bounding.top >= 0 && bounding.top <= (window.innerHeight || document.documentElement.clientHeight)) ||
      (bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.bottom > 200)
    );

    if(isInViewport) callback(true);
    else callback(false);
  }, [ref, callback])


  const debounceScroll = useCallback(debounce(handleScroll, 200), [handleScroll]);

  useEffect(() => {
    document.addEventListener("scroll", debounceScroll);

    return () => {
      document.removeEventListener("scroll", debounceScroll);
    };
  }, [debounceScroll]);
}

export default useInViewport;

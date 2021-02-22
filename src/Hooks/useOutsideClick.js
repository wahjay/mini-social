import { useEffect, useCallback } from "react";


const useOutsideClick = (ref, callback) => {

  const handleClick = useCallback(e => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  }, [ref, callback]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  });
};

export default useOutsideClick;

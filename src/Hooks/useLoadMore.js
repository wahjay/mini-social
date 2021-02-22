import { useState } from 'react';

const numsPerPage = 5;

function useLoadMore({ input = [] }) {
  const bound = Math.min(input.length, numsPerPage);

  const [dataToLoad, setDataToLoad] = useState(input);
  const [data, setData] = useState(input.slice(0, bound));
  const [next, setNext] = useState(bound);

  // for load more button
  const handleLoadMore = () => {
    if(next >= dataToLoad.length) return;
    const moreData = dataToLoad.slice(next, next + numsPerPage);
    setNext(next + numsPerPage);
    setData([...data, ...moreData]);
  }

  // append new item to current data
  const handleDataChange = (newItem) => {
    setData([...data, newItem]);
  }

  // for hide button
  const reset = () => {
    const bound = Math.min(data.length, numsPerPage);
    setDataToLoad(data);
    setData(data.slice(0, bound));
    setNext(bound);
  }

  return {
    data,
    handleLoadMore,
    handleDataChange,
    reset,
    numsPerPage
  };
}

export default useLoadMore;

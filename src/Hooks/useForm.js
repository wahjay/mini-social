import { useState } from 'react';

const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  const handleChange = (e) => {
    setValues({...values, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    callback();
  };

  return {
    handleChange,
    handleSubmit,
    values
  };
};

export default useForm;

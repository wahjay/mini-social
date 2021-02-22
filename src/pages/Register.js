import React, { useContext, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/auth';
import useForm from '../Hooks/useForm';
import { REGISTER_USER } from '../graphql';

function Register(props) {
  const initialValues = {
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  };

  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const { handleChange, handleSubmit, values } = useForm(register, initialValues);

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, { data: { register: userData } }) {
      context.login(userData);
      props.history.push('/');
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values
  });

  // hoisted
  function register() {
    registerUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={handleSubmit} noValidate>
        <h1>Nowhere</h1>
        <Form.Input
          className="input"
          name='email'
          placeholder='Email'
          type='email'
          value={values.email}
          onChange={handleChange}
          error={ errors.email ? true : false }
        />
        <Form.Input
          className="input"
          name='username'
          placeholder='Username'
          type='text'
          value={values.username}
          onChange={handleChange}
          error={ errors.username ? true : false }
        />
        <Form.Input
          className="input"
          name='password'
          placeholder='Password'
          type='password'
          value={values.password}
          onChange={handleChange}
          error={errors.password || errors.confirmPassword ? true : false}
        />
        <Form.Input
          className="input"
          name='confirmPassword'
          placeholder='Confirm Password'
          type='password'
          value={values.confirmPassword}
          onChange={handleChange}
          error={ errors.confirmPassword ? true : false }
        />
        <Button type="submit" primary fluid style={{ backgroundColor: '#3E92CC'}} loading={loading ? true : false}>
          Sign up
        </Button>
        <div id="switchform">Have an account? &nbsp;
          <Link to="/login"><span>Log in</span></Link>
        </div>
      </Form>
      {
        Object.keys(errors).length > 0 &&
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map(value => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      }
    </div>
  );
}

export default Register;

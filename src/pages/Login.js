import React, { useContext, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/auth';
import useForm from '../Hooks/useForm';
import { LOGIN_USER } from '../graphql';

function Login(props) {
  const initialValues = {
    username: '',
    password: ''
  };

  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const { handleChange, handleSubmit, values } = useForm(login,initialValues);

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, { data: { login: userData } }) {
      context.login(userData);
      props.history.push('/');
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values
  });

  function login() {
    loginUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={handleSubmit} noValidate>
        <h1>Nowhere</h1>
        <Form.Input
          name='username'
          placeholder='Username'
          type='text'
          value={values.username}
          onChange={handleChange}
          error={ errors.username ? true : false }
        />
        <Form.Input
          name='password'
          placeholder='Password'
          type='password'
          value={values.password}
          onChange={handleChange}
          error={errors.password || errors.confirmPassword ? true : false}
        />
        <Button type="submit" primary fluid style={{ backgroundColor: '#3E92CC'}} loading={loading ? true : false}>
          Log in
        </Button>
        <div id="switchform">Don't have a account? &nbsp;
          <Link to="/register"><span>Sign up</span></Link>
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

export default Login;

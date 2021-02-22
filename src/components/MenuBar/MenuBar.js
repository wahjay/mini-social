import React,  { useContext, useState, useEffect } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link, useHistory } from 'react-router-dom';

import { AuthContext } from '../../context/auth';

function MenuBar() {
  const { user, logout } = useContext(AuthContext);
  const history = useHistory(); // history hook

  const pathname = window.location.pathname;
  const path = pathname === '/' ? 'home' : pathname.substr(1);
  const [activeItem, setActiveItem] = useState(path);

  // listen on url change
  useEffect(() => {
    if(!history) return;
    return history.listen((location) => {
         const pathname = location.pathname;
         const path = pathname === '/' ? 'home' : pathname.substr(1);
         if(path === activeItem) return;

         setActiveItem(path);
    })
  }, [history]);

  const handleItemClick = (name) => setActiveItem(name);

  const menuBar =
    <Menu
      id="menubar"
      pointing
      secondary
      size="massive"
      color="black">
      {
        user ? (
          <>
            <Menu.Item
              name={user.username}
              active
              as={Link}
              to='/'
            />
            <Menu.Menu position='right'>
              <Menu.Item
                name='log out'
                onClick={logout}
              />
            </Menu.Menu>
          </>
        ) : (
          <>
            <Menu.Item
              name='home'
              active={activeItem === 'home'}
              onClick={() => handleItemClick('home')}
              as={Link}
              to='/'
            />
            <Menu.Menu position='right'>
              <Menu.Item
                name='log in'
                active={activeItem === 'login'}
                onClick={() => handleItemClick('login')}
                as={Link}
                to='/login'
              />
              <Menu.Item
                name='sign up'
                active={activeItem === 'register'}
                onClick={() => handleItemClick('register')}
                as={Link}
                to='/register'
              />
            </Menu.Menu>
          </>
        )
      }
    </Menu>

  return menuBar;
}

export default MenuBar;

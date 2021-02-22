import React from 'react';
import { Card, Popup } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import './PopupDate.css';

function PopupDate({ id, createdAt, position }) {

  const hoverCreatedAt = () => {
    return (
      <Card.Meta
        className="createdAt"
        {...(id ? { as: Link } : {})}
        {...(id ? { to : `/posts/${id}` } : {})}
        style={{ fontSize: 12 }}
      >
        {moment(createdAt).fromNow(true)}
      </Card.Meta>
    );
  }

  return (
    <Popup
      trigger={hoverCreatedAt()}
      content={moment(createdAt).format('llll')}
      style={{ opacity: 0.8 }}
      size='tiny'
      position={position ? position : 'right center'}
      flowing={true}
      mouseEnterDelay={500}
      inverted
      basic
    />
  );
}

export default PopupDate;

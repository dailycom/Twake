import React, {Component} from 'react';

import './animation.scss';
import './unicons.scss';

export default class Icon extends React.Component {
  /*
      props = {
          type : icon name
      }
  */
  constructor(props) {
    super();
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.type != this.props.type || nextProps.className != this.props.className) {
      return true;
    }
    return false;
  }
  render() {
    return (
      <i
        ref={this.props.refDom}
        className={'icon-unicon uil-' + this.props.type + ' ' + this.props.className}
        onClick={this.props.onClick}
        style={this.props.style}
      />
    );
  }
}

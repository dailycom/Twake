import React, {Component} from 'react';
import './AutoHeight.scss';

export default class AutoHeight extends React.Component {
  constructor(props) {
    super();
    this.change = this.change.bind(this);
  }
  componentDidMount() {
    this.textarea_offset =
      parseInt(this.textarea.style.paddingTop || 0) +
      parseInt(this.textarea.style.paddingBottom || 0);
    window.addEventListener('resize', this.change);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.change);
  }
  change() {
    this.textarea.style.height = '1px';
    var totalHeight = this.textarea.scrollHeight - this.textarea_offset + 4;
    this.textarea.style.height = totalHeight + 'px';
    this.container.style.height = totalHeight + 'px';
    if (this.oldHeight != totalHeight && this.props.onResize) {
      this.props.onResize();
    }
    this.oldHeight = totalHeight;
  }
  componentDidUpdate(nextProps) {
    this.change();
  }
  render() {
    var className = this.props.className || '';

    if (this.props.big) {
      className += ' big ';
    }
    if (this.props.medium) {
      className += ' medium ';
    }
    if (this.props.small) {
      className += ' small ';
    }

    if (
      className.indexOf('medium') === className.indexOf('small') &&
      className.indexOf('big') === className.indexOf('small') &&
      className.indexOf('big') < 0
    ) {
      className += ' medium';
    }

    return (
      <div
        ref={node => (this.container = node)}
        className={'input autoheight_container ' + className}
        style={{ display: 'inline-block', width: '100%' }}
        onMouseEnter={() => {
          this.change();
        }}
      >
        <textarea
          {...this.props}
          className="input full_width"
          ref={node => {
            if (this.props.refInput) {
              this.props.refInput(node);
            }
            this.textarea = node;
          }}
          onChange={evt => {
            if (this.props.onChange) {
              this.props.onChange(evt);
            }
          }}
          onKeyUp={this.props.onKeyUp}
          onKeyDown={this.props.onKeyDown}
        >
          {this.props.children}
        </textarea>
      </div>
    );
  }
}

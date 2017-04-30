// @flow weak
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import transition from './transition';
import stop from './stop';
import { ENTER, UPDATE, EXIT } from '../types';

export const propTypes = {
  type: PropTypes.string.isRequired,
  udid: PropTypes.string.isRequired,
  node: PropTypes.object.isRequired,
  data: PropTypes.oneOfType([
    PropTypes.array, // NodeGroup data
    PropTypes.func,  // TickGroup scale
  ]),
  start: PropTypes.func.isRequired,

  enter: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,

  render: PropTypes.func.isRequired,

  removeUDID: PropTypes.func.isRequired,
  lazyRemoveUDID: PropTypes.func.isRequired,
};

export default class Node extends PureComponent {
  static propTypes = propTypes;

  constructor(props) {
    super(props);

    // (this:any).getNodeRef = this.getNodeRef.bind(this);
    (this:any).remove = this.remove.bind(this);
    (this:any).lazyRemove = this.lazyRemove.bind(this);
  }

  state = this.props.start(this.props.node);

  componentDidMount() {
    const { node, enter } = this.props;
    transition.call(this, enter(node, this.remove, this.lazyRemove));
  }

  componentWillReceiveProps(next) {
    const { props } = this;

    if (next.data !== props.data) {
      switch (next.type) {
        case ENTER:
          transition.call(
            this,
            next.enter(next.node, this.remove, this.lazyRemove),
          );
          break;
        case UPDATE:
          transition.call(
            this,
            next.update(next.node, this.remove, this.lazyRemove),
          );
          break;
        case EXIT:
          transition.call(
            this,
            next.leave(next.node, this.remove, this.lazyRemove),
          );
          break;
        default:
          break;
      }
    }
  }

  componentWillUnmount() {
    stop.call(this);
  }

  // node = null; // ref for wrapped component

  // invokeMethodIfExists(method) {
  //   const { node } = this;
  //   if (node && node[method]) {
  //     transition.call(node, node[method]());
  //   }
  // }

  remove() {
    const { removeUDID, udid } = this.props;
    removeUDID(udid);
  }

  lazyRemove() {
    const { lazyRemoveUDID, udid } = this.props;
    lazyRemoveUDID(udid);
  }

  // getNodeRef(d) {
  //   this.node = d;
  // }

  // render() {
  //   const props = Object.assign({}, this.props);

  //   Object.keys(propTypes).forEach((p) => {
  //     delete props[p];
  //   });

  //   return (
  //     <Component
  //       ref={this.getNodeRef}
  //       type={this.props.type}
  //       data={this.props.node}
  //       remove={this.remove}
  //       lazyRemove={this.lazyRemove}
  //       {...props}
  //     />
  //   );
  // }

  render() {
    const { state, props: { udid, node, render } } = this;

    return render(udid, node, state);
  }
}
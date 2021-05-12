import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Dimensions, Platform } from 'react-native';

/**
 * Default styles
 * @type {StyleSheetPropType}
 */
const styles = {
  container: {
    backgroundColor: 'transparent',
    position: 'relative',
    flex: 1,
  },

  wrapperIOS: {
    backgroundColor: 'transparent',
  },

  wrapperAndroid: {
    backgroundColor: 'transparent',
    flex: 1,
  },

  slide: {
    backgroundColor: 'transparent',
  },

  pagination_x: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  pagination_y: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
};

// missing `module.exports = exports['default'];` with babel6
// export default React.createClass({
export default class extends Component {
  /**
   * Props Validation
   * @type {Object}
   */
  static propTypes = {
    horizontal: PropTypes.bool,
    children: PropTypes.node.isRequired,
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    scrollViewStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    pagingEnabled: PropTypes.bool,
    showsHorizontalScrollIndicator: PropTypes.bool,
    showsVerticalScrollIndicator: PropTypes.bool,
    bounces: PropTypes.bool,
    scrollsToTop: PropTypes.bool,
    index: PropTypes.number,
    renderPagination: PropTypes.func,
    /**
     * Called when the index has changed because the user swiped.
     */
    onIndexChanged: PropTypes.func,
  };

  /**
   * Default props
   * @return {object} props
   * @see http://facebook.github.io/react-native/docs/scrollview.html
   */
  static defaultProps = {
    horizontal: true,
    pagingEnabled: true,
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    bounces: false,
    scrollsToTop: false,
    index: 0,
    onIndexChanged: () => null,
  };

  state = this.initState(this.props);

  initialRender = true;

  componentWillReceiveProps(nextProps) {
    if (nextProps.index === this.props.index) return;

    this.setState(this.initState(nextProps, this.props.index !== nextProps.index));
    this.scrollTo(nextProps.index)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.children !== prevProps.children) {
      this.setState(this.initState({ ...this.props, index: this.state.index }, true));
    }

    if (prevState.index !== this.state.index) {
      this.props.onIndexChanged(this.state.index);
    }
  }

  initState(props, updateIndex = false) {
    // set the current state
    const state = this.state || { width: 0, height: 0, offset: { x: 0, y: 0 } };

    const initState = {
      children: null,
      offset: {},
      isScrollEnabled: true
    };

    // Support Optional render page
    initState.children = Array.isArray(props.children)
      ? props.children.filter(child => child)
      : props.children;

    initState.total = initState.children ? initState.children.length || 1 : 0;

    if (state.total === initState.total && !updateIndex) {
      // retain the index
      initState.index = state.index;
    } else {
      initState.index = initState.total > 1 ? Math.min(props.index, initState.total - 1) : 0;
    }

    // Default: horizontal
    const { width, height } = Dimensions.get('window');

    initState.dir = props.horizontal === false ? 'y' : 'x';

    if (props.width) {
      initState.width = props.width;
    } else if (this.state && this.state.width) {
      initState.width = this.state.width;
    } else {
      initState.width = width;
    }

    if (props.height) {
      initState.height = props.height;
    } else if (this.state && this.state.height) {
      initState.height = this.state.height;
    } else {
      initState.height = height;
    }

    initState.offset[initState.dir] =
      initState.dir === 'y' ? height * props.index : width * props.index;

    this.internals = {
      ...this.internals,
      isScrolling: false,
    };

    return initState;
  }

  // include internals with state
  fullState() {
    return Object.assign({}, this.state, this.internals);
  }

  onLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    const offset = (this.internals.offset = {});
    const state = { width, height };

    if (this.state.total > 1) {
      let setup = this.state.index;

      offset[this.state.dir] = this.state.dir === 'y' ? height * setup : width * setup;
    }

    // only update the offset in state if needed, updating offset while swiping
    // causes some bad jumping / stuttering
    if (!this.state.offset || width !== this.state.width || height !== this.state.height) {
      state.offset = offset;
    }

    // related to https://github.com/leecade/react-native-swiper/issues/570
    // contentOffset is not working in react 0.48.x so we need to use scrollTo
    // to emulate offset.
    if (this.initialRender && this.state.total > 1) {
      this.scrollView.scrollTo({ ...offset, animated: false });
      this.initialRender = false;
    }

    this.setState(state);
  };

  /**
   * Scroll begin handle
   * @param  {object} e native event
   */
  onScrollBegin = e => {
    console.log('start');
    // update scroll state
    this.setState({
      isScrollEnabled: true
    })
    console.log('this.scrollView.setScrollEnabled', this.scrollView);
    this.internals.isScrolling = true;
    this.props.onScrollBeginDrag && this.props.onScrollBeginDrag(e, this.fullState(), this);
  };

  onScrollEnd = e => {
    console.log('emd');
    if (!this.internals.isScrolling) return;
    // update scroll state
    this.internals.isScrolling = false;


    // making our events coming from android compatible to updateIndex logic
    if (!e.nativeEvent.contentOffset) {
      if (this.state.dir === 'x') {
        e.nativeEvent.contentOffset = {
          x: e.nativeEvent.position * this.state.width,
        };
      } else {
        e.nativeEvent.contentOffset = {
          y: e.nativeEvent.position * this.state.height,
        };
      }
    }

    this.updateIndex(e.nativeEvent.contentOffset, this.state.dir, () => {
      // if `onMomentumScrollEnd` registered will be called here
      this.props.onMomentumScrollEnd && this.props.onMomentumScrollEnd(e, this.fullState(), this);
    });
    
    this.setState({
      isScrollEnabled: false
    })
  };

  onScrollEndDrag = e => {
    if (!this.internals.isScrolling) return;

    const { contentOffset } = e.nativeEvent;
    const { horizontal } = this.props;
    const { children, index } = this.state;
    const { offset } = this.internals;
    const previousOffset = horizontal ? offset.x : offset.y;
    const newOffset = horizontal ? contentOffset.x : contentOffset.y;
    if (previousOffset === newOffset && (index === 0 || index === children.length - 1)) {
      this.internals.isScrolling = false;
    }
  };

  /**
   * Update index after scroll
   * @param  {object} offset content offset
   * @param  {string} dir    'x' || 'y'
   */
  updateIndex = (offset, dir, cb) => {
    const state = this.state;
    // Android ScrollView will not scrollTo certain offset when props change
    const callback = async () => {
      cb();
      if (Platform.OS === 'android') {
        if (this.state.index === 0) {
          this.props.horizontal
            ? this.scrollView.scrollTo({
                x: state.width,
                y: 0,
                animated: false,
              })
            : this.scrollView.scrollTo({
                x: 0,
                y: state.height,
                animated: false,
              });
        } else if (this.state.index === this.state.total - 1) {
          this.props.horizontal
            ? this.scrollView.scrollTo({
                x: state.width * this.state.total,
                y: 0,
                animated: false,
              })
            : this.scrollView.scrollTo({
                x: 0,
                y: state.height * this.state.total,
                animated: false,
              });
        }
      }
    };
    let index = state.index;

    if (!this.internals.offset) this.internals.offset = {};

    const diff = offset[dir] - this.internals.offset[dir];
    const step = dir === 'x' ? state.width : state.height;

    // Do nothing if offset no change.
    if (!diff) return;

    // Note: if touch very very quickly and continuous,
    // the variation of `index` more than 1.
    // parseInt() ensures it's always an integer
    index = parseInt(index + Math.round(diff / step));
    const newState = {};
    newState.index = index;

    this.internals.offset = offset;

    this.setState(newState, callback);
  };

  scrollBy = (index, animated = true) => {
    if (this.internals.isScrolling || this.state.total < 2) return;
    const state = this.state;
    const diff = index + this.state.index;
    let x = 0;
    let y = 0;
    if (state.dir === 'x') x = diff * state.width;
    if (state.dir === 'y') y = diff * state.height;

    this.scrollView && this.scrollView.scrollTo({ x, y, animated });

    // update scroll state
    this.internals.isScrolling = true;

    // trigger onScrollEnd manually in android
    if (!animated || Platform.OS !== 'ios') {
      setImmediate(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff,
          },
        });
      });
    }
  };

  /**
   * Scroll to index
   * @param  {number} index page
   * @param  {bool} animated
   */

  scrollTo = (index, animated = true) => {
    if (this.internals.isScrolling || this.state.total < 2 || index == this.state.index) return;

    const state = this.state;
    const diff = this.state.index + (index - this.state.index);

    let x = 0;
    let y = 0;
    if (state.dir === 'x') x = diff * state.width;
    if (state.dir === 'y') y = diff * state.height;

    this.scrollView && this.scrollView.scrollTo({ x, y, animated });

    // update scroll state
    this.internals.isScrolling = true;

    // trigger onScrollEnd manually in android
    if (!animated || Platform.OS !== 'ios') {
      setImmediate(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff,
          },
        });
      });
    }
  };

  refScrollView = view => {
    this.scrollView = view;
  };

  scrollHandler = (event) => {
const i = event.nativeEvent.contentOffset.y / this.state.height;
console.log('i i i i ', i );
const h = event.nativeEvent.contentSize.height
console.log('h', h);
if (parseInt(i, 10) === i && i !== 1) {
  console.log('if', i);
  this.setState({
    isScrollEnabled: false
  },() => {
    setTimeout(()=>{
      this.setState({
        isScrollEnabled: true
        })
    }, 1000)

  });
  // this.props.onIndexChanged(i);
}
  }

  render() {
    const { children: c, offset, ...rest} = this.fullState()

    const { total, width, height, children } = this.state;
    const { containerStyle } = this.props;
    // let dir = state.dir
    // let key = 0
    let pages = [];

    const pageStyle = [{ width: width, height: height }, styles.slide];
    // For make infinite at least total > 1
    if (total > 1) {
      // Re-design a loop model for avoid img flickering
      pages = Object.keys(children);

      pages = pages.map((page, i) => {
        return (
          <View style={pageStyle} key={i}>
            {children[page]}
          </View>
        );
      });
    } else {
      pages = (
        <View style={pageStyle} key={0}>
          {children}
        </View>
      );
    }

    console.log('this.state.isScrollEnabled', this.state.isScrollEnabled);

    return (
      <View style={[styles.container, containerStyle]} onLayout={this.onLayout}>
        <ScrollView
          ref={this.refScrollView}
          {...this.props}
          contentContainerStyle={[styles.wrapperIOS, this.props.style]}
          // changes this from this.state.offset as it was often being calculated incorrectly?
          contentOffset={offset}
          onScrollBeginDrag={this.onScrollBegin}
          onMomentumScrollEnd={this.onScrollEnd}
          onScrollEndDrag={this.onScrollEndDrag}
          scrollEventThrottle={16}
          // onScroll={this.scrollHandler}
          style={this.props.scrollViewStyle}
          scrollEnabled={this.state.isScrollEnabled}
          // onTouchMove={e => {
          //   // console.log('touch', e);
          // }}
          // onTouchStart={this.onScrollBegin}
          // onTouchEnd={this.onScrollEnd}
        >
          {pages}
        </ScrollView>
      </View>
    );
  }
}
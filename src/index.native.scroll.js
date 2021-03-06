/**
 * This is an alternative version that use `ScrollView` and `ViewPagerAndroid`.
 * I'm not sure what version give the best UX experience.
 * I'm keeping the two versions here until we figured out.
 */

import React, {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  ViewPagerAndroid,
  Platform,
} from 'react-native';

const {
  width: windowWidth,
} = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
});

class SwipeableViews extends React.Component {
  static propTypes = {
    /**
     * Use this property to provide your slides.
     */
    children: React.PropTypes.node,
    /**
     * This is the inlined style that will be applied
     * to each slide container.
     */
    containerStyle: ScrollView.propTypes.style,
    /**
     * If true, it will disable touch events.
     * This is useful when you want to prohibit the user from changing slides.
     */
    disabled: React.PropTypes.bool,
    /**
     * This is the index of the slide to show.
     * This is useful when you want to change the default slide shown.
     * Or when you have tabs linked to each slide.
     */
    index: React.PropTypes.number,
    /**
     * This is callback prop. It's call by the
     * component when the shown slide change after a swipe made by the user.
     * This is useful when you have tabs linked to each slide.
     *
     * @param {integer} index This is the current index of the slide.
     * @param {integer} fromIndex This is the oldest index of the slide.
     */
    onChangeIndex: React.PropTypes.func,
    /**
     * This is callback prop. It's called by the
     * component when the slide switching.
     * This is useful when you want to implement something corresponding to the current slide position.
     *
     * @param {integer} index This is the current index of the slide.
     * @param {string} type Can be either `move` or `end`.
     */
    onSwitching: React.PropTypes.func,
    /**
     * If true, it will add bounds effect on the edges.
     */
    resistance: React.PropTypes.bool,
    /**
     * This is the inlined style that will be applied
     * on the slide component.
     */
    slideStyle: View.propTypes.style,
    /**
     * This is the inlined style that will be applied
     * on the root component.
     */
    style: View.propTypes.style,
  };

  static defaultProps = {
    index: 0,
    resistance: false,
    disabled: false,
  };

  constructor(props, context) {
    super(props, context);

    this.state = this.initState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      index,
    } = nextProps;

    if (typeof index === 'number' && index !== this.props.index) {
      this.setState({
        indexLatest: index,
        offset: {
          x: this.state.viewWidth * index,
        },
      }, () => {
      });
    }
  }

  initState(props) {
    const initState = {
      indexLatest: props.index,
      viewWidth: windowWidth,
    };

    // android not use offset
    if (Platform.OS === 'ios') {
      initState.offset = {
        x: initState.viewWidth * initState.indexLatest,
      };
    }

    return initState;
  }

  handleScroll = (event) => {
    if (this.props.onSwitching) {
      this.props.onSwitching(event.nativeEvent.contentOffset.x / this.state.viewWidth, 'move');
    }
  };

  handleMomentumScrollEnd = (event) => {
    const offset = event.nativeEvent.contentOffset;

    const indexNew = offset.x / this.state.viewWidth;
    const indexLatest = this.state.indexLatest;

    this.setState({
      indexLatest: indexNew,
      offset: offset,
    }, () => {
      if (this.props.onSwitching) {
        this.props.onSwitching(indexNew, 'end');
      }

      if (this.props.onChangeIndex && indexNew !== indexLatest) {
        this.props.onChangeIndex(indexNew, indexLatest);
      }
    });
  };

  handlePageSelected = (event) => {
    const indexLatest = this.state.indexLatest;
    const indexNew = event.nativeEvent.position;

    this.setState({
      indexLatest: indexNew,
    }, () => {
      if (this.props.onSwitching) {
        this.props.onSwitching(indexNew, 'end');
      }

      if (this.props.onChangeIndex && indexNew !== indexLatest) {
        this.props.onChangeIndex(indexNew, indexLatest);
      }
    });
  };

  handlePageScroll = (event) => {
    if (this.props.onSwitching) {
      this.props.onSwitching(event.nativeEvent.offset + event.nativeEvent.position, 'move');
    }
  };

  handleLayout = (event) => {
    const {
      width,
    } = event.nativeEvent.layout;

    if (width) {
      this.setState({
        viewWidth: width,
        offset: {
          x: this.state.indexLatest * width,
        },
      });
    }
  };

  render() {
    const {
      resistance,
      children,
      slideStyle,
      style,
      containerStyle,
      disabled,
      ...other,
    } = this.props;

    const {
      viewWidth,
      indexLatest,
      offset,
    } = this.state;

    const slideStyleObj = [
      styles.slide,
      {
        width: viewWidth,
      },
      slideStyle,
    ];

    const childrenToRender = React.Children.map(children, (element, index) => {
      if (disabled && indexLatest !== index) {
        return null;
      }

      return (
        <View style={slideStyleObj}>
          {element}
        </View>
      );
    });

    return (
      <View
        onLayout={this.handleLayout}
        style={[
          styles.root,
          style,
        ]}
      >
        {(Platform.OS === 'ios') ? (
          <ScrollView
            {...other}
            ref="scrollView"
            style={[styles.container, containerStyle]}
            horizontal={true}
            pagingEnabled={true}
            scrollsToTop={false}
            bounces={resistance}
            onScroll={this.handleScroll}
            scrollEventThrottle={200}
            showsHorizontalScrollIndicator={false}
            contentOffset={offset}
            onMomentumScrollEnd={this.handleMomentumScrollEnd}
          >
            {childrenToRender}
          </ScrollView>
        ) : (
          <ViewPagerAndroid
            {...other}
            ref="scrollView"
            style={[styles.container, containerStyle]}
            initialPage={indexLatest}
            onPageSelected={this.handlePageSelected}
            onPageScroll={this.handlePageScroll}
          >
            {childrenToRender}
          </ViewPagerAndroid>
        )}
      </View>
    );
  }
}

export default SwipeableViews;

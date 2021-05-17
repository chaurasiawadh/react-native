import React, { Component, useEffect, useRef, useState } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import Swiper from "./package/pack";
// import Video from "@lnormanha/react-native-web-video";
import GestureRecognizer, { swipeDirections } from "./package/Gester";
import Video from "./videoPack";
const apiURL = "https://stage.teasit.com/api/for-you?perPage=3";

const styles = StyleSheet.create({
  wrapper: {},
  slider: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

const { width, height } = Dimensions.get("window");

const SwiperComponent = () => {
  const scrollRef = useRef();
  const heightValue = useRef(height);
  const [index, setIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [paginationVideo, setPaginationVideo] = useState({
    next: "",
    previous: "",
  });

  const pan = useRef(new Animated.ValueXY()).current;
  const [y, setY] = useState(0);

  let heightCheck = 0;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      // onPanResponderMove: Animated.event(
      //   [
      //     null,
      //     { dx: pan.x, dy: pan.y }
      //   ]
      // ),
      onPanResponderMove: (e, h) => {
        // console.log('h-dy', h.dy);
        // console.log('moveY', h.moveY);
        // console.log('y0', h.y0);
        if (0 > h.dy) {
          // console.log('yese');
        }
        const isDirection = heightCheck < h.moveY ? true : false;
        setY((pre) => {
          const diff = height - h.moveY;
          if (diff > 550) {
            scrollRef.current.scrollTo(1);
            return pre;
          }
          heightCheck = h.moveY;
          return isDirection ? pre + 10 : pre - 10;
        });
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  const onIndexChanged = (i) => {
    console.log("Page: ", i);
    setIndex(i);
    if (i === videoList.length - 1) {
      apiCall("next", paginationVideo.next);
    }
  };

  // console.log("Y===", y);

  useEffect(() => {
    apiCall();
  }, []);

  const apiCall = (type = "", value = "") => {
    console.log("api call");
    fetch(`${apiURL}&${type}=${value}`)
      .then((res) => res.json())
      .then((result) => {
        if (result && result.posts && result.posts.length) {
          setVideoList((previous) => [...previous, ...result.posts]);
          setPaginationVideo({ next: result.next, previous: result.previous });
        }
      })
      .catch(() => {
        // setVideoList((previous) => [...previous, ...vi]);
      });
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  const onCustomDrag = (e, i) => {
    setIndex(i);
    console.log(i, "cccccc", e);
    if (i === videoList.length - 2) {
      apiCall("next", paginationVideo.next);
    }
  };

  // console.log('videoList', videoList);
  return (
    <View style={{ height: height - 4, marginTop: 4 }}>
      <Swiper
        style={{
          ...styles.wrapper,
          // transform: [{ translateX: 0 }, { translateY: y }],
        }}
        horizontal={false}
        showsPagination={false}
        onIndexChanged={onIndexChanged}
        loop={false}
        bounces={true}
        // scrollEnabled={false}
        ref={scrollRef}
      >
        {videoList &&
          videoList.length > 0 &&
          videoList.map((item, i) => (
            <Animated.View
              // {...panResponder.panHandlers}
              key={i}
              style={styles.slider}
            >
              {/* <GestureRecognizer
                onCustomDrag={(e) => onCustomDrag(e, i)}
                // config={config}
                style={{
                  flex: 1
                }}
              > */}
                {/* <Text style={{backgroundColor:'red', flex:1}}>AAAAAAAAAA{item.id}</Text> */}
                {i === index || i === index - 1 || i === index + 1 ?  (
                <Video
                  source={{
                    uri: item.media.teaser,
                  }}
                  // style={{ width, height }}
                  style={{
                    position: "inherit",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    overflow: "hidden",
                    backgroundVideo:'green'
                  }}
                  resizeMode="cover"
                  poster={item.media.teaserThumb}
                  // controls={true}
                  // muted={true}
                  muted={index === i ? false : true}
                  // controls={true}
                  // autoPlay={index - 1 === i ? true : false}
                  autoPlay={true}
                  // paused={index === i ? false : true}
                />
                ) : null}
              {/* </GestureRecognizer> */}
            </Animated.View>
          ))}
      </Swiper>
    </View>
  );
};

export default SwiperComponent;

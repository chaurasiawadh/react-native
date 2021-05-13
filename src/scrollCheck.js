import React, { Component, useEffect, useRef, useState } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
} from "react-native";

import Swiper from "./package/pack";
import Video from "./videoPack";
import GestureRecognizer, {swipeDirections} from './package/Gester';
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
  const heightValue = useRef(0);
  const [index, setIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [paginationVideo, setPaginationVideo] = useState({
    next: "",
    previous: "",
  });
  const [y, setY] = useState(0);

  const onIndexChanged = (i) => {
    console.log('Page: ', i)
    setIndex(i);
    if (i === videoList.length - 2) {
      apiCall("next", paginationVideo.next);
    }
  };

  useEffect(() => {
    apiCall();
  }, []);

  const apiCall = (type = "", value = "") => {
    console.log('api call');
    fetch(`${apiURL}&${type}=${value}`)
      .then((res) => res.json())
      .then((result) => {
        if (result && result.posts && result.posts.length) {
          setVideoList((previous) => [...previous, ...result.posts]);
          setPaginationVideo({ next: result.next, previous: result.previous });
        }
      });
  };

  const onCustomDrag = (evt, e, gestureName) => {
    console.log('gestureName', gestureName);
    const {SWIPE_UP, SWIPE_DOWN} = swipeDirections;
    switch (gestureName) {
      case SWIPE_UP:
        console.log('-', evt.nativeEvent.touches.length === 1)
        // ye change krna hai
        setY(pre => {
          const diff = height - e.moveY
          if(diff > 550) {
            scrollRef.current.scrollTo(1)
            return pre 
          }
          return pre - 6
        })
        break;
      case SWIPE_DOWN:
        // and ye change krna hai
        setY(0)
        scrollRef.current.scrollTo(-1)
        break;
    }
  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
  };

  return (
    <View style={{ height: height - 10, marginTop: 10 }}>
      <Swiper
        style={{
          ...styles.wrapper,
          transform: [{ translateX: 0 }, { translateY: y }]
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
            <View key={i} style={styles.slider}>
              <GestureRecognizer
              onCustomDrag={onCustomDrag}
                // onSwipe={(direction, state) => onSwipe(direction, state)}
                // onSwipeUp={(state) => {
                //   scrollRef.current.scrollBy(1)
                //   console.log("up", state);
                // }}
                // onSwipeDown={(state) => {
                //   scrollRef.current.scrollBy(-1)
                //   console.log("down", state);
                // }}
                config={config}
                style={{
                  flex: 1,
                  // backgroundColor: 'yellow',
                }}
              >
              <Text style={{fontSize:40,backgroundColor:'red'}}>INDEX=={i}</Text>
                {(i === index || i === index - 1 || i === index + 1) ? <Video
                source={{
                  uri: item.media.src,
                }}
                // style={{ width, height }}
                style={{    
                  position: 'inherit',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  overflow: 'hidden'
                }}
                resizeMode="cover"
                poster={item.media.thumb}
                muted={index === i ? false : true}
                // controls={true}
                // autoPlay={index - 1 === i ? true : false}
                autoPlay={true}
                // paused={index === i ? false : true}
              /> : null}
               </GestureRecognizer>
              
            </View>
          ))}
      </Swiper>
    </View>
  );
};

export default SwiperComponent;
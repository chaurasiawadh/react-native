import React, { Component, useEffect, useRef, useState } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import Img1 from "./image/cartoon_1.jpeg";
import Img2 from "./image/cartoon_2.png";
import Img3 from "./image/cartoon_3.png";
import Img4 from "./image/cartoon_4.png";
import Img5 from "./image/cartoon_5.jpeg";
import Img6 from "./image/cartoon_6.jpg";

import Swiper from "./package/pack";
// import Video from "@lnormanha/react-native-web-video";
import Video from "./videoPack";
import Vid1 from "./image/1.mp4";
import Vid2 from "./image/2.mpg";
import Vid3 from "./image/3.webm";
import ScrollCheck from "./scrollCheck";
import GestureRecognizer, { swipeDirections } from "./package/Gester";
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
  const [index, setIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [paginationVideo, setPaginationVideo] = useState({
    next: "",
    previous: "",
  });

  const onIndexChanged = (i) => {
    scollCheck(i);
    setIndex(i);
    if (i === videoList.length - 1) {
      apiCall("next", paginationVideo.next);
    }
  };

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
      });
  };
  console.log("videoList", videoList);

  const scollCheck = (ind) => {
    console.log("index", ind);
    const isToggle = ind;
  };

  const onSwipe = (gestureName, gestureState) => {
    console.log("xxxxxxxx");
    const { SWIPE_UP, SWIPE_DOWN } = swipeDirections;

    switch (gestureName) {
      case SWIPE_UP:
        // this.setState({backgroundColor: 'red'});
        console.log("up");
        scrollRef.current.updateIndex({}, "y", 1);
        console.log("xccccccccc", scrollRef.current);
        break;
      case SWIPE_DOWN:
        // this.setState({backgroundColor: 'green'});
        break;
    }
  };

  // return <ScrollCheck/>
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  return videoList &&
  videoList.length > 0 ? (
    // <View style={{ height: height - 10, marginTop: 10 }}>
    <ImageBackground
      style={{ flex: 1 }}
      // source={require("./image/cartoon_1.jpeg")}
      source={videoList[index].media.thumb}
      blurRadius={30}
    >
      <Swiper
        style={styles.wrapper}
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
                // onSwipe={(direction, state) => onSwipe(direction, state)}
                // onSwipeUp={(state) => {
                //   console.log("state", state);
                // }}
                // onSwipeDown={(state) => {
                //   console.log("state", state);
                // }}
                // config={config}
                style={{
                  flex: 1,
                }}
              >
                {/* <Text style={{ backgroundColor: "green", paddingLeft: 140 }}>
                  {i} === {index}{" "}
                </Text> */}
                {/* {i === index || i === index - 1 || i === index + 1 ?  */}
                {true ? 
                (
                  <Video
                    source={{
                      uri: item.media.src,
                    }}
                    // style={{ width, height }}
                    style={{
                      position: "inherit",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      overflow: "hidden",
                      height: "-webkit-fill-available",
                    }}
                    resizeMode="cover"
                    poster={item.media.thumb}
                    muted={index === i ? false : true}
                    // controls={true}
                    // autoPlay={index - 1 === i ? true : false}
                    autoPlay={i === index ? true : false}
                    paused={index === i ? false : true}
                    onLoadStart={() => {
                      console.log('...I am loading...')
                  }}
                  onLoadedData={() => {
                      console.log('Data is loaded!')
                  }}
                  onLoad={() => console.log('onLoad')}
                  />
                ) : null}
              </GestureRecognizer>
            </View>
          ))}
      </Swiper>
    </ImageBackground>
  ): 
  <View>

  </View>
};

export default SwiperComponent;

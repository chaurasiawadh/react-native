import React, { Component, useEffect, useState } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
} from "react-native";
import Img1 from "./image/cartoon_1.jpeg";
import Img2 from "./image/cartoon_2.png";
import Img3 from "./image/cartoon_3.png";
import Img4 from "./image/cartoon_4.png";
import Img5 from "./image/cartoon_5.jpeg";
import Img6 from "./image/cartoon_6.jpg";

import Swiper from "./pack";
// import Video from "@lnormanha/react-native-web-video";
import Video from "./videoPack";
import Vid1 from "./image/1.mp4";
import Vid2 from "./image/2.mpg";
import Vid3 from "./image/3.webm";
const apiURL = "https://stage.teasit.com/api/for-you?perPage=3";

const styles = StyleSheet.create({
  wrapper: {},
  slider: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB",
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
  const [index, setIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [paginationVideo, setPaginationVideo] = useState({next:'', previous:''})

  const loadStart = (event) => {
    // console.log('loadStart', event);
  };
  const setDuration = (event) => {
    // console.log('setDuration', event);
  };
  const setTime = (event) => {
    // console.log('setTime', event);
  };
  const onEnd = (event) => {
    // console.log('onEnd', event);
  };
  const videoError = (event) => {
    // console.log('videoError', event);
  };
  const onBuffer = (event) => {
    // console.log('onBuffer', event);
  };
  const onTimedMetadata = (event) => {
    // console.log('onTimedMetadata', event);
  };

  const onIndexChanged = (i) => {
    setIndex(i);
    if (i === videoList.length - 2) {
      apiCall('next', paginationVideo.next);
    }
  };

  useEffect(() => {
    apiCall();
  }, []);

  const apiCall = (type = '', value = '') => {
    fetch(`${apiURL}&${type}=${value}`)
      .then((res) => res.json())
      .then((result) => {
        if (result && result.posts && result.posts.length) {
          setVideoList(previous => [...previous, ...result.posts]);
          setPaginationVideo({next:result.next, previous: result.previous})
        }
      });
  };
  console.log("videoList", videoList);

  return (
    <View
      style={{ height: height - 10, marginTop: 10, backgroundColor: "red" }}
    >
      <Swiper
        style={styles.wrapper}
        horizontal={false}
        showsPagination={false}
        onIndexChanged={onIndexChanged}
        loop={false}
        bounces={true}
      >
        {videoList &&
          videoList.length > 0 &&
          videoList.map((item, i) => (
            <View key={i} style={styles.slider}>
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
                resizeMode="contain"
                onLoadStart={loadStart}
                onLoad={setDuration}
                onProgress={setTime}
                onEnd={onEnd}
                onError={videoError}
                onBuffer={onBuffer}
                onTimedMetadata={onTimedMetadata}
                poster={item.media.thumb}
                muted={index === i ? false : true}
                // controls={true}
                // autoPlay={index - 1 === i ? true : false}
                autoPlay={true}
                // paused={index === i ? false : true}
              /> : null}
            </View>
            // :
            //     <View>
            //       {/* <Text style={{fontSize:100}}>{index}-Loading-{i}</Text> */}
            //       {/* <Image source={{uri: item.media.thumb}} style={{ width, height }}/> */}
            //     </View>
          ))}

        {/* <View style={[styles.slider, { backgroundColor: "green" }]}>
          {index === 2 ? (
            <Video
              source={{ uri: Vid3 }}
              style={{ width, height }}
              controls={true}
              resizeMode="cover"
              autoPlay={true}
              // repeat={true}
              // audioOnly={true}
              // playInBackground={false}
              // playWhenInactive={false}
            />
          ) : (
            <View></View>
          )}
        </View>
        <View style={styles.slider}>
          {index === 3 ? (
            <Video
              source={{ uri: Vid1 }}
              style={{ width, height }}
              // controls={true}
              resizeMode="cover"
              // repeat={true}
              // audioOnly={true}
              // playInBackground={false}
              // playWhenInactive={false}
              autoPlay={true}
            />
          ) : (
            <View></View>
          )}
        </View>
        <View style={styles.slider}>
          {index === 4 ? (
            <Video
              source={{ uri: Vid3 }}
              style={{ width, height }}
              // controls={true}
              resizeMode="cover"
              // repeat={true}
              // audioOnly={true}
              autoPlay={true}
              // playInBackground={false}
              // playWhenInactive={false}
            />
          ) : (
            <View></View>
          )}
        </View>
        
         */}

        {/* <View style={styles.slider}>
          <Image style={{ height: height - 10, width }} source={Img6} />
        </View> */}
      </Swiper>
    </View>
  );
};

export default SwiperComponent;

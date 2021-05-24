import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Img4 from "./image/cartoon_4.png";
import Swiper from "./package/pack";
import Video from "./videoPack";
import ShowMoreText from "./package/readMoreLess/ShowMoreText";
const apiURL = "https://stage.teasit.com/api/for-you?perPage=3";

const { width, height } = Dimensions.get("window");

const SwiperComponent = () => {
  const [index, setIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [paginationVideo, setPaginationVideo] = useState({
    next: "",
    previous: "",
  });

  const onIndexChanged = (i) => {
    // scollCheck(i)
    setIndex(i);
    if (i === videoList.length - 1) {
      apiCall("next", paginationVideo.next);
    }
  };

  useEffect(() => {
    apiCall();
  }, []);

  const apiCall = (type = "", value = "") => {
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

  const [textShown, setTextShown] = useState(false);
  const [lengthMore, setLengthMore] = useState(false);
  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };
  const onTextLayout = useCallback((e) => {
    console.log("e.nativeEvent.lines.length", e.nativeEvent.lines.length);
    setLengthMore(e.nativeEvent.lines.length >= 4);
  }, []);

  console.log(lengthMore, "textShown", textShown);

  return (
    <View style={{ height: height - 1, marginTop: 1 }}>
      <Swiper
        style={[styles.wrapper,{scrollSnapType: 'y mandatory'}]}
        horizontal={false}
        showsPagination={false}
        onIndexChanged={onIndexChanged}
        loop={false}
        bounces={true}
        // scrollEnabled={false}

      >
        {videoList &&
          videoList.length > 0 &&
          videoList.map((item, i) => (
            <View key={i} style={[styles.slider,{scrollSnapAlign: 'start',
            scrollSnapStop: 'always'}]}>
              {(i === index || i === index - 1 || i === index + 1) && item.media.src ? (
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
                  }}
                  resizeMode="cover"
                  poster={item.media.teaserThumb}
                  muted={true}
                  // muted={index === i ? false : true}
                  // controls={true}
                  // autoPlay={index - 1 === i ? true : false}
                  autoPlay={true}
                  // paused={index === i ? false : true}
                />
              ) : null}

              <View style={styles.container}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignSelf: "center",
                  }}
                >
                  <Text style={{backgroundColor:'red', fontSize:40}}>{index}</Text>
                  <Text style={styles.follow}>Following</Text>
                  <Text style={[styles.follow, styles.forU]}>For You</Text>
                </View>
                <View
                  style={{
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      paddingLeft: 10,
                    }}
                  >
                    <TouchableOpacity>
                      <Image
                        source={{ uri: item.creator.image || Img4 }}
                        style={styles.userIcon}
                      />
                    </TouchableOpacity>
                    <Text
                      style={{ fontWeight: 500, fontSize: 16, color: "#fff" }}
                    >
                      {item.creator.name}
                    </Text>
                    <TouchableOpacity>
                      <Text
                        style={{
                          marginLeft: 10,
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#fff",
                        }}
                      >
                        Follow
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ padding: 6, paddingLeft:14 }}>
                    <ShowMoreText
                      lines={1}
                      expanded={false}
                      width={220}
                    >
                      {item.caption}
                    </ShowMoreText>
                  </View>
                  <View style={{display:'flex', flexDirection:'row', marginBottom:8}}>
                  <Image source={require('./svg/heart.svg')} style={styles.svgIcon} />
                  <Image source={require('./svg/comment.svg')} style={styles.svgIcon} />
                  <Image source={require('./svg/share.svg')} style={styles.svgIcon} />
                  <Image source={require('./svg/dollar.png')} style={styles.svgIcon} />

                  </View>

                  <View>
                    <View
                      style={{ backgroundColor: "#000", height: 50 }}
                    ></View>
                  </View>
                </View>
              </View>
            </View>
          ))}
      </Swiper>
    </View>
  );
};

export default SwiperComponent;

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
  follow: {
    color: "#fff",
    textTransform: "capitalize",
    height: 14,
  },
  forU: {
    marginLeft: 8,
    fontWeight: 700,
    textDecorationLine: "underline",
  },
  container: {
    position: "absolute",
    display: "flex",
    justifyContent: "space-between",
    height,
    width,
  },
  userIcon: {
    height: 32,
    width: 32,
    borderRadius: 100,
    marginRight: 10,
    borderColor: "#fff",
    borderWidth: 1,
  },
  svgIcon: {
    height:24, width:24, marginLeft: 10
  }
});

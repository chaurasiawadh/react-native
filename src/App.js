import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View, Image, Dimensions } from "react-native";
import Img1 from './image/cartoon_1.jpeg';
import Img2 from './image/cartoon_2.png';
import Img3 from './image/cartoon_3.png';
import Img4 from './image/cartoon_4.png';
import Img5 from './image/cartoon_5.jpeg';
import Img6 from './image/cartoon_6.jpg';

import Swiper from "./pack";

const styles = StyleSheet.create({
  wrapper: {},
  slider: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB"
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold"
  }
});

const {width, height} = Dimensions.get("window");

export default class SwiperComponent extends Component {
  render() {
    return (
      <Swiper style={styles.wrapper} horizontal={false} showsPagination={false}>
        <View style={styles.slider}>
          {/* <Text style={styles.text}>Hello Swiper</Text> */}
          <Image style={{height, width}} source={Img1} />
        </View>
        <View style={styles.slider}>
          <Image style={{height, width}} source={Img5} />
        </View>
        <View style={styles.slider}>
          <Image style={{height, width}} source={Img6} />
        </View>
        <View style={styles.slider}>
          <Image style={{height, width}} source={Img6} />
        </View>
        <View style={styles.slider}>
          <Image style={{height, width}} source={Img6} />
        </View>
      </Swiper>
    );
  }
}

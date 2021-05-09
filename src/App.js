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
      <View style={{height:height-10, marginTop:10}}>
        <Swiper style={styles.wrapper} horizontal={false} showsPagination={false}>
        <View style={styles.slider}>
          {/* <Text style={styles.text}>1</Text> */}
          <Image style={{height: height-10, width}} source={Img1} />
        </View>
        <View style={styles.slider}>
          {/* <Text style={styles.text}>2</Text> */}
          <Image style={{height: height-10, width}} source={Img5} />
        </View>
        <View style={styles.slider}>
          {/* <Text style={styles.text}>3</Text> */}
          <Image style={{height: height-10, width}} source={Img4} />
        </View>
        <View style={styles.slider}>
          {/* <Text style={styles.text}>4</Text> */}
          <Image style={{height: height-10, width}} source={Img3} />
        </View>
        <View style={styles.slider}>
          {/* <Text style={styles.text}>5</Text> */}
          <Image style={{height: height-10, width}} source={Img6} />
        </View>
      </Swiper>
      </View>
    );
  }
}

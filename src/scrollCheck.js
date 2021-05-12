import React from "react";
import { ViewPagerAndroidBase, Text, View } from "react-native";

const ScrollCheck = () => {
  return (
    <ViewPagerAndroidBase style={{ flex: 1 }}>
    <View style={{ backgroundColor: "red" }}>
      <Text>Awadhesh</Text>
    </View>
      <View style={{ backgroundColor: "green" }}>
        <Text>Awadhesh</Text>
      </View>
      <View style={{ backgroundColor: "yellow" }}>
        <Text>Awadhesh</Text>
      </View>
    </ViewPagerAndroidBase>
  );
};
export default ScrollCheck;

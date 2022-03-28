import React, { Component, useState} from "react";
import {Text, StyleSheet} from "react-native";
import '../App.css';

const styles = StyleSheet.create({
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});

export default class Topic extends Component {
  constructor(props) {
      super(props);
      this.titleText = "Kommentarvorlage";
      this.bodyText = "Eine Art Kommentarvorlage weufnewcnwoen wef we[oifw[oeifh weoifhwe[oihf ewo[ihf[wiehf [waoncfaw[docnw[ aof awiof iej afiewjf'oiawenf'cns d'lcm iwej f wlvaeldvb lhbrlf blahblfaerbf lhbdf lhb habhr ]]]]]]]]";
      this.state = {
          text: ''
      };
  }



  render() {
    return (
      <div className="topic-frame">
      <Text style={styles.titleText}>{this.titleText}</Text>
      {"\n"}
      <Text numberOfLines={5}>{this.bodyText}</Text>
      </div>
    );
  }
}

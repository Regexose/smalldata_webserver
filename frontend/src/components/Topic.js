import React, { Component} from "react";
import {Text, StyleSheet} from "react-native";
import '../App.css';

const styles = StyleSheet.create({
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});

export default class Topic extends Component {
  render() {
    return (
      <div className="topic-frame">
      <Text numberOfLines={5}>{this.props.currentTopic.text}</Text>
      </div>
    );
  }
}

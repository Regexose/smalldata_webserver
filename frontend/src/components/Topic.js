import React, { Component} from "react";
import {Text, StyleSheet} from "react-native";
import '../App.css';


export default class Topic extends Component {
  render() {
    return (
        <div className="topic-frame">
          <Text style={{fontWeight: 700}}>{this.props.currentTopic.text}</Text>
      </div>
    );
  }
}

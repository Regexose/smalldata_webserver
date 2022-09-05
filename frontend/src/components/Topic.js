import React, { Component} from "react";
import {Text, StyleSheet} from "react-native";
import '../App.css';
import '../responsive.css';

export default class Topic extends Component {
  render() {
    return (
        <div className="topic-frame">
          <Text style={{fontWeight: 700, textFont: 'DM Sans', fontSize: "18px", letterSpacing: "0.03em", fontStyle: "normal"}}>{this.props.currentTopic.text}</Text>
      </div>
    );
  }
}

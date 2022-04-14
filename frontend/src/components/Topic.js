import React, { Component} from "react";
import {Text, StyleSheet} from "react-native";
import '../App.css';


export default class Topic extends Component {
  render() {
    return (
      <div className="all-but-input">
        <div className="topic-frame">
          <div className="topic-header">
          <Text style={{color: "#3237AB"}}>Kommentarvorlage</Text>
          </div>
          {"\n"}
          <Text style={{fontWeight: 700}}>{this.props.currentTopic.text}</Text>
        </div>
      </div>
    );
  }
}

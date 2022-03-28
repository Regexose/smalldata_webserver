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
      this.state = {
          text: ""
      };
  }

  componentDidMount(): void {
      fetch("/api/topics/get_current", {
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
      }).then(response => {
          (response.json().then(
            data => this.setState({text: data.text})
          ))
      });
  }

  render() {
    return (
      <div className="topic-frame">
      <Text style={styles.titleText}>{this.titleText}</Text>
      {"\n"}
      <Text numberOfLines={5}>{this.state.text}</Text>
      </div>
    );
  }
}

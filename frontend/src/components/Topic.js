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
  constructor(props) {
      super(props);
      this.titleText = "Kommentarvorlage";
      this.state = {
          text: "",
          ws: null
      };
  }

  timeout = 250; // Initial timeout duration as a class variable

  componentDidMount(): void {
    this.connect();
    fetch("http://localhost:8000/api/topics/get_current", {
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

  /**
   * @function connect
   * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
   */
  connect = () => {
      var ws = new WebSocket("ws://localhost:8000/ws/topics");
      let that = this; // cache the this
      var connectInterval;

      // websocket onopen event listener
      ws.onopen = () => {
          console.log("connected websocket main component");

          this.setState({ ws: ws });

          that.timeout = 250; // reset timer to 250 on open of websocket connection
          clearTimeout(connectInterval); // clear Interval on on open of websocket connection
      };

      // websocket onclose event listener
      ws.onclose = e => {
          console.log(
              `Socket is closed. Reconnect will be attempted in ${Math.min(
                  10000 / 1000,
                  (that.timeout + that.timeout) / 1000
              )} second.`,
              e.reason
          );

          that.timeout = that.timeout + that.timeout; //increment retry interval
          connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
      };

      // websocket onerror event listener
      ws.onerror = err => {
          console.error(
              "Socket encountered error: ",
              err.message,
              "Closing socket"
          );

          ws.close();
      };

      // websocket onmessage event listener
      ws.onmessage = event => {
        let content = JSON.parse(event["data"]);
        if (content.type === 'confirmation') {
          console.log(content.body);
        } else if (content.type === 'topic') {
          this.setState({text: content.body.text})
        }
      };
  };

  /**
   * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
   */
  check = () => {
      const { ws } = this.state;
      if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
  };

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

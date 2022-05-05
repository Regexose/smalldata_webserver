// frontend/src/App.js

import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Main from './components/Main';
import TopicSelector from './components/TopicSelector';

export const http_url = process.env.REACT_APP_HTTP_URL;
export const ws_url = process.env.REACT_APP_WS_URL;

const ColoredLine = ({ color }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: 2
        }}
    />
);

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ws: null,
            currentTopic: {text: 'noch leer'},
            newUtterance: ""
        };
    }

    componentDidMount(): void {
      this.connect();
      fetch(http_url + "topics/get_current", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(response => {
            (response.json().then(
              data => this.setState({currentTopic: data})
            ))
        });
    }

    timeout = 250; // Initial timeout duration as a class variable

    /**
     * @function connect
     * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
     */
    connect = () => {
      var ws = new WebSocket(ws_url);
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
          this.setState({currentTopic: content.body})
        } else if (content.type === 'utterance') {
          console.log('new utterance received')
          this.setState({newUtterance: content.body})
        }
      };
    };

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        const { ws } = this.state;
        if (!ws || ws.readyState === WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };


    render() {
        return (
          <Router>
          <Routes>
            <Route path="/" element={
              <Main currentTopic={this.state.currentTopic} newUtterance={this.state.newUtterance}/>} />
            <Route path="/set-topic" element={<TopicSelector />} />

            </Routes>
            </Router>
        );
      }
}

export default App;
 /*  line 28   <ColoredLine color="blue" />
                    <div>
                        <TriggerCategory/>
                    </div>
                    */

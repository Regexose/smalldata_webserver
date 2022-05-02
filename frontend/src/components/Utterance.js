import React, { Component } from "react";
// import ChatFeed from "react-chat-ui";/
import { Text } from "react-native";
import {
  MessageList,
  Input,
  Button,
} from "react-chat-elements";
import '../App.css';
import { http_url } from '../App.js'
import "react-chat-elements/dist/main.css";

const styles = {
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  messageList: {
    maxHeight: 300,
    overflowY: "scroll"
  }
};


export default class Utterance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownMessageId: 0,
      messages: [
      ],
      messageList: []
    };
  }

  styleMessage(senderId, text, category) {
    return {
      position: senderId === 0 ? "right" : "left",
      type: "text",
      theme: "white",
      view: "list",
      text: text,
      title: category,
      date: +new Date(),
      notch: false
    }
  }

  addMessage(senderId, text, category) {
    var list = this.state.messageList;
    const styledMsg = this.styleMessage(senderId, text, category)
    list.push(styledMsg);
    this.setState({
      messageList: list
    });
  }

  onMessageSubmit(e) {
    const input = e.target.value;
    e.preventDefault();
    if (!input) {
      return false;
    }

    e.target.value = ""; // TODO: move this to the success promise
    const msgId = Date.now();
    this.setState({ownMessageId: msgId})

    fetch(http_url + "utterances/", {
      method: "POST",
      body: JSON.stringify({text: input, msg_id: msgId}),
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    }).then(response => {
      (response.json().then(data => {
        const {text, category} = data
        this.addMessage(0, text, category.name);
      })
    )
    });

    return true;
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  // this is used to listen to changes in props
  componentDidUpdate(prevProps) {
    const {text, category, msgId, id} = this.props.newUtterance
    if (prevProps.newUtterance.id !== id && this.state.ownMessageId !== msgId){
      this.addMessage(1, text, category.name)
    }
    this.scrollToBottom();
  }

  render() {
    return (
      <div>
        <div className="right-panel utterance-wrapper">
        <div style={styles.messageList}>
          <MessageList
            className="message-list chat-history"
            lockable={true}
            downButtonBadge={10}
            dataSource={this.state.messageList}
          />
          <div style={{ float:"left", clear: "both" }}
            ref={(el) => { this.messagesEnd = el; }}>
          </div>
        </div>
        <Input
          placeholder="Bitte kommentieren..."
          defaultValue=""
          multiline={true}
          onKeyPress={e => {
            if (e.shiftKey && e.charCode === 13) {
              return true;
            }
            if (e.charCode === 13) {
              // this.refs.input.clear();
              this.onMessageSubmit(e);
              return false;
            }
          }}
          rightButtons={
            <Button text="Senden" onClick={this.onMessageSubmit.bind(this)} />
          }
          // buttonsFloat='left'
          />
        </div>

      </div>
    );
  }
}

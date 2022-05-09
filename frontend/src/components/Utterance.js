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


export default class Utterance extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
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
    e.preventDefault();
    const input = this.inputRef.current.value;
    if (!input) {
      return false;
    }

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
        this.addMessage(0, text, category.german_name);
        this.inputRef.current.value = "";
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
      this.addMessage(1, text, category.german_name)
    }
    this.scrollToBottom();
  }

  render() {
    return (
      <div>
        <div className="history-scroll-wrapper">
            <MessageList
              className="message-list chat-history"
              lockable={true}
              dataSource={this.state.messageList}
            />
            <div style={{ float:"left", clear: "both" }}
              ref={(el) => { this.messagesEnd = el; }}>
            </div>
        </div>
        <Input
          className="input-field"
          placeholder="Bitte kommentieren..."
          referance={this.inputRef}
          defaultValue=""
          multiline={true}
          onKeyPress={e => {
            if (e.shiftKey && e.charCode === 13) {
              return true;
            }
            if (e.charCode === 13) {
              this.onMessageSubmit(e);
              return false;
            }
          }}
          rightButtons={
            <Button className="submit-button" text="Senden" onClick={this.onMessageSubmit.bind(this)} />
          }
          />
      </div>
    );
  }
}

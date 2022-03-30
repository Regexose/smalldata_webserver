import React, { Component } from "react";
// import ChatFeed from "react-chat-ui";/
import {Text, StyleSheet} from "react-native";
import { ChatFeed, ChatBubble, BubbleGroup, Message } from "react-chat-ui";
import '../App.css';

const styles = {
  button: {
    backgroundColor: "#fff",
    borderColor: "#1D2129",
    borderStyle: "solid",
    borderRadius: 20,
    borderWidth: 2,
    color: "#1D2129",
    fontSize: 18,
    fontWeight: "300",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    outline: "none"
  },
  selected: {
    color: "#fff",
    backgroundColor: "#0084FF",
    borderColor: "#0084FF"
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
};

const users = {
  0: "You",
  1: "Das Volk"
};


export default class Utterance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [
        new Message({ id: 1, message: "Hier stehen die Kommentare", senderName: "Das Volk" }),
      ],

      curr_user: 0
    };
  }

  onMessageSubmit(e) {
    const input = this.message;
    e.preventDefault();
    if (!input.value) {
      return false;
    }

    fetch("http://127.0.0.1:8000/api/utterances/", {
      method: "POST",
      body: JSON.stringify({text: input.value}),
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    }).then(response => {
      (response.json().then(data => {
        let msg = data.text;
        let cat = data.category;
        this.pushMessage(this.state.curr_user, msg + " -- " + cat.name);
      }).then(val => this.resetForm()))
    });

    return true;
  }

  resetForm() {
    this.message.value = ""
  }

  pushMessage(recipient, message) {
    const prevState = this.state;
    const newMessage = new Message({
      id: recipient,
      message,
      senderName: users[recipient]
    });
    prevState.messages.push(newMessage);
    this.setState(this.state);
  }

  render() {
    return (
      <div>
      <div className="topic-frame">
        <Text style={styles.titleText}>Kommentarverlauf</Text>
      </div>
        <div className="chatfeed-wrapper">
          <ChatFeed
            maxHeight={250}
            messages={this.state.messages} // Boolean: list of message objects
            showSenderName
          />

          <form onSubmit={e => this.onMessageSubmit(e)}>
            <input
              ref={m => {
                this.message = m;
              }}
              placeholder="Bitte kommentieren..."
              className="message-input"
            />
          </form>
        </div>
      </div>
    );
  }
}

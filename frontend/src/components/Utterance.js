import React, { Component } from "react";
// import ChatFeed from "react-chat-ui";/
import { Text } from "react-native";
import { ChatFeed, Message } from "react-chat-ui";
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
      ownMessageId: 0,
      messages: [
      ],
    };
  }

  onMessageSubmit(e) {
    const input = this.message;
    const msgId = Date.now();
    this.setState({ownMessageId: msgId})

    e.preventDefault();
    if (!input.value) {
      return false;
    }

    fetch("http://127.0.0.1:8000/api/utterances/", {
      method: "POST",
      body: JSON.stringify({text: input.value, msg_id: msgId}),
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    }).then(response => {
      (response.json().then(data => {
        const {text, category} = data
        this.pushMessage(0, text + " -- " + category.name);
      }).then(val => {this.message.value = ""}))
    });

    return true;
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

  // this is used to listen to changes in props
  componentDidUpdate(prevProps) {
    const {text, category, msgId, id} = this.props.newUtterance
    if (prevProps.newUtterance.id !== id && this.state.ownMessageId !== msgId){
      this.pushMessage(1, text + " -- " + category.name)
    }
  }

  render() {
    return (
      <div>

        <div className="chatfeed-wrapper">
        <Text style={styles.titleText}>Kommentarverlauf </Text>
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

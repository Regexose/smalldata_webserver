import React, { Component } from "react";
// import ChatFeed from "react-chat-ui";/
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
    this.pushMessage(this.state.curr_user, input.value);
    input.value = "";
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

  render() {
    return (
      <div className="container">
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
              multiline
              numberOfLines={4}
              placeholder="Bitte kommentieren..."
              className="message-input"
            />
          </form>
        </div>
      </div>
    );
  }
}

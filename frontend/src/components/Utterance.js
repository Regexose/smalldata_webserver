import React, { Component } from "react";
import { Text } from "react-native";
import {
  MessageList,
  Input,
  Button,
} from "react-chat-elements";
import '../responsive.css';
import '../App.css';
import { http_url } from '../App.js'
import "../react-chat-elements.css";
import { injectIntl } from 'react-intl';

class Utterance extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      ownMessageId: 0,
      messages: [
      ],
      messageList: [],
      errorVisibility: "hidden",
      errorMessage: ""
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
    // REMOVE FIRST ELEMENT IN LIST TO FIX SCXROLLING BUG
    // when ading new utterances to messageList, the messagesEnd-Div is being
    // moved upwards. Once the messagesEnd-Div reaches the top of the
    // messageListContainer, the scrollToBottm does not have the desired effect.
    // Therefore, I remove old comments from the list if adding one more item
    // (which has the height of 80) would move the messagesEnd-div above the
    // messageListContainer
    if (this.messageListContainer.getBoundingClientRect().top + 80 >
        this.messagesEnd.getBoundingClientRect().top) {
       list.shift();
    }
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
      body: JSON.stringify({text: input, msg_id: msgId, language: this.props.intl.locale}),
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    }).then(response => {
      // check if received an OK response, throw error if not
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    }).then(data => {
        const {text, category} = data
        let cat = this.props.intl.formatMessage({ id: category.name})
        this.addMessage(0, text, cat);
        this.inputRef.current.value = "";
    }).catch(error => {
        if (error.message === "Bad Request") {
          this.setState({errorMessage: this.props.intl.formatMessage({ id: "app.wrong_language"})});
        } else {
           this.setState({errorMessage: error.message});
        }
        this.setState({errorVisibility: "visible"});
        setTimeout(() => {
         this.setState({errorVisibility: "hidden"});
        }, 2000);
    })

    return true;
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  // this is used to listen to changes in props
  componentDidUpdate(prevProps) {
    const {text, category, msgId, id} = this.props.newUtterance
    if (prevProps.newUtterance.id !== id && this.state.ownMessageId !== msgId){
      this.addMessage(1, text, this.props.intl.formatMessage({ id: category.name}))
    }
    this.scrollToBottom();
  }

  render() {
  const {intl} = this.props;
    return (
      <>
        <div className="history-scroll-wrapper"
            ref={(el) => { this.messageListContainer = el; }}>
            <MessageList
              lockable={true}
              dataSource={this.state.messageList}
            />
            <div style={{ float:"left", clear: "both" }}
              ref={(el) => { this.messagesEnd = el; }}>
            </div>
        </div>
        <div style={{color: "red", visibility: this.state.errorVisibility}}>
          {this.state.errorMessage}
        </div>

        <div className="input-area">
        <Input

          placeholder={intl.formatMessage({ id: "app.please_comment", defaultMessage: 'send'})}
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
            <Button className="submit-button"
                text={intl.formatMessage({ id: "app.send", defaultMessage: 'send'})}
                onClick={this.onMessageSubmit.bind(this)} />
          }
          />
        </div>
        </>
    );
  }
}

export default injectIntl(Utterance);

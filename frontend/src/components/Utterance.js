// frontend/src/components/Utterance.js

import React, { Component, useState} from "react";
import {Text, StyleSheet} from "react-native";
import fetch from "node-fetch";
import { Button} from 'react-bootstrap';
import { ToastContainer, toast, Slide } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import '../App.css';


const styles = StyleSheet.create({
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});

export default class Utterance extends Component {
    constructor(props) {
        super(props);
        this.titleText = "Kommentarvorlage";
        this.bodyText = "Eine Art Kommentarvorlage weufnewcnwoen wef we[oifw[oeifh weoifhwe[oihf ewo[ihf[wiehf [waoncfaw[docnw[ aof awiof iej afiewjf'oiawenf'cns d'lcm iwej f wlvaeldvb lhbrlf blahblfaerbf lhbdf lhb habhr ]]]]]]]]";
        this.utteranceRef = React.createRef();
        this.state = {
            text: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleSubmit(e) {
        e.preventDefault();
        if (this.state.text === "") {
            toast.error('Bitte einen Kommentar eingeben')
        } else {
            fetch("api/utterances/", {
                method: "POST",
                body: JSON.stringify(this.state),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }).then(response => {
                (response.json().then(data => {this.notify(data)
            }).then(val => this.resetForm()))
            });
        }
    }

    notify(data) {
        if (data['category'].name === 'unknown') {
            toast.info(<div>Die Meinungsorgel funktioniert nur mit richtigen Sätzen. <br />
                        Bitte versuche es noch einmal!</div>);
        } else {
            toast.success(<div>You said: {data['text']}
                    <br /> Machine thinks: {data['category']['name']} </div>);
        }
    }

    handleChange(event) {
        this.setState({text: event.target.value});
    }

    resetForm() {
        this.setState({text: ''});
    }

    // this focusses on the textarea after the alert-window is closed
    componentDidUpdate () {
      this.utteranceRef.current.focus();
    }

    // this focusses on the textarea after the page is reloaded
    componentDidMount () {
      this.utteranceRef.current.focus();
    }

    handleKeypress(e) {
      //it triggers by pressing the enter key
        if (e.key === "Enter") {
          this.handleSubmit(e);
        }
    };

    render() {
        return (
            <div className="row ">
            <div>
                <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    transition={Slide}
                    />
            </div>

            <div className="topic-frame">
            <Text style={styles.titleText}>{this.titleText}</Text>
            {"\n"}
            <Text numberOfLines={5}>{this.bodyText}</Text>
            </div>
                <form>
                    <label>
                        Schreibe hier Deinen Beitrag
                    </label>
                    <br/>
                    <textarea className="utterance-field"
                          ref={this.utteranceRef}
                          onChange={this.handleChange}
                          value={this.state.text}
                          onKeyPress={this.handleKeypress.bind(this)}
                    />
                    <br/>
                    <Button variant="outline-secondary"
                        onClick={this.handleSubmit}>
                        kommentieren</Button>
                </form>
                <p> </p>
            </div>
        );
    }
}

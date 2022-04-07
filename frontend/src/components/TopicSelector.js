import React, { Component } from "react";
import {Text, StyleSheet} from "react-native";
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import '../App.css';
import { http_url } from '../App.js'


const styles = StyleSheet.create({
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});

export default class TopicSelector extends Component {
  constructor(props) {
      super(props);
      this.titleText = "Ausgewählte Vorlage"
      this.state = {
          options: [],
          selectedOption: {text: "Nichts ausgewählt"},
          selected: false,
          submittedOption: {value: 0},
          buttonText: "Nichts ausgewählt"
      };

      this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch(http_url + "topics", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(response => {
        (response.json().then(
          data => this.populateOptions(data)
        ))
    }).then(
      fetch(http_url + "topics/get_current", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
      }).then(response => {
        (response.json().then(
          data => {
            let currentOption = {value: data.id, label: data.title, text: data.text};
            this.setState(
              {
                selectedOption: currentOption,
                submittedOption: currentOption,
                buttonText: "Ist öffentlich"
              });
            }
        ))
      })
    );
  }

  populateOptions(data) {
    var opts = []
    data.forEach((item, i) => {
      opts.push(
        {value: item.id, label: item.title, text: item.text}
      )
    });
    this.setState({options: opts});
  }

  handleChange = (selectedOption) => {
    if (selectedOption.value === this.state.submittedOption.value) {
      this.setState({
        selectedOption: selectedOption,
        selected: false,
        buttonText: "Ist öffentlich"
       });
    } else {
      this.setState({
        selectedOption: selectedOption,
        selected: true,
        buttonText: "Vorlage veröffentlichen"
       });

    }
  }

  handleSubmit(e) {
    e.preventDefault()
    let pk = this.state.selectedOption.value;
    fetch(http_url + "topics/" + pk + "/set_current/", {
      method: "POST",
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    }).then(response => {
      this.setState({
        submittedOption: this.state.selectedOption,
        selected: false,
        buttonText: "Ist öffentlich"
      });
    })
  }

  render() {
    const { selectedOption } = this.state;

    return (
      <main className="content ">
        <h1 className="text-black text-uppercase text-center my-4">Topic Select</h1>
        <div className="selector-frame mx-auto p-0">
          <Select
            className="basic-single"
            onChange={this.handleChange}
            options={this.state.options}
            autoFocus={true}/>
          <Text numberOfLines={5}>{this.state.selectedOption.text}</Text>
          <div className="text-right">
            <Button variant="primary"
              onClick={this.handleSubmit}
              disabled={!this.state.selected}>
              {this.state.buttonText}
            </Button>
          </div>
        </div>
      </main>
    );
  }
}

import React, { Component } from "react";
import {Text, StyleSheet} from "react-native";
import { Button } from 'react-bootstrap';
import Select from 'react-select';
import '../App.css';


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
      };

      this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch("/api/topics", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(response => {
        (response.json().then(
          data => this.populateOptions(data)
        ))
    });
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
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption.label);
  }

  handleSubmit(e) {
    e.preventDefault()
    let pk = this.state.selectedOption.value;
    fetch("/api/topics/" + pk + "/set_current/", {
      method: "POST",
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    })
  }

  render() {
    const { selectedOption } = this.state;

    return (
      <main className="content">
        <h1 className="text-black text-uppercase text-center my-4">Topic Select</h1>
        <div className="col-md-6 col-sm-10 mx-auto p-0">
          <div className="topic-frame">
            <Text style={styles.titleText}>{this.titleText}</Text>
            {"\n"}
            <Text numberOfLines={5}>{this.state.selectedOption.text}</Text>
          </div>

          <Select
          onChange={this.handleChange}
          options={this.state.options}
          autoFocus={true}/>

          <Button variant="primary"
              onClick={this.handleSubmit}>
              Vorlage veröffentlichen</Button>
        </div>
      </main>
    );
  }
}

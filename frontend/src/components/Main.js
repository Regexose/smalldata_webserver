import React, { Component} from "react";

import Topic from './Topic';
import Utterance from './Utterance';
import '../App.css';

export default class Main extends Component {
  render() {
    return (
      <main className="content">
      <h1 className="text-black text-uppercase text-center my-4">Small Data</h1>
        <div className="col-md-6 col-sm-10 mx-auto p-0">
          <div className="wrapper">
            <Topic currentTopic={this.props.currentTopic}/>
            <Utterance/>
          </div>
        </div>
      </main>
    );
  }
}

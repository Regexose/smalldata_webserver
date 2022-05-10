import React, { Component} from "react";

import Topic from './Topic';
import Utterance from './Utterance';
import '../App.css';

export default class Main extends Component {
  render() {
    return (
      <main className="main-frame">
      <h1 className="title text-center my-4">MeinungsOrgel</h1>
        <div className="content-frame">

            <Topic currentTopic={this.props.currentTopic}/>
            <Utterance newUtterance={this.props.newUtterance}/>

        </div>
      </main>
    );
  }
}

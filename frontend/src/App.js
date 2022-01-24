// frontend/src/App.js

import React, { Component } from "react";
import P5Wrapper from 'react-p5-wrapper';
import sketch from './components/sketch';
import Utterance from './components/Utterance';
import TriggerCategory from './components/TriggerCategory';



const ColoredLine = ({ color }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: 2
        }}
    />
);


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        };
    }

    render() {
        return (
            <main className="content">
                <h1 className="text-black text-uppercase text-center my-4">Small Data</h1>
                <div className="col-md-6 col-sm-10 mx-auto p-0">
                    <div className="wrapper">
                        <Utterance/>
                    </div>
                    <P5Wrapper sketch={sketch}></P5Wrapper>
                 </div>

            </main>
        );
    }
}

export default App;
 /*  line 28   <ColoredLine color="blue" />
                    <div>
                        <TriggerCategory/>
                    </div>
                    */
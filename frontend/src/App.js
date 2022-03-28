// frontend/src/App.js

import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Main from './components/Main';
import TopicSelector from './components/TopicSelector';


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
  render() {
        return (
          <Router>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/set-topic" element={<TopicSelector />} />

            </Routes>
            </Router>
        );
      }
}

export default App;
 /*  line 28   <ColoredLine color="blue" />
                    <div>
                        <TriggerCategory/>
                    </div>
                    */

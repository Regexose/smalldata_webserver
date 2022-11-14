// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';       // add this
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {IntlProvider} from 'react-intl';
import German from './lang/de.json';
import English from './lang/en.json';

const locale = navigator.language;
let messages = German;
if (locale.substring(0,2) === "en") {
    messages = English
} else if (locale.substring(0,2) !== "de") {
  console.log("Unknown language, using DE")
}


ReactDOM.render(
    <IntlProvider locale={locale} messages={messages}>
       <App />
   </IntlProvider>,
    document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
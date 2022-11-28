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
import Auto from './lang/auto.json';

let locale = process.env.REACT_APP_LANGUAGE;
if (locale === "auto") {
    locale = navigator.language.substring(0,2);
}
let messages = English;
if (locale === "de") {
    messages = German;
} else if (locale == "en") {
    console.log("using EN");
} else {
    console.log("Unknown language, using EN");
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
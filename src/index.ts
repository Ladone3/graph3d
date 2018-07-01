import { createElement } from 'react';
import * as ReactDOM from 'react-dom';
import { MainPage } from './mainPage';

require('../styles/main.scss');

const rootHtml = document.getElementById('rootHtml');

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(createElement(MainPage, {}), rootHtml);
});

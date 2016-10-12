/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Highlights from './Highlights';

export default class fastBreak extends Component {
  render() {
    return (
      <Highlights />
    );
  }
}

AppRegistry.registerComponent('fastBreak', () => fastBreak);

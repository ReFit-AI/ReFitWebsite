/**
 * @format
 */

import './global';
import { AppRegistry } from 'react-native';
import App from './App';
// import App from './AppMinimal'; // Using minimal version for testing
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

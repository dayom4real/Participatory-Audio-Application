/// Navigation.js
// Components/Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AudioRecorder from './AudioRecorder';
import ResultViewer from './ResultViewer';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AudioRecorder" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AudioRecorder" component={AudioRecorder} />
        <Stack.Screen name="ResultViewer" component={ResultViewer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar />
      <Text style={styles.welcomeMessage}>둘다 연동 된다이야 신기</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeMessage: {
    fontSize: 40,
  },
});

export default App;

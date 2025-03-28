import React, {useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import mqtt from 'sp-react-native-mqtt';
import { ADDRESS } from './constants';
import { ConnectMQTT, CreateNotificationChannel, DisconnectAllMQTT} from './mqtt/MQTT';


function App(): React.JSX.Element {
  const [isMQTTEnabled, setIsMQTTEnabled] = useState(false);
  const [MQTTMsg, setMQTTMsg] = useState('');
  const [MQTTLogs, setMQTTlogs] = useState<string[]>([]);
  const [channelId, setChannelId] = useState('');


  // remove this USE EFFECT in release.
  useEffect(() => {
    mqtt.disconnectAll();
    CreateNotificationChannel().then(
      (channelId)=>{
        setChannelId(channelId);
      }
    )
  }, []);

  useEffect(() => {
    mqtt.disconnectAll();
    if (isMQTTEnabled) {
      console.log('starting service');
      ConnectMQTT(setMQTTMsg, setMQTTlogs, setIsMQTTEnabled, channelId);
    }
    else{
      console.log('stop service');
      DisconnectAllMQTT();
    }
  }, [isMQTTEnabled]);



  const toggleSwitch = async () => {
    setIsMQTTEnabled(!isMQTTEnabled);  
  };

  


  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FBF8EF'}}>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.sectionContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.textStyle}>MQTT {'\n'}Notification</Text>
        </View>
        <View style={styles.switchContainer}>
          <Text style={{color: 'white'}}>{isMQTTEnabled ? 'ON' : 'OFF'}</Text>
          <Switch
            onValueChange={toggleSwitch}
            trackColor={{false: '#9fa0a6', true: 'white'}}
            thumbColor={isMQTTEnabled ? '#89AC46' : '#f4f3f4'}
            value={isMQTTEnabled}
          />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTextStyle}>Details ( {ADDRESS} ) :</Text>
          <FlatList
            style={{gap: 0, marginBottom: 30, paddingHorizontal: 20}}
            data={MQTTLogs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <Text style={{color: 'white'}}>-{item}</Text>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFA725',
    flex: 1,
  },
  statusBar: {
    backgroundColor: '#d47833',
  },
  textContainer: {
    marginTop: 8,
    fontSize: 18,
  },
  textStyle: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailsContainer: {
    marginTop: 10,
    flex: 1,
  },
  detailsTextStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;

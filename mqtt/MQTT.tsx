import React from 'react';
import mqtt from 'sp-react-native-mqtt';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {ADDRESS, PASS, TOPIC, USER} from '../constants';

export const ConnectMQTT = async (
  setMQTTMsg: React.Dispatch<React.SetStateAction<string>>,
  setMQTTlogs: React.Dispatch<React.SetStateAction<string[]>>,
  setIsMQTTEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  channelId: string
) => {
  mqtt
    .createClient({
      clientId: 'MyMQTTClient',
      uri: ADDRESS,
      user: USER,
      pass: PASS,
      auth: true,
      clean: false,
      keepalive: 60,
    })
    .then(client => {
      setMQTTlogs((prevMessages: string[]) => [
        ...prevMessages,
        `STATUS: wait..`,
      ]);

      client.on('closed', function (msg: string) {
        console.log('mqtt.event.closed');
        setMQTTlogs((prevMessages: string[]) => [
          ...prevMessages,
          `STATUS: ${msg}`,
        ]);
      });

      client.on('error', function (msg: string) {
        console.log('mqtt.event.error', msg);
        setMQTTlogs((prevMessages: string[]) => [
          ...prevMessages,
          `ERROR: ${msg}`,
        ]);
        setIsMQTTEnabled(false);
      });

      client.on(
        'message',
        function (msg: {topic: string; data: string; qos: number}) {
          console.log('mqtt.event.message', msg);
          if (msg.data) setMQTTMsg(msg.data);
          setMQTTlogs((prevMessages: string[]) => [
            ...prevMessages,
            `Topic: ${msg.topic} , Data: ${msg.data} , QOS: ${msg.qos}`,
          ]);
          onDisplayNotification(msg.data, channelId);
        },
      );

      client.on('connect', function () {
        console.log('connected');
        setMQTTlogs((prevMessages: string[]) => [
          ...prevMessages,
          `STATUS: connected`,
        ]);
        client.subscribe(TOPIC, 0);
      });

      client.connect();
    });
};

export const DisconnectAllMQTT = () => {
  mqtt.disconnectAll();
};

export const CreateNotificationChannel = async () => {
  // Request permissions (required for iOS)
  await notifee.requestPermission();
  console.log('showing notification');
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'myMQTTApp',
    name: 'myMQTTApp Channel',
    sound: 'alert',
    importance: AndroidImportance.HIGH,
  });

  return channelId;
};

async function onDisplayNotification(msg: string, channelId: string) {
  // Display a notification
  await notifee.displayNotification({
    title: 'Drawer Status',
    body: msg,
    android: {
      channelId,
      smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
      sound: 'alert',
      pressAction: {
        id: 'default',
      },
    },
  });
}

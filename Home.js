import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { BackHandler } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function HomeScreen({ navigation }) {
  const [devices, setDevices] = useState({
    unpaired: [],
    paired: [],
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleBackButton = () => {
    if (isModalVisible) {
      setIsModalVisible(false);
      return true; // Prevent default behavior (exit app)
    }
    return false; // Default behavior (exit app)
  };

  BackHandler.addEventListener('hardwareBackPress', handleBackButton);

  const cancelDiscovery = async () => {
    try {
      const cancelled = await RNBluetoothClassic.cancelDiscovery();
    } catch (error) {
      console.error('Error occurred while attempting to cancel discover devices', error);
    }
  };

  const isLegitDevice = (value) => {
    return !value['name'].includes(':');
  };


  const startScan = async () => {
    RNBluetoothClassic.requestBluetoothEnabled();
    await cancelDiscovery();
    const unpaired = await RNBluetoothClassic.startDiscovery();
    const filteredUnpaired = unpaired.filter(isLegitDevice);
    const paired = await RNBluetoothClassic.getBondedDevices();
    console.log('Scanning for devices...');

    setDevices({
      unpaired: filteredUnpaired,
      paired: paired,
    });

    setIsModalVisible(true);
  };

  const acceptConnections = async () => {
    try {
      console.log('Accepting connections');
      const device = await RNBluetoothClassic.accept({});
      console.log('Got connection');
      navigation.navigate("TicTacToe", {
        connected_device: device,
        start: false
      }); 
    } catch (error) {}
  };

  const connectToDevice = async (device) => {
    RNBluetoothClassic.pairDevice(device.address);
    let connection = await device.isConnected();
    console.log('Device is connected:', connection);
    if (!connection) {
      connection = await device.connect({
        CONNECTOR_TYPE: "rfcomm",
        DELIMITER: "\n",
        DEVICE_CHARSET: Platform.OS === "ios" ? 1536 : "utf-8",
      });
    }
    console.log('Device is connected:', connection);
    navigation.navigate("TicTacToe", {
      connected_device: device,
      start: true
    }); 
    setIsModalVisible(false);
  };

  const initiateBluetooth = async () => {
    startScan();
  };

  const handleAndroidPermissions = async () => {
    console.log('Asking for permissions');
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]).then((result) => {
        if (result) {
          console.debug('[handleAndroidPermissions] User accepts Bluetooth runtime permissions Android 12+');
        } else {
          console.error('[handleAndroidPermissions] User refuses Bluetooth runtime permissions Android 12+');
        }
      });
    }
    console.log('Asked for permissions');
    acceptConnections();
  };

  console.log('Initializing Bluetooth');
  handleAndroidPermissions();

  const goToGame = async () => {
    navigation.navigate('TicTacToe');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      <TouchableOpacity style={styles.button} onPress={initiateBluetooth}>
        <Text>Scan for devices</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={goToGame}>
        <Text>Go To Game</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select a Device</Text>
          <Text style={styles.subTitle}>Unpaired Devices</Text>
          <FlatList
            data={devices.unpaired}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceItem}
                onPress={() => connectToDevice(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Text style={styles.subTitle}>Paired Devices</Text>
          <FlatList
            data={devices.paired}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceItem}
                onPress={() => connectToDevice(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0', // Background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Text color
  },
  button: {
    backgroundColor: '#2980b9',
    padding: 10,
    marginVertical: 10,
    borderRadius: 20, // Make it rounder
    width: '80%',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  }
  // Add more styles for additional components as needed
});

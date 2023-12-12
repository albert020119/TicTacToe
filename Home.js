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
import BleManager from 'react-native-ble-manager';
import BluetoothSerial from 'react-native-bluetooth-serial'

export function HomeScreen() {
  const [devices, setDevices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const startScan = async () => {
    console.log("Before starting")
    BleManager.start({ showAlert: false }).then(() => {
      console.log("Module initialized");
    }).catch((error) => {
      console.log(error);
    });
    BleManager.enableBluetooth()
    .then(() => {
      console.log("The bluetooth is already enabled or the user confirm");
    })
    .catch((error) => {
      console.log("The user refuse to enable bluetooth");
    });

    BleManager.scan([], 5, true).then(() => {
      console.log("Scan started");
    });

    setTimeout(() => BleManager.getDiscoveredPeripherals([]).then((peripheralsArray) => {
      for (peripheral in peripheralsArray) {
        data = peripheralsArray[peripheral]["advertising"]
        console.log(data)
        if ("localName" in data){
          console.log(data["localName"])
        }
        setDevices(peripheralsArray);
        setIsModalVisible(true);
      }
    }), 5000)


    
  }

  const connectToDevice = (deviceId) => {
    console.log(`Connecting to device with ID: ${deviceId}`);
    BleManager.connect(deviceId)
      .then(() => {
        // Success code
        console.log("Connected");
      })
      .catch((error) => {
        // Failure code
        console.log(error);
      });
    setIsModalVisible(false);
  };

  const onBluetoothConnect = async () => {
    handleAndroidPermissions(); 
    startScan(); 
  };

  const handleAndroidPermissions = () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then(result => {
        if (result) {
          console.debug(
            '[handleAndroidPermissions] User accepts runtime permissions android 12+',
          );
        } else {
          console.error(
            '[handleAndroidPermissions] User refuses runtime permissions android 12+',
          );
        }
      });
    } else if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(checkResult => {
        if (checkResult) {
          console.debug(
            '[handleAndroidPermissions] runtime permission Android <12 already OK',
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(requestResult => {
            if (requestResult) {
              console.debug(
                '[handleAndroidPermissions] User accepts runtime permission android <12',
              );
            } else {
              console.error(
                '[handleAndroidPermissions] User refuses runtime permission android <12',
              );
            }
          });
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      <TouchableOpacity style={styles.button} onPress={startScan}>
        <Text>Connect with Bluetooth</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select a Device</Text>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceItem}
                onPress={() => connectToDevice(item.id)}
              >
                <Text>{item.name}</Text>
                <Text>{`RSSI: ${item.rssi}`}</Text>
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
  }
  // Add more styles for additional components as needed
});

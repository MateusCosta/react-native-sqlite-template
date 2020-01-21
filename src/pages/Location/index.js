import React from 'react';
import { PermissionsAndroid, View, Text, Image, ImageBackground, SafeAreaView, Button, StyleSheet } from 'react-native';
import db from '../../services/db';
import { Card } from 'react-native-elements';
import { Container } from './styles';
import Swiper from 'react-native-deck-swiper';
import Geolocation from 'react-native-geolocation-service';



export default function Location() {
  var swiperRef;
  const [locations, setLocations] = React.useState([]);
  const [actualLocation, setActualLocation] = React.useState({});
  const [permissionLocation, setPermissionLocation] = React.useState(false);
  React.useEffect(() => {
    requestLocationPermission();
    getData();
  }, []);


async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'App Location Permission',
        message:
          'Cool Photo App needs access to your camera ' +
          'so you can take awesome pictures.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      setPermissionLocation(true);
    } else {
      setPermissionLocation(false);    }
  } catch (err) {
    console.warn(err);
  }
}


const getLocation = async() => {
  var newLocation;
  try{
    Geolocation.getCurrentPosition(
      (position) => {
          newLocation = {latitude: position.coords.latitude, longitude: position.coords.longitude, timestamp: position.timestamp};
          setLocations([...locations,newLocation])
        },
      (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );

   insertRow(newLocation);

  }catch(error){
    // setLocations([...locations, {latitude: 37.785834,longitude: -122.406417}])
    console.warn(error);
  }
}
  const getData = async () => {
   await db.transaction(tx => {
      tx.executeSql('SELECT latitude,longitude,timestamp from location_history', [], (tx, results) => {
        var len = results.rows.length;
        var initLocations = [];
        for (let i = 0; i < len; i++) {
          var row = results.rows.item(i);
          initLocations.push(row);
        }
        setLocations(initLocations);
      });
    });
}
const insertRow =  (newLocation) => {
    try{
     db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO location_history (latitude, longitude,user_id, timestamp VALUES (?, ?, ?, ?))',
        [newLocation.latitude, newLocation.longitude, 1, newLocation.timestamp],
        (tx, results) => {
          console.warn(results);
        },(err) => {
          console.warn(err);
        },
      );
    });
    
  }catch(error){
    console.warn(error);
  }
}


  return (
    <View style={styles.container}>
        {!permissionLocation && (
            <Button title="Solicitar Permissão de Localização" onPress={() => requestLocationPermission()}/>
          )}
           {permissionLocation && (
            <Button title="Localização Atual" onPress={() => getLocation()}/>
          )}
      {locations.map((item, index) => {

        return(
          <>
        
          <Card key={index} title={item.user_id}>
            <View>
              <Text>Latitude: {item.latitude}</Text>
              <Text>Longitude: {item.longitude}</Text>
              <Text>Timestamp: {item.timestamp}</Text>
            </View>
          </Card>
</>
        );
      })}
    
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  card: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  text: {
    textAlign: 'center',
    fontSize: 50,
    backgroundColor: 'transparent'
  },
  done: {
    textAlign: 'center',
    fontSize: 30,
    color: 'white',
    backgroundColor: 'transparent'
  }
})

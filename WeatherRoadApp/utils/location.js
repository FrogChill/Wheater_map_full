import * as Location from 'expo-location';

export async function getCurrentLocation() {
  try {
    // Prašyti leidimo naudoti vietos nustatymo paslaugas
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Leidimas naudoti vietos nustatymą nesuteiktas');
    }
    
    // Gauti dabartinę vietą su aukšta tikslumu
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    return location;
  } catch (error) {
    console.error('Vietos gavimo klaida:', error);
    throw error;
  }
}

export async function getLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Leidimo gavimo klaida:', error);
    return false;
  }
}

export async function watchLocation(callback) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Leidimas naudoti vietos nustatymą nesuteiktas');
    }
    
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10
      },
      callback
    );
    
    return subscription;
  } catch (error) {
    console.error('Vietos stebėjimo klaida:', error);
    throw error;
  }
}
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { getCurrentLocation } from '../utils/location';

export default function MapScreen() {
  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gauti dabartinę vietą ir nustatyti žemėlapio centrą
    async function loadLocation() {
      try {
        const loc = await getCurrentLocation();
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        console.error('Nepavyko gauti vietos:', error);
        // Numatytoji vieta (Vilnius)
        setRegion({
          latitude: 54.6872,
          longitude: 25.2797,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadLocation();

    // Realiu laiku klausytis žymų iš Firebase Realtime Database
    const markersRef = ref(database, 'markers');
    const unsubscribe = onValue(markersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const markerArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        console.log('📍 Gauta žymų:', markerArray.length);
        setMarkers(markerArray);
      } else {
        console.log('📍 Žymų nerasta');
        setMarkers([]);
      }
    }, (error) => {
      console.error('Realtime DB klaida:', error);
    });

    return () => unsubscribe();
  }, []);

  // Funkcija gauti marker spalvą pagal būklę
  const getMarkerColor = (condition) => {
    if (condition.includes('Slidus') || condition.includes('Ledas')) return '#f44336';
    if (condition.includes('Sausas')) return '#4CAF50';
    if (condition.includes('Šlapias')) return '#2196F3';
    if (condition.includes('Sninga')) return '#607D8B';
    if (condition.includes('Rūkas')) return '#9E9E9E';
    if (condition.includes('darbai')) return '#FF9800';
    if (condition.includes('Avarija')) return '#E91E63';
    return '#2196F3';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Kraunama...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {markers.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lon }}
            pinColor={getMarkerColor(m.roadCondition)}
          >
            <Callout style={styles.callout}>
              <ScrollView style={styles.calloutScrollView}>
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutTitle}>{m.roadCondition}</Text>
                  
                  {m.customMessage && m.customMessage.trim() !== '' && (
                    <View style={styles.messageBox}>
                      <Text style={styles.messageLabel}>📝 Pranešimas:</Text>
                      <Text style={styles.messageText}>{m.customMessage}</Text>
                    </View>
                  )}
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🌡️ Temperatūra:</Text>
                    <Text style={styles.infoValue}>{m.temperature}°C</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>☁️ Oras:</Text>
                    <Text style={styles.infoValue}>{m.weather}</Text>
                  </View>
                  
                  {m.pressure && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>📊 Slėgis:</Text>
                      <Text style={styles.infoValue}>{m.pressure} hPa</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Viso žymų: {markers.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  callout: {
    width: 280,
    maxHeight: 250
  },
  calloutScrollView: {
    maxHeight: 250
  },
  calloutContent: {
    padding: 10
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#333'
  },
  messageBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  messageLabel: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 5,
    color: '#555'
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3
  },
  infoLabel: {
    fontSize: 14,
    color: '#666'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  statsBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333'
  }
});
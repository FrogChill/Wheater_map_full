import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Barometer } from 'expo-sensors';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { database } from '../firebase';
import { getCurrentLocation } from '../utils/location';
import { getWeather } from '../services/weatherService';

export default function AddMarkerScreen() {
  const [roadCondition, setRoadCondition] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pressure, setPressure] = useState(null);
  const [barometerAvailable, setBarometerAvailable] = useState(false);

  useEffect(() => {
    // Patikrinti ar barometras prieinamas
    Barometer.isAvailableAsync().then(available => {
      setBarometerAvailable(available);
      if (available) {
        // Pradėti klausytis barometro duomenų
        const subscription = Barometer.addListener(data => {
          setPressure(data.pressure);
        });
        Barometer.setUpdateInterval(1000);
        
        return () => subscription && subscription.remove();
      }
    });
  }, []);

  async function addMarker() {
    if (!roadCondition) {
      Alert.alert('Klaida', 'Prašome pasirinkti kelio būklę');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Pradedamas žymos pridėjimas...');
      
      // Gauti dabartinę vietą
      console.log('📍 Gaunama vieta...');
      const loc = await getCurrentLocation();
      console.log('✅ Vieta gauta:', loc.coords.latitude, loc.coords.longitude);
      
      // Gauti oro prognozę
      console.log('🌤️ Gaunama oro prognozė...');
      const weather = await getWeather(loc.coords.latitude, loc.coords.longitude);
      console.log('✅ Oras gautas:', weather.weather[0].description);
      
      // Paruošti žymos duomenis
      const markerData = {
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        weather: weather.weather[0].description,
        temperature: Math.round(weather.main.temp),
        roadCondition: roadCondition,
        customMessage: customMessage.trim(),
        pressure: pressure || weather.main.pressure,
        createdAt: Date.now()
      };
      
      console.log('💾 Saugoma į Firebase Realtime DB:', markerData);
      
      // Sukurti žymą Firebase Realtime Database
      const markersRef = ref(database, 'markers');
      const newMarkerRef = push(markersRef);
      await set(newMarkerRef, markerData);
      
      console.log('✅ SĖKMINGAI IŠSAUGOTA! Key:', newMarkerRef.key);
      
      Alert.alert('Sėkmė', `Žyma sėkmingai pridėta!\nID: ${newMarkerRef.key}`);
      setRoadCondition('');
      setCustomMessage('');
    } catch (error) {
      console.error('❌ KLAIDA pridedant žymą:', error);
      console.error('Klaidos detalės:', error.message);
      Alert.alert('Klaida', 'Nepavyko pridėti žymos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const conditions = [
    { label: 'Slidus kelias', value: 'Slidus kelias', emoji: '⚠️', color: '#f44336' },
    { label: 'Sausas kelias', value: 'Sausas kelias', emoji: '✅', color: '#4CAF50' },
    { label: 'Šlapias kelias', value: 'Šlapias kelias', emoji: '💧', color: '#2196F3' },
    { label: 'Sninga', value: 'Sninga', emoji: '❄️', color: '#607D8B' },
    { label: 'Rūkas', value: 'Rūkas', emoji: '🌫️', color: '#9E9E9E' },
    { label: 'Ledas ant kelio', value: 'Ledas ant kelio', emoji: '🧊', color: '#00BCD4' },
    { label: 'Kelio darbai', value: 'Kelio darbai', emoji: '🚧', color: '#FF9800' },
    { label: 'Avarija', value: 'Avarija', emoji: '🚗', color: '#E91E63' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pridėti kelio žymą</Text>
        
        {barometerAvailable && pressure && (
          <View style={styles.sensorBox}>
            <Text style={styles.sensorTitle}>📊 Barometro duomenys</Text>
            <Text style={styles.sensorValue}>{pressure.toFixed(1)} hPa</Text>
          </View>
        )}

        <Text style={styles.subtitle}>Pasirinkite kelio būklę:</Text>
        
        <View style={styles.conditionsContainer}>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition.value}
              style={[
                styles.conditionButton,
                roadCondition === condition.value && { 
                  backgroundColor: condition.color,
                  borderColor: condition.color
                }
              ]}
              onPress={() => setRoadCondition(condition.value)}
            >
              <Text style={styles.emoji}>{condition.emoji}</Text>
              <Text style={[
                styles.conditionText,
                roadCondition === condition.value && styles.conditionTextSelected
              ]}>
                {condition.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subtitle}>Papildoma informacija (neprivaloma):</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Pvz.: Didelis eismas, uždarytas 1 juosta, policija vietoje..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={customMessage}
          onChangeText={setCustomMessage}
          maxLength={300}
        />
        <Text style={styles.charCount}>{customMessage.length}/300</Text>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={addMarker}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Pridėti žymą</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton]}
          onPress={async () => {
            try {
              console.log('TEST: Bandoma pridėti test žymą į Realtime DB...');
              const testRef = ref(database, 'markers');
              const newTestRef = push(testRef);
              await set(newTestRef, {
                lat: 54.6872,
                lon: 25.2797,
                weather: 'TEST',
                temperature: 20,
                roadCondition: 'TEST ŽYMA',
                customMessage: 'Testas iš mobilio - ' + new Date().toLocaleTimeString(),
                pressure: 1013,
                createdAt: Date.now()
              });
              console.log('✅ TEST SUCCESS! Key:', newTestRef.key);
              Alert.alert('TEST SĖKMINGAS', 'Žyma sukurta Realtime DB!\nKey: ' + newTestRef.key + '\n\nDabar patikrinkite Firebase Console ir Web puslapį!');
            } catch (err) {
              console.error('❌ TEST FAILED:', err);
              Alert.alert('TEST NESĖKMINGAS', 'Klaida: ' + err.message);
            }
          }}
        >
          <Text style={styles.testButtonText}>🧪 TEST Realtime DB</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Žyma bus pridėta jūsų dabartinėje vietoje su oro prognozės informacija
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  sensorBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#555'
  },
  conditionsContainer: {
    marginBottom: 20
  },
  conditionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0'
  },
  emoji: {
    fontSize: 24,
    marginRight: 15
  },
  conditionText: {
    fontSize: 16,
    color: '#333'
  },
  conditionTextSelected: {
    color: '#fff',
    fontWeight: 'bold'
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top'
  },
  charCount: {
    textAlign: 'right',
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  testButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic'
  }
});
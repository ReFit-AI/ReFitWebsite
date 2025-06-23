import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { phoneService } from '../services/api';

type ScanPhoneScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ScanPhone'>;

interface Props {
  navigation: ScanPhoneScreenNavigationProp;
}

const ScanPhoneScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneData, setPhoneData] = useState({
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    storage: '128GB',
    carrier: 'Unlocked',
    condition: 'Good',
  });

  const handleGetQuote = async () => {
    try {
      // In production, this would use the camera to scan
      // For now, we'll use the form data
      navigation.navigate('Quote', { phoneData });
    } catch (error) {
      console.error('Failed to get quote:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Phone Details</Text>
        <Text style={styles.subtitle}>
          In production, this screen will use the camera to scan your phone
        </Text>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              value={phoneData.brand}
              onChangeText={(text) => setPhoneData({ ...phoneData, brand: text })}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={phoneData.model}
              onChangeText={(text) => setPhoneData({ ...phoneData, model: text })}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Storage</Text>
            <TextInput
              style={styles.input}
              value={phoneData.storage}
              onChangeText={(text) => setPhoneData({ ...phoneData, storage: text })}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Carrier</Text>
            <TextInput
              style={styles.input}
              value={phoneData.carrier}
              onChangeText={(text) => setPhoneData({ ...phoneData, carrier: text })}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Condition</Text>
            <TextInput
              style={styles.input}
              value={phoneData.condition}
              onChangeText={(text) => setPhoneData({ ...phoneData, condition: text })}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetQuote}>
          <Text style={styles.buttonText}>Get Quote</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#9945FF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScanPhoneScreen;
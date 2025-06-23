import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function AppMinimal(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ReFit Mobile</Text>
          <Text style={styles.tagline}>Trade in your phone, get paid in SOL</Text>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoTitle}>🚀 Demo Mode</Text>
          <Text style={styles.demoText}>
            This is a preview of the ReFit Solana Mobile app.
            Full Seed Vault integration coming soon!
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📱</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Solana Mobile Ready</Text>
              <Text style={styles.featureDescription}>
                Built for Saga and Seeker phones with Seed Vault
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📸</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>V3RA AI Scanning</Text>
              <Text style={styles.featureDescription}>
                AI-powered phone condition assessment
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Instant SOL Quotes</Text>
              <Text style={styles.featureDescription}>
                Real-time valuation in Solana
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Connect Wallet (Demo)</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            App Version: 1.0.0{'\n'}
            API: Connected to ReFit Backend{'\n'}
            Network: Devnet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  demoNotice: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#14F195',
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14F195',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
  },
  button: {
    marginHorizontal: 20,
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
  infoSection: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AppMinimal;
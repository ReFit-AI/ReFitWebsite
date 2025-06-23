import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useSolana } from '../components/SolanaProvider';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { walletAddress, connect, disconnect, isConnecting } = useSolana();

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleStartTradeIn = () => {
    if (!walletAddress) {
      handleConnectWallet();
    } else {
      navigation.navigate('ScanPhone');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ReFit</Text>
          <Text style={styles.tagline}>Trade in your phone, get paid in SOL</Text>
        </View>

        {/* Wallet Status */}
        <View style={styles.walletSection}>
          {walletAddress ? (
            <View style={styles.walletConnected}>
              <Text style={styles.walletLabel}>Connected Wallet</Text>
              <Text style={styles.walletAddress}>
                {walletAddress.toBase58().slice(0, 4)}...
                {walletAddress.toBase58().slice(-4)}
              </Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnect}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Main CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.phoneIcon}>📱</Text>
          </View>
          <Text style={styles.ctaTitle}>Turn Your Old Phone into SOL</Text>
          <Text style={styles.ctaDescription}>
            Get instant quotes powered by V3RA AI and receive payment in Solana
          </Text>
          <TouchableOpacity
            style={[
              styles.mainButton,
              !walletAddress && styles.mainButtonDisabled,
            ]}
            onPress={handleStartTradeIn}
          >
            <Text style={styles.mainButtonText}>
              {walletAddress ? 'Start Trade-In' : 'Connect Wallet First'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📸</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Scan Your Phone</Text>
              <Text style={styles.featureDescription}>
                Take a photo and let V3RA AI assess its condition
              </Text>
            </View>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Get Instant Quote</Text>
              <Text style={styles.featureDescription}>
                Receive a fair market value in SOL within seconds
              </Text>
            </View>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📦</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Ship & Get Paid</Text>
              <Text style={styles.featureDescription}>
                Free shipping label and SOL payment on receipt
              </Text>
            </View>
          </View>
        </View>

        {/* Seed Vault Badge */}
        <View style={styles.seedVaultBadge}>
          <Text style={styles.seedVaultIcon}>🔐</Text>
          <Text style={styles.seedVaultText}>Seed Vault Enabled</Text>
        </View>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
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
  },
  walletSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  walletConnected: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  disconnectButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  disconnectButtonText: {
    color: '#888',
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: '#14F195',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  phoneIcon: {
    fontSize: 40,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  mainButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
  },
  mainButtonDisabled: {
    backgroundColor: '#333',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#888',
  },
  seedVaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#111',
    borderRadius: 24,
    marginHorizontal: 20,
  },
  seedVaultIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  seedVaultText: {
    color: '#14F195',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
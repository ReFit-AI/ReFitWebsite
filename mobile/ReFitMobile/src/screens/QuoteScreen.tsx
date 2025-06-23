import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { phoneService } from '../services/api';

type QuoteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Quote'>;
type QuoteScreenRouteProp = RouteProp<RootStackParamList, 'Quote'>;

interface Props {
  navigation: QuoteScreenNavigationProp;
  route: QuoteScreenRouteProp;
}

const QuoteScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneData } = route.params;
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const result = await phoneService.getQuote(phoneData);
      setQuote(result);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      // Fallback demo quote
      setQuote({
        usdPrice: 420,
        solPrice: 2.8,
        solUsdPrice: 150,
        expiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = () => {
    navigation.navigate('Shipping', { quote });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9945FF" />
          <Text style={styles.loadingText}>V3RA AI is analyzing your device...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>Your Quote</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.solAmount}>{quote.solPrice} SOL</Text>
            <Text style={styles.usdAmount}>${quote.usdPrice} USD</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Device</Text>
              <Text style={styles.detailValue}>
                {phoneData.brand} {phoneData.model}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Storage</Text>
              <Text style={styles.detailValue}>{phoneData.storage}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>{phoneData.condition}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SOL Price</Text>
              <Text style={styles.detailValue}>${quote.solUsdPrice}</Text>
            </View>
          </View>

          <Text style={styles.expiry}>
            Quote valid for 10 minutes
          </Text>
        </View>

        <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptQuote}>
          <Text style={styles.acceptButtonText}>Accept Quote</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quoteCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  quoteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  solAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#14F195',
    marginBottom: 8,
  },
  usdAmount: {
    fontSize: 20,
    color: '#888',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  expiry: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: '#14F195',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  declineButtonText: {
    color: '#888',
    fontSize: 16,
  },
});

export default QuoteScreen;
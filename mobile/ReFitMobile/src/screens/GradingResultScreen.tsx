import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import api from '../services/api';

type DamageItem = {
  type: string;
  severity: number;
  location: { x: number; y: number };
  confidence: number;
};

type GradingResult = {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  damages: DamageItem[];
  estimatedValue: number;
  confidence: number;
  details: {
    screenIntact: boolean;
    powersOn: boolean;
    majorDamage: boolean;
  };
};

const GRADE_DESCRIPTIONS = {
  'A': 'Like New - No visible damage',
  'B': 'Good - Minor scratches only',
  'C': 'Fair - Visible damage, fully functional',
  'D': 'Poor - Major damage, functional',
  'F': 'Broken - For parts only',
};

const GRADE_COLORS = {
  'A': '#4CAF50',
  'B': '#8BC34A',
  'C': '#FFC107',
  'D': '#FF9800',
  'F': '#F44336',
};

export default function GradingResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photos } = route.params;

  const [isProcessing, setIsProcessing] = useState(true);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processPhotos();
  }, []);

  const processPhotos = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Step 1: Prepare photos for upload
      const processedPhotos = await Promise.all(
        photos.map(async (photo, index) => {
          // Resize image for faster upload
          const resized = await ImageResizer.createResizedImage(
            photo.path,
            1920,
            1920,
            'JPEG',
            80,
            0,
            undefined,
            false,
            { mode: 'contain' }
          );

          // Read file as base64
          const base64 = await RNFS.readFile(resized.uri, 'base64');
          
          setUploadProgress((index + 1) / photos.length * 50); // 50% for upload
          
          return {
            data: base64,
            step: `photo-${index}`,
          };
        })
      );

      // Step 2: Upload photos to server
      const uploadResponse = await api.post('/mobile/v1/grading/upload', {
        deviceModel: 'iPhone 12', // This should come from previous screen
        photos: processedPhotos,
      });

      const { assessmentId } = uploadResponse.data;
      setUploadProgress(60);

      // Step 3: Trigger AI analysis
      await api.post(`/mobile/v1/grading/process/${assessmentId}`);
      setUploadProgress(80);

      // Step 4: Poll for results
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      const pollForResults = async () => {
        const resultResponse = await api.get(`/mobile/v1/grading/result/${assessmentId}`);
        
        if (resultResponse.data.status === 'completed') {
          setGradingResult(resultResponse.data.result);
          setIsProcessing(false);
          setUploadProgress(100);
        } else if (resultResponse.data.status === 'failed') {
          throw new Error('Grading failed. Please try again.');
        } else if (attempts < maxAttempts) {
          attempts++;
          setUploadProgress(80 + (attempts / maxAttempts) * 20);
          setTimeout(pollForResults, 1000);
        } else {
          throw new Error('Grading timeout. Please try again.');
        }
      };

      await pollForResults();
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Failed to process photos');
      setIsProcessing(false);
    }
  };

  const acceptQuote = () => {
    if (!gradingResult) return;
    
    navigation.navigate('Quote', {
      deviceInfo: {
        brand: 'Apple', // This should come from previous data
        model: 'iPhone 12',
        condition: gradingResult.grade,
        price: gradingResult.estimatedValue,
        gradingDetails: gradingResult,
      },
    });
  };

  const retakePhotos = () => {
    Alert.alert(
      'Retake Photos',
      'Are you sure you want to retake all photos?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retake', 
          onPress: () => navigation.goBack(),
          style: 'destructive',
        },
      ]
    );
  };

  const renderGradeCard = () => {
    if (!gradingResult) return null;

    const gradeColor = GRADE_COLORS[gradingResult.grade];

    return (
      <View style={[styles.gradeCard, { borderColor: gradeColor }]}>
        <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
          <Text style={styles.gradeText}>{gradingResult.grade}</Text>
        </View>
        <View style={styles.gradeDetails}>
          <Text style={styles.gradeDescription}>
            {GRADE_DESCRIPTIONS[gradingResult.grade]}
          </Text>
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(gradingResult.confidence * 100)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderDamageList = () => {
    if (!gradingResult || gradingResult.damages.length === 0) {
      return (
        <View style={styles.noDamageContainer}>
          <Text style={styles.noDamageText}>✓ No significant damage detected</Text>
        </View>
      );
    }

    return (
      <View style={styles.damageContainer}>
        <Text style={styles.sectionTitle}>Detected Issues</Text>
        {gradingResult.damages.map((damage, index) => (
          <View key={index} style={styles.damageItem}>
            <Text style={styles.damageType}>{damage.type}</Text>
            <View style={styles.severityContainer}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.severityDot,
                    level <= damage.severity && styles.severityDotFilled,
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={processPhotos}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#00D4FF" />
          <Text style={styles.processingText}>Analyzing your device...</Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${uploadProgress}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>AI Grading Results</Text>
        
        {renderGradeCard()}
        
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Estimated Value</Text>
          <Text style={styles.valueAmount}>
            ${gradingResult?.estimatedValue || 0}
          </Text>
        </View>

        {renderDamageList()}

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Device Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Screen</Text>
            <Text style={[
              styles.statusValue,
              gradingResult?.details.screenIntact ? styles.statusGood : styles.statusBad
            ]}>
              {gradingResult?.details.screenIntact ? 'Intact' : 'Damaged'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Powers On</Text>
            <Text style={[
              styles.statusValue,
              gradingResult?.details.powersOn ? styles.statusGood : styles.statusBad
            ]}>
              {gradingResult?.details.powersOn ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={acceptQuote}
          >
            <Text style={styles.acceptButtonText}>Accept Quote</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={retakePhotos}
          >
            <Text style={styles.retakeButtonText}>Retake Photos</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  gradeCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  gradeBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  gradeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  gradeDetails: {
    flex: 1,
  },
  gradeDescription: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#888',
  },
  valueContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00D4FF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  damageContainer: {
    marginBottom: 24,
  },
  noDamageContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  noDamageText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  damageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  damageType: {
    fontSize: 16,
    color: 'white',
    textTransform: 'capitalize',
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  severityDotFilled: {
    backgroundColor: '#FF9800',
  },
  detailsContainer: {
    marginBottom: 32,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: '#888',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusGood: {
    color: '#4CAF50',
  },
  statusBad: {
    color: '#F44336',
  },
  buttonContainer: {
    gap: 16,
  },
  acceptButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  retakeButton: {
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
  },
  progressText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00D4FF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
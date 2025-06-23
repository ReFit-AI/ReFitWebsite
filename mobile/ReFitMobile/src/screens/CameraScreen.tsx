import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
  PhotoFile,
  CameraRuntimeError,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type CaptureStep = {
  id: string;
  title: string;
  description: string;
  overlay: 'front' | 'back' | 'corner' | 'screen-on';
};

const CAPTURE_STEPS: CaptureStep[] = [
  {
    id: 'front-off',
    title: 'Front (Screen Off)',
    description: 'Place phone face up with screen turned off',
    overlay: 'front',
  },
  {
    id: 'front-on',
    title: 'Front (Screen On)',
    description: 'Turn on the screen to show test pattern',
    overlay: 'screen-on',
  },
  {
    id: 'back',
    title: 'Back',
    description: 'Flip phone to show the back',
    overlay: 'back',
  },
  {
    id: 'corner-1',
    title: 'Top Left Corner',
    description: 'Focus on top left corner',
    overlay: 'corner',
  },
  {
    id: 'corner-2',
    title: 'Top Right Corner',
    description: 'Focus on top right corner',
    overlay: 'corner',
  },
  {
    id: 'corner-3',
    title: 'Bottom Right Corner',
    description: 'Focus on bottom right corner',
    overlay: 'corner',
  },
];

export default function CameraScreen() {
  const navigation = useNavigation();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;

  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoFile[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  React.useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.CAMERA);
    setHasPermission(result === RESULTS.GRANTED);
  };

  const capturePhoto = useCallback(async () => {
    if (!camera.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableAutoRedEyeReduction: false,
      });

      setCapturedPhotos(prev => [...prev, photo]);

      if (currentStep < CAPTURE_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // All photos captured, process them
        processPhotos([...capturedPhotos, photo]);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [camera, currentStep, capturedPhotos, isCapturing]);

  const processPhotos = (photos: PhotoFile[]) => {
    // Navigate to processing screen with photos
    navigation.navigate('GradingResult', { photos });
  };

  const renderOverlay = () => {
    const step = CAPTURE_STEPS[currentStep];
    
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.topOverlay}>
          <Text style={styles.stepIndicator}>
            Step {currentStep + 1} of {CAPTURE_STEPS.length}
          </Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        {/* Visual guide overlay */}
        <Svg
          width={screenWidth}
          height={screenHeight * 0.6}
          style={styles.svgOverlay}
        >
          {step.overlay === 'front' || step.overlay === 'back' ? (
            // Phone outline
            <Path
              d={`M ${screenWidth * 0.2} ${screenHeight * 0.15}
                  L ${screenWidth * 0.8} ${screenHeight * 0.15}
                  Q ${screenWidth * 0.85} ${screenHeight * 0.15} ${screenWidth * 0.85} ${screenHeight * 0.2}
                  L ${screenWidth * 0.85} ${screenHeight * 0.5}
                  Q ${screenWidth * 0.85} ${screenHeight * 0.55} ${screenWidth * 0.8} ${screenHeight * 0.55}
                  L ${screenWidth * 0.2} ${screenHeight * 0.55}
                  Q ${screenWidth * 0.15} ${screenHeight * 0.55} ${screenWidth * 0.15} ${screenHeight * 0.5}
                  L ${screenWidth * 0.15} ${screenHeight * 0.2}
                  Q ${screenWidth * 0.15} ${screenHeight * 0.15} ${screenWidth * 0.2} ${screenHeight * 0.15}`}
              stroke="#00D4FF"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
            />
          ) : step.overlay === 'corner' ? (
            // Corner focus circle
            <Circle
              cx={screenWidth * 0.5}
              cy={screenHeight * 0.35}
              r={100}
              stroke="#00D4FF"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
            />
          ) : null}
        </Svg>

        <View style={styles.bottomOverlay}>
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={capturePhoto}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      {renderOverlay()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  stepIndicator: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  svgOverlay: {
    position: 'absolute',
    top: 120,
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00D4FF',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
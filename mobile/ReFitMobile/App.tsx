import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SolanaProvider } from './src/components/SolanaProvider';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ScanPhoneScreen from './src/screens/ScanPhoneScreen';
import QuoteScreen from './src/screens/QuoteScreen';
import ShippingScreen from './src/screens/ShippingScreen';

export type RootStackParamList = {
  Home: undefined;
  ScanPhone: undefined;
  Quote: {
    phoneData: {
      brand: string;
      model: string;
      storage: string;
      carrier: string;
      condition: string;
    };
  };
  Shipping: {
    quote: any;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SolanaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#000',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              cardStyle: {
                backgroundColor: '#000',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'ReFit Mobile' }}
            />
            <Stack.Screen 
              name="ScanPhone" 
              component={ScanPhoneScreen}
              options={{ title: 'Scan Your Phone' }}
            />
            <Stack.Screen 
              name="Quote" 
              component={QuoteScreen}
              options={{ title: 'Your Quote' }}
            />
            <Stack.Screen 
              name="Shipping" 
              component={ShippingScreen}
              options={{ title: 'Shipping' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SolanaProvider>
    </SafeAreaProvider>
  );
}

export default App;

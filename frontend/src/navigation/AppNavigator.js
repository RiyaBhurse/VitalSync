import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MedicineScreen from '../screens/MedicineScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CaretakerScreen from '../screens/CaretakerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ userRole }) => (
    <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Timeline') iconName = focused ? 'time' : 'time-outline';
            else if (route.name === 'Medicines') iconName = focused ? 'medkit' : 'medkit-outline';
            else if (route.name === 'History') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            else if (route.name === 'Caretaker') iconName = focused ? 'people' : 'people-outline';
            return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
    })}>
        {userRole === 'primary' ? (
            <>
                <Tab.Screen name="Timeline" component={HomeScreen} options={{ headerShown: false }} />
                <Tab.Screen name="Medicines" component={MedicineScreen} options={{ headerShown: false }} />
                <Tab.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
            </>
        ) : (
            <Tab.Screen name="Caretaker" component={CaretakerScreen} options={{ headerShown: false, title: 'Dashboard' }} />
        )}
    </Tab.Navigator>
);

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <Stack.Screen name="Main">{props => <MainTabs {...props} userRole={user.role} />}</Stack.Screen>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

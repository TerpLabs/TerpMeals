import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from 'components/Login';
import Create from 'components/Create';
import Menu from 'components/Menu';
import Tracker from 'components/Tracker';
import Account from 'components/Account';
import Meals from 'components/Meals';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import './global.css';
import { useEffect } from 'react';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//Tab Navigator
function TabNavigator(){
  return (
    <Tab.Navigator>


    <Tab.Screen 
          name="Meals" 
          component={Meals}  
          options={{ 
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Image 
                source={require("assets/meals_icon.png")} 
                style={{ width: size, height: size }}
              />
            ), tabBarLabel: () => null
          }} 
        />  


    <Tab.Screen 
      name="Tracker" 
      component={Tracker}  
      options={{ 
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Image 
            source={require("assets/tracker_icon.png")} 
            style={{ width: size, height: size }}
          />
        ), tabBarLabel: () => null
      }} 
    />  

    <Tab.Screen 
          name="Menu" 
          component={Menu}  
          options={{ 
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Image 
                source={require("assets/menu_icon.png")} 
                style={{ width: size, height: size }}
              />
            ), tabBarLabel: () => null
          }} 
        />  

    <Tab.Screen 
          name="Account" 
          component={Account}  
          options={{ 
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Image 
                source={require("assets/account_icon.png")} 
                style={{ width: size, height: size }}
              />
            ), tabBarLabel: () => null
          }} 
        />  

    </Tab.Navigator>
  )
}


//App + StackNavigation
export default function App() {
  useEffect(() => {
    async function clearCache(){
      await AsyncStorage.clear()
    }
    clearCache()
  })
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Create" component={Create}  options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

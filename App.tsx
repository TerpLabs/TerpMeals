import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from 'components/Login';
import Create from 'components/Create';
import Menu from 'components/Menu';
import Tracker from 'components/Tracker';
import Account from 'components/Account';
import tw from 'tailwind-react-native-classnames';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import './global.css';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//Tab Navigator
function TabNavigator() {
  const date = `Today's Menu`
  return (
    <Tab.Navigator>
      <Tab.Screen
        name={date}
        component={Menu}
        options={{
          headerTitleAlign: 'left',
          headerTitleStyle: tw`text-4xl font-bold text-white`,
          headerStyle: [tw`bg-black`, { height: 120 }],
        }}
      />
      <Tab.Screen
        name="Tracker"
        component={Tracker}
        options={{
          headerTitleAlign: 'left',
          headerTitleStyle: tw`text-4xl font-bold text-white`,
          headerStyle: [tw`bg-yellow-500`, { height: 120 }],
        }}
      />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

//App + StackNavigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="TabNavigator"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Create" component={Create} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  NavigationContainer,
  Animated,
  Image,
  ImageBackground,
  Touchable,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default ({ navigation }) => {
  //State
  const [data, setData] = useState({});
  const [selectedHall, setSelectedHall] = useState('Y');

  //Sliding animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const diningHallImages = {
    Y: require('assets/ypreview.jpg'),
    North: require('assets/251preview.jpg'),
    South: require('assets/southcampuspreview.jpg'),
  };

  const diningHallFullNames = {
    Y: 'Yahentamitsi',
    North: '251 North',
    South: 'South Campus',
  };

  //Loading data on page reload
  useEffect(() => {
    async function load() {
      //Load data
      let cachedData = await AsyncStorage.getItem('menu');
      let lastUpdated = await AsyncStorage.getItem('lastUpdated');
      let currentDay = new Date().getDay();

      if (
        lastUpdated != null &&
        cachedData != null &&
        lastUpdated != 'null' &&
        cachedData != 'null' &&
        lastUpdated == currentDay
      ) {
        setData(JSON.parse(cachedData).data);
        let cachedNut = await AsyncStorage.getItem('nut');
        setNut(JSON.parse(cachedNut).macros);
      } else {
        let response = await fetch('http://localhost:2022/api/get-meals-info');
        let menuData = await response.json();

        setData(menuData.data);
        setNut(nutData.macros);
        await AsyncStorage.setItem('menu', JSON.stringify(menuData));
        await AsyncStorage.setItem('nut', JSON.stringify(nutData));
        await AsyncStorage.setItem('lastUpdated', String(currentDay));
      }

      //Running the animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
    load();
  }, []);

  return (
    <ScrollView className="bg-white">
      <View>
        <View className="fixed bg-gray-950 p-2">
          <View className="ml-5 w-11/12 flex-row mb-3 justify-center bg-slate-200">
            {[
              { label: 'Yahentamitsi', value: 'Y' },
              { label: '251 North', value: 'North' },
              { label: 'South Campus', value: 'South' },
            ].map((diningHall, id) => (
              <TouchableOpacity
                key={id}
                className={`${
                  selectedHall === diningHall.value ? 'bg-red-500 text-white' : 'bg-slate-700 text-white'
                } text-center text-xl w-1/3 font-bold transition-all`}
                onPress={() => {
                  setSelectedHall(diningHall.value);
                  slideAnim.setValue(0);
                  Animated.timing(slideAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                  }).start();
                }}>
                <View className="items-center p-2">
                  <Text className = "font-bold text-white">{diningHall.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ImageBackground
          source={diningHallImages[selectedHall]}
          style={styles.diningHallBackground}>
          <View style={styles.overlay} />
          <Text style={styles.textOverlay} className="text-center text-2xl font-bold text-white">
            {diningHallFullNames[selectedHall]} Dining Hall
          </Text>
        </ImageBackground>
      </View>

      {Object.keys(data).includes(selectedHall) &&
        Object.keys(data[selectedHall]).map((meal, i) => {
          if (meal != 'name' && meal != 'link') {
            return (
              <View>
                <View className="bg-white">
                  <View className="font-bol bg-slate-800 px-5 py-4 text-left text-center text-3xl">
                    <Text className="text-left text-4xl font-bold text-white">{meal} Menu</Text>
                  </View>
                  {Object.keys(data[selectedHall][meal]).map((dish, idx) => {
                    return (
                      <View>
                        <Text className="bg-yellow-400 px-4 py-2 text-left text-left text-2xl font-bold text-black">
                          {dish}
                        </Text>
                        <View className="border-slate-300">
                          {Object.keys(data[selectedHall][meal][dish]).map((item, idy) => {
                            return (
                              <View className="border-b-2 border-slate-300 bg-slate-100 p-3">
                                <Text>{item}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          }
        })}

      {/* {{Object.keys(data).includes(selectedHall) &&
        Object.keys(data[selectedHall]).map((meal, i) => {
          if (meal != 'name' && meal != 'link') {
            return (
              <View>
                <Text className="px-4 text-2xl font-bold">{meal}</Text>

                <View id={`${selectedHall}.${meal}`} className="h-full transition-all">
                  {Object.keys(data[selectedHall][meal]).map((dish, idx) => {
                    return (
                      <View>
                        <Text className="my-8 px-4 text-lg font-semibold italic">{dish}</Text>
                        <View>
                          {Object.keys(data[selectedHall][meal][dish]).map((item, idy) => {
                            return (
                              <View className="inline h-32 w-full rounded-2xl border-b-4 border-red-500 px-12 py-2">
                                <View className="float-left w-72 flex-col">
                                  <Text className="text-xl font-bold italic text-black">
                                    {item.replace('&amp;', 'and')} -
                                  </Text>
                                  <View className="mt-4 flex-row flex-wrap">
                                    {data[selectedHall][meal][dish][item].map((tag, idz) => {
                                      return (
                                        <Image
                                          source={tag[1]}
                                          className="mx-2 my-2 h-6 w-6"></Image>
                                      );
                                    })}
                                  </View>
                                </View>

                                {Object.keys(nut[item]).includes('calories_per_serving') && (
                                  <View className="items-centers float-left flex-row">
                                    <Text className="mx-4 h-24 w-32 px-4 text-center text-xl font-bold text-red-600">
                                      {`Cal: ${nut[item]['calories_per_serving']}`}{' '}
                                    </Text>

                                    <View className="float-right flex-col border-l-2 border-black">
                                      <View className="flex-row">
                                        <View className="captions font-bold">
                                          <Text className="text-lg font-bold italic">
                                            {`  C: ${nut[item]['Total Carbohydrate.']}`}{' '}
                                          </Text>
                                          <Text className="text-lg font-bold italic">
                                            {`  P: ${nut[item]['Protein']}`}{' '}
                                          </Text>
                                          <Text className="text-lg font-bold italic">
                                            {`  F: ${nut[item]['Fat']}`}{' '}
                                          </Text>
                                        </View>

                                        <View className="graphs">
                                          <Animated.View
                                            style={{
                                              height: 30,
                                              backgroundColor: '#7d5633',
                                              borderTopColor: 'black',
                                              borderTopWidth: '2px',
                                              width:
                                                idx + idy < 5
                                                  ? slideAnim.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [
                                                        0,
                                                        10 +
                                                          200 *
                                                            Math.log(
                                                              1 +
                                                                parseInt(
                                                                  nut[item][
                                                                    'Total Carbohydrate.'
                                                                  ].replace('g', ''),
                                                                  10
                                                                )
                                                            ),
                                                      ], // Expands from 0px to 200px
                                                    })
                                                  : `${10 + 200 * Math.log(1 + parseInt(nut[item]['Total Carbohydrate.'].replace('g', ''), 10))}px`,
                                            }}></Animated.View>

                                          <Animated.View
                                            style={{
                                              height: 30,
                                              backgroundColor: 'orange',
                                              borderTopColor: 'black',
                                              borderTopWidth: '2px',
                                              width:
                                                idx + idy < 5
                                                  ? slideAnim.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [
                                                        0,
                                                        10 +
                                                          200 *
                                                            Math.log(
                                                              1 +
                                                                parseInt(
                                                                  nut[item]['Protein'].replace(
                                                                    'g',
                                                                    ''
                                                                  ),
                                                                  10
                                                                )
                                                            ),
                                                      ], // Expands from 0px to 200px
                                                    })
                                                  : `${10 + 200 * Math.log(1 + parseInt(nut[item]['Protein'].replace('g', ''), 10))}px`,
                                            }}></Animated.View>

                                          <Animated.View
                                            style={{
                                              height: 30,
                                              backgroundColor: '#f0d330',
                                              borderTopColor: 'black',
                                              borderTopWidth: '2px',
                                              width:
                                                idx + idy < 5
                                                  ? slideAnim.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [
                                                        0,
                                                        10 +
                                                          200 *
                                                            Math.log(
                                                              1 +
                                                                parseInt(
                                                                  nut[item]['Total Fat'].replace(
                                                                    'g',
                                                                    ''
                                                                  ),
                                                                  10
                                                                )
                                                            ),
                                                      ], // Expands from 0px to 200px
                                                    })
                                                  : `${10 + 200 * Math.log(1 + parseInt(nut[item]['Total Fat'].replace('g', ''), 10))}px`,
                                            }}></Animated.View>
                                        </View>
                                      </View>
                                    </View>
                                    <View className="h-full w-24"></View>
                                  </View>
                                )}

                                {!Object.keys(nut[item]).includes('calories_per_serving') && (
                                  <Text className="text-lg italic text-red-400">
                                    Nutrition not found for this item
                                  </Text>
                                )}

                                <View className="float-right flex-col">
                                  <TouchableOpacity className="bold float-right my-2 text-5xl italic text-gray-400">
                                    <Image source={require('assets/add.png')}></Image>
                                  </TouchableOpacity>
                                  <TouchableOpacity className="bold float-right my-2 text-5xl italic text-gray-400">
                                    <Image source={require('assets/heart.png')}></Image>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          }
        })}}  */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  diningHallBackground: {
    width: '100%',
    height: 150, // Adjust height as needed
    justifyContent: 'center',
    backgroundSize: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  textOverlay: {
    zIndex: 1, // Ensures text stays above the overlay
  },
});

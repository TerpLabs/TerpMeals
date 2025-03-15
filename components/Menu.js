import {Text, View, ScrollView, StyleSheet, TouchableOpacity, Animated, Image, Touchable } from 'react-native'
import { useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';


export default ({navigation}) => {

    //State
    const [data, setData] = useState({})
    const [nut, setNut] = useState({})
    const [selectedHall, setSelectedHall] = useState("Y")

    //Sliding animation
    const slideAnim = useRef(new Animated.Value(0)).current


    //Loading data on page reload
    useEffect(() => {



        async function load(){

            //Load data
            let cachedData = await AsyncStorage.getItem("menu")
            let lastUpdated = await AsyncStorage.getItem("lastUpdated")
            let currentDay = new Date().getDay()



            if(lastUpdated != null && cachedData != null && lastUpdated != "null" && cachedData != "null" && lastUpdated == currentDay){
                setData(JSON.parse(cachedData).data)
                let cachedNut = await AsyncStorage.getItem("nut")
                setNut(JSON.parse(cachedNut).macros)
            }
            else{
                let response = await fetch("http://localhost:2022/api/get-meals-info");
                let menuData = await response.json();
                response = await fetch("http://localhost:2022/api/get-nutrition");
                let nutData = await response.json();

                setData(menuData.data);
                setNut(nut.macros)
                await AsyncStorage.setItem("menu", JSON.stringify(menuData)); 
                await AsyncStorage.setItem("nut", JSON.stringify(nutData)) 
                await AsyncStorage.setItem("lastUpdated", String(currentDay));
            }

            //Running the animation
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false, 
              }).start();
        }
        load()
    }, [])

    return (
        <ScrollView className='bg-white'>

            
            <View className = "bg-red-500 border-b-4 border-red-800 px-4 py-4">
                <Text className = "text-4xl font-bold text-white mb-4">Today's Menu</Text>
                <View className = "flex-row">
                    {[
                    { label: 'Y', value: 'Y' },
                    { label: '51', value: 'North' },
                    { label: 'S', value: 'South' },
                ].map((diningHall, id) => {
                    return  (
                        <TouchableOpacity
                        className = {`italic border-b-4 mx-4 ${
                           selectedHall == diningHall.value ? "border-white text-yellow-300" : "border-red-800 text-white"
                        } font-bold text-xl rounded-md w-8 text-center transition-all`}
                        onPress={() => {
                            setSelectedHall(diningHall.value)
                            slideAnim.setValue(0)
                            Animated.timing(slideAnim, {
                                toValue: 1,
                                duration: 1000,
                                useNativeDriver: false, 
                              }).start()

                        }}>{diningHall.label}</TouchableOpacity>
                    )
                })}
                </View>
            </View>

            {Object.keys(data).includes(selectedHall) && <Text className = "text-3xl px-4 font-bold">{data[selectedHall].name}</Text>}
            
            {Object.keys(data).includes(selectedHall) && Object.keys(data[selectedHall]).map((meal, i) => {
                if(meal != "name" && meal != "link"){
                    return (
                        <View>
                        <Text className = "font-bold text-2xl px-4">{meal}</Text>


                        <View id = {`${selectedHall}.${meal}`} className = "h-full transition-all">
                            {Object.keys(data[selectedHall][meal]).map((dish, idx) => {
                                return (
                                    <View>
                                        <Text className = "italic text-lg px-4 my-8 font-semibold">{dish}</Text>
                                        <View>
                                            {Object.keys(data[selectedHall][meal][dish]).map((item, idy) => {
                                                return (
                                                    <View className = "h-32 py-2 border-b-4 border-red-500 w-full rounded-2xl px-12 inline">
                                                        <View className = "flex-col float-left w-72">
                                                            <Text className='font-bold text-black italic text-xl'>{item.replace("&amp;", "and")}</Text>
                                                            <View className = 'flex-row flex-wrap mt-4'>
                                                                {data[selectedHall][meal][dish][item].map((tag, idz) => {
                                                                    return (
                                                                        <Image source = {tag[1]} className = "mx-2 my-2 w-6 h-6"></Image>
                                                                    )
                                                                })}
                                                            </View>
                                                        </View>
                                                        
                                                        

                                                        {Object.keys(nut[item]).includes('calories_per_serving') && 
                                                            <View className = "flex-row float-left items-centers">
                                                                <Text className = 'font-bold text-xl px-4 w-32 h-24 text-red-600 mx-4 text-center'
                                                                >{`Cal: ${nut[item]['calories_per_serving']}`}   </Text>

                                                                <View className = 'float-right flex-col border-l-2 border-black'>

                                                                <View className = "flex-row">

                                                                    <View className = "captions font-bold">
                                                                        <Text className = "font-bold text-lg italic">{`  C: ${nut[item]["Total Carbohydrate."]}`}  </Text>
                                                                        <Text className = "font-bold text-lg italic">{`  P: ${nut[item]["Protein"]}`}  </Text>
                                                                        <Text className = "font-bold text-lg italic">{`  F: ${nut[item]["Fat"]}`}  </Text>
                                                                    </View>

                                                                    <View className = "graphs">

                                                                        <Animated.View style = {{
                                                                            height: 30,
                                                                            backgroundColor: "#7d5633",
                                                                            borderTopColor: "black",
                                                                            borderTopWidth: "2px",
                                                                            width: slideAnim.interpolate({
                                                                                inputRange: [0, 1],
                                                                                outputRange: [0, 
                                                                                    10 + (200 * Math.log(1+parseInt(nut[item]["Total Carbohydrate."].replace("g", ""), 10)))
                                                                                ],  // Expands from 0px to 200px
                                                                            })
                                                                        }}>
                                                                        </Animated.View>

                                                                        <Animated.View style = {{
                                                                            height: 30,
                                                                            backgroundColor: "orange",
                                                                            borderTopColor: "black",
                                                                            borderTopWidth: "2px",
                                                                            width: slideAnim.interpolate({
                                                                                inputRange: [0, 1],
                                                                                outputRange: [0, 
                                                                                    10 + (200 * Math.log(1+parseInt(nut[item]["Protein"].replace("g", ""), 10)))
                                                                                ],  // Expands from 0px to 200px
                                                                            })
                                                                        }}>
                                                                        </Animated.View>

                                                                        <Animated.View style = {{
                                                                            height: 30,
                                                                            backgroundColor: "#f0d330",
                                                                            borderTopColor: "black",
                                                                            borderTopWidth: "2px",
                                                                            width: slideAnim.interpolate({
                                                                                inputRange: [0, 1],
                                                                                outputRange: [0, 
                                                                                    10 + (200 * Math.log(1+parseInt(nut[item]["Total Fat"].replace("g", ""), 10)))
                                                                                ],  // Expands from 0px to 200px
                                                                            })
                                                                        }}>
                                                                        </Animated.View>

                                    
                                                                    </View>

                                                                </View>

                                                                </View>
                                                                <View className = "w-24 h-full"></View>

                                                                <View style={{ flexDirection: 'col', justifyContent: 'flex-end' }}>
                                                                    <TouchableOpacity className = "text-5xl bold italic text-gray-400 my-2 float-right">
                                                                        <Image source = {require('assets/add.png')}></Image>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity className = "text-5xl bold italic text-gray-400 my-2 float-right">
                                                                        <Image source ={require('assets/heart.png')}></Image>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        }

                                                        {!Object.keys(nut[item]).includes('calories_per_serving') && 
                                                            <Text className = "italic text-red-400 text-lg">Nutrition not found for this item</Text>

                                                        }
                                                      
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                        </View>
                    )
                }
            })}


        </ScrollView>
    )
}

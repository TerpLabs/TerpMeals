import {Text, View, ScrollView, Button, TouchableOpacity } from 'react-native'
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import {ACCESS_KEY_ID, SECRET_ACCESS_KEY} from "@env"
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';


export default ({navigation}) => {

    //State
    const [data, setData] = useState({})
    const [selectedHall, setSelectedHall] = useState("Y")

    //Lambda Config
    const decoder = new TextDecoder('utf-8');

    const client = new LambdaClient({
        credentials: {
                accessKeyId: ACCESS_KEY_ID,  
                secretAccessKey: SECRET_ACCESS_KEY  
            },
            region: 'us-east-1'
        });

    
    async function invoke(payload){
      const input = { // InvocationRequest
        FunctionName: "TerpMealsDBApi", // required
        Payload: JSON.stringify(payload) //I should really modularize this lambda function
      };
      const command = new InvokeCommand(input);
      const response = await client.send(command);
      const decodedPayload = new TextDecoder("utf-8").decode(response.Payload);
      return JSON.parse(decodedPayload).body
    }


    //Loading data on page reload
    useEffect(() => {
        async function load(){
            //Load data
            let cachedData = await AsyncStorage.getItem("menu")
            let lastUpdated = await AsyncStorage.getItem("lastUpdated")
            let currentDay = new Date().getDay()



            if(lastUpdated != null && cachedData != null && lastUpdated != "null" && cachedData != "null" && lastUpdated == currentDay){
                setData(JSON.parse(cachedData).data)
            }
            else{
                let menuData = await invoke({"command" : "menu"})
                setData(menuData.data)
                await AsyncStorage.setItem("menu", menuData)
                await AsyncStorage.setItem("lastUpdated", currentDay)
            }
        }
        load()
    }, [])

    return (
        <ScrollView className='px-4'>
            <Text className = "text-3xl font-bold">Today's Menu</Text>
            <RNPickerSelect 
                onValueChange={setSelectedHall}
                items = {[
                    { label: 'Yahentamitsi', value: 'Y' },
                    { label: '251 North', value: 'North' },
                    { label: 'South Campus Dining', value: 'South' },
                ]}
            />
            <Text>{"\n"}</Text>

            {Object.keys(data).includes(selectedHall) && <Text className = "text-lg font-bold">Menu for {data[selectedHall].name}</Text>}
            
            {Object.keys(data).includes(selectedHall) && Object.keys(data[selectedHall]).map((meal, i) => {
                if(meal != "name" && meal != "link"){
                    return (
                        <View>
                        <Text className = "font-bold text-xl">{meal}</Text>
                        <View className = "px-4 flex flex-row flex-wrap">
                            {Object.keys(data[selectedHall][meal]).map((dish, idx) => {
                                return (
                                    <View>
                                        <Text className = "italic font-semibold">{dish}</Text>
                                        <View className = "px-8 border-l-2 border-t-2 border-gray-300 bg-gray-100 mx-8 my-4">
                                            {Object.keys(data[selectedHall][meal][dish]).map((item, idy) => {
                                                return (
                                                    <TouchableOpacity className = "h-32 w-32">
                                                        {item.length <= 10 && <Text className='font-bold text-red-600 italic text-lg py-2'>{item}</Text>}
                                                        {item.length > 10 && <Text className='font-bold text-red-600 italic'>{item}</Text>}
                                                        <Text>{data[selectedHall][meal][dish][item].toString()}</Text>
                                                        <Text>{"\n"}</Text>
                                                        <View className = "bg-gray-200 py-2 flex-row font-bold">  
                                                            <Text>C: {JSON.stringify(data.macros[item].calories_per_serving.replace('"', ''))}  </Text>
                                                            <Text>P: {JSON.stringify(data.macros[item].Protein.replace('"', '').replace('g', ''))}</Text>
                                                        </View>
                                                        <Text>{"\n"}</Text>
                                                    </TouchableOpacity>
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
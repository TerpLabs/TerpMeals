import { Text, View, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState, useEffect, useRef } from "react";
import { BarChart } from "react-native-gifted-charts";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FoodModal({ visible, data, onClose, mode, nutState, mealsState, previousServings
 }) {
    //mode can be add, edit, or view
    //add = adding to the tracker
    //edit = editing an amount that's already added
    //view = viewing

    const [graphData, setGraphData] = useState([]);
    const [servings, setServings] = useState(previousServings ? previousServings : 1)
    const [showErr, setShowErr] = useState(false)



    function updateGraphData(){
        if (data?.data) {
            let newGraphData = [];
            Object.entries(data.data).forEach(([key, value]) => {
                if (typeof value === 'string' && value.endsWith('g') && key != "Carbohydrate" && key != "Fat") {
                    const match = value.match(/[0-9.]+/);
                    if (match) {
                        let nutAmt = parseFloat(match[0]);
                        if (value.includes("mg")) {
                            nutAmt /= 1000;
                        }
                        if (nutAmt > 0.001) { //Havent mult by servings yet bc that's for filtering
                            newGraphData.push({
                                value: nutAmt * servings,
                                label: key,
                                frontColor: '#177AD5',
                            });
                        }
                    }
                }
            });
            setGraphData(newGraphData);
        }
    }


    //tried putting this into updateCache, but it wasn't working bc state is async
    async function handleDelete() {
        try {
            let currentTrackedNut = JSON.parse(await AsyncStorage.getItem("trackedNut"));
            let currentTrackedMeals = JSON.parse(await AsyncStorage.getItem("trackedMeals"));
    
            // If the meal exists in trackedMeals, we remove it
            if (Object.keys(currentTrackedMeals).includes(data.name)) {
                delete currentTrackedMeals[data.name];
            }
    
            // Update nutrients in trackedNut
            Object.keys(data.data).forEach(nutrient => {
                let nutrient_str = data.data[nutrient].match(/[0-9.]+/);
                let nutrient_units = data.data[nutrient].replace(nutrient_str, "");
                let nutrient_amount = parseFloat(nutrient_str) * previousServings;
    
                if (Object.keys(currentTrackedNut).includes(nutrient)) {
                    let currentValues = currentTrackedNut[nutrient];
                    // Subtract the previous servings amount for this nutrient
                    currentTrackedNut[nutrient] = {
                        units: currentValues['units'],
                        amount: currentValues['amount'] - nutrient_amount
                    };
                }
            });
    
            // Update AsyncStorage
            await AsyncStorage.setItem("trackedNut", JSON.stringify(currentTrackedNut));
            await AsyncStorage.setItem("trackedMeals", JSON.stringify(currentTrackedMeals));
    
            if (nutState && mealsState) {
                nutState(currentTrackedNut);
                mealsState(currentTrackedMeals);
            }
    
            console.log("Successfully deleted the item from the cache");
    
            // Close the modal after successful deletion
            onClose();
    
            return true;
        } catch (Exception) {
            console.log("Error occurred during deletion:");
            console.log(Exception);
    
            return false;
        }
    }
    

    async function updateCache(){
        try{
  

            let currentTrackedNut = JSON.parse(await AsyncStorage.getItem("trackedNut"))
            let currentTrackedMeals = JSON.parse(await AsyncStorage.getItem("trackedMeals"))

            if(!Object.keys(currentTrackedMeals).includes(data.name) || mode == 'edit'){
                currentTrackedMeals[data.name] = 0 //Number of servings
            }
            currentTrackedMeals[data.name] += servings
            if(mode == 'edit'){
                currentTrackedMeals[data.name] = servings
            }

            Object.keys(data.data).forEach(nutrient => {
                let nutrient_str = data.data[nutrient].match(/[0-9.]+/)
                let nutrient_units = data.data[nutrient].replace(nutrient_str, "")
                let nutrient_amount = parseFloat(nutrient_str) * servings

                if(!Object.keys(currentTrackedNut).includes(nutrient) || mode == 'edit'){
                    if(mode == 'edit'){
                        let currentValues = currentTrackedNut[nutrient]
                        currentTrackedNut[nutrient] = {
                            'units' : currentValues['units'],
                            'amount' : currentValues['amount'] - (parseFloat(nutrient_str) * previousServings)
                        }
                    }
                    currentTrackedNut[nutrient] = {'units' : nutrient_units, 'amount' : nutrient_amount}
                }
                else{
                    let currentValues = currentTrackedNut[nutrient]
                    currentTrackedNut[nutrient] = {
                        'units' : currentValues['units'],
                        'amount' : currentValues['amount'] + nutrient_amount
                    }
                }

            })

            if(servings == 0){
                delete currentTrackedMeals[data.name]
            }
           

            await AsyncStorage.setItem("trackedNut", JSON.stringify(currentTrackedNut))
            await AsyncStorage.setItem("trackedMeals", JSON.stringify(currentTrackedMeals))
            if(nutState && mealsState){
                nutState(currentTrackedNut)
                mealsState(currentTrackedMeals)
            }

            

            return true
        }
        catch(Exception){
            console.log("Recieved an Exception!")
            console.log(Exception)
            
            return false
        }
    }



    useEffect(() => {
        updateGraphData()
    },  [servings, data]);

    if (!visible) return null;

    return (
        <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                
                <Text style={styles.foodName}>{data?.name?.replace("&amp;", "&") || 'No name'}</Text>
                
                <View className = "flex-row text-xl m-auto">
                    <Text className = "font-bold">Calories: </Text>
                    <Text>{parseInt(data.data.calories_per_serving) * servings}</Text>
                </View>

                <View className = "flex-row text-lg m-auto">
                    <Text className = "font-bold">Serving Size: </Text>
                    <Text>{data.data.serving_size}</Text>
                </View>

                {graphData.length > 0 ? (
                <ScrollView horizontal vertical className = "m-auto w-auto" style = {{container: {
                    flex: 1,
                    justifyContent: 'center', // Centers vertically
                    alignItems: 'center', // Centers horizontally
                  }}}>
                    <BarChart 
                    horizontal 
                    data={graphData}
                    width={graphData.length * 75} // keep this
                    barWidth={30}
                    spacing={24}
                    initialSpacing={0}           // removes extra space at the start
                    endSpacing={0}               // removes extra space at the end
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{color: 'gray'}}
                    noOfSections={4}
                    xAxisLabelsVerticalShift={20}
                    labelsExtraHeight={50}
                    labelWidth={100}
                    xAxisLabelTextStyle={{
                        alignSelf: 'flex-end',
                        marginRight: 40,
                        marginTop: -44,
                    }}
                    />

                </ScrollView>
                ) : (
                    <Text style={styles.noDataText}>No nutrition data available</Text>
                )}

                <View className = "flex-row m-auto">
                    <Text>Servings: </Text>
                    
                    <TextInput 
                    className = "border-b-2 border-gray-500 hover:border-gray-700 border-opacity-50 w-12 mx-2" 
                    placeholder={`${previousServings}`}
                    onFocus={() => setShowErr(false)}
                    keyboardType="decimal-pad"
                    inputMode="decimal"
                    onChangeText={(e) => {
                        let nums_in_value = e.match(/[0-9.]+/);
                        if(nums_in_value.length > 0){
                            setServings(parseFloat(nums_in_value))
                            updateGraphData()
                        }
                    }}
                    ></TextInput>

                    {(mode == 'edit' || mode == 'add') && 
                    <TouchableOpacity className='w-auto p-2 bg-gray-500 bg-opacity-50 hover:bg-gray-800 mx-2'
                    onPress={() => {
                        if(updateCache()){
                            onClose()
                        }
                        else{
                            setShowErr(true)
                        }

                    }}
                    >
                        <Text>Track</Text>
                    </TouchableOpacity>
                    }

                    {mode == 'edit' && <TouchableOpacity className='w-auto p-2 bg-red-500 bg-opacity-50 hover:bg-red-800 mx-2'
                    onPress={() => {
                        setServings(0)
                        if(handleDelete()){
                            onClose()
                        }
                        else{
                            setShowErr(true)
                        }
                    }}
                    >
                        <Text>Delete</Text>
                    </TouchableOpacity>}


                    

                </View>

                <Text className = 'text-red-500 m-auto'>{showErr ? "Unable to track error" : ""}</Text>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    modalContent: {
        width: 'auto',
        height: 'auto',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: "center"
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: 'red',
        fontWeight: 'bold',
    },
    foodName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    noDataText: {
        textAlign: 'center',
        color: 'gray',
        marginVertical: 20,
    },
});
import { Text, View, ScrollView, TouchableOpacity, StyleSheet, TextInput, Touchable } from 'react-native';
import { useState, useEffect, useRef } from "react";
import { BarChart } from "react-native-gifted-charts";
import AsyncStorage from '@react-native-async-storage/async-storage';





export default function MealModal({ visible, onClose, prevDiningHall, allNut, currentMeal, name, existingMeals, setMeals}) {
    //no mode since 
    //we're always going to delete then reconstruct the meal

    const [graphData, setGraphData] = useState([]);
    const [showErr, setShowErr] = useState(false)
    const [mealName, setMealName] = useState(name)
    const [meal, setMeal] = useState(currentMeal)
    const [diningHall, setDiningHall] = useState(prevDiningHall)

    //all of these are for the search bar
    const [searchTerm, setSearchTerm] = useState("");
    const [showItemSelection, setShowItemSelection] = useState(false);



    function remove_last(str){
        return str.substring(0, str.length - 1)
    }

    //For showing macros (purely for show)
    function macroByServings(nut_as_str, servings){
        let nutrient_str = nut_as_str.match(/[0-9.]+/);
        let nutrient_amount = parseFloat(nutrient_str)
        nutrient_amount *= servings
        return parseInt(Math.round(nutrient_amount * 100) / 100)
    }


    function updateMeals(dish, newServings){
        if(meal.dishes && meal.dishes[dish]){
            let mealCopy = JSON.parse(JSON.stringify(meal))
            let oldServings = mealCopy.dishes[dish]

            Object.entries(allNut[dish]).forEach(([nutrient, value]) => {
                let nutrient_str = value.match(/[0-9.]+/);
                let nutrient_units = value.replace(nutrient_str, "");
                let nutrient_amount = parseFloat(nutrient_str);
            

                if(Object.keys(mealCopy.nut).includes(nutrient)){
                    mealCopy.nut[nutrient].amount -= oldServings * nutrient_amount
                }
            
                else{
                    mealCopy.nut[nutrient].amount = {'amount' : 0, 'units' : nutrient_units}
                }

                
                mealCopy.nut[nutrient].amount += newServings * nutrient_amount
                
            })


            mealCopy.dishes[dish] = newServings
            if(newServings == 0){
                delete mealCopy.dishes[dish]
            }

            setMeal(mealCopy)
        }
    }



    function updateGraphData(){
        if (meal.nut) {
            let newGraphData = [];
            Object.entries(meal.nut).forEach(([key, value]) => {
                let nutAmt = value.amount
                let units = value.units
             

                if (units.endsWith('g') && key != "Carbohydrate" && key != "Fat") {
                    if (units.includes("mg")) {
                        nutAmt /= 1000;
                    }
                   
                    if (nutAmt > 0.001) { 
                        newGraphData.push({
                            value: nutAmt,
                            label: key,
                            frontColor: '#177AD5',
                        });
                    }
                }
            });
            setGraphData(newGraphData);
            
        }
    }





    useEffect(() => {
      
        updateGraphData()
    },  [meal.nut]);

    if (!visible) return null;

    return (
        <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                
                <TextInput 
                value={mealName}
                onChangeText={(text) => setMealName(text)}
                className='text-black bg-white p-2 m-auto w-1/2 border-2 border-black'
                />


                <Text>Dining Hall: {diningHall}</Text>

                <Text className = "text-xl font-bold margin-auto">Dishes: </Text>

                {meal.dishes && Object.keys(meal.dishes).map(dish => (
                   <View key={dish} className="border-b border-gray-200 p-2 hover:bg-gray-400"
                   >
                        
                        <View className = "flex-row items-center">
                            <View>
                                <Text className="text-lg">
                                    {dish.replace("&amp;", "&")}
                                </Text>

                                {allNut[dish] && Object.keys(allNut[dish]).includes("calories_per_serving") ? (
                                    <View className = "flex-row">

                                        

                                        <Text className="text-sm text-gray-600">
                                            Calories: {macroByServings(allNut[dish]["calories_per_serving"], meal.dishes[dish]) + "    "}
                                        </Text>
                                        <Text className="text-sm text-gray-600">
                                            Carb: {macroByServings(allNut[dish]["Total Carbohydrate."], meal.dishes[dish]) + "   "}
                                        </Text>
                                        <Text className="text-sm text-gray-600">
                                            Protein: {macroByServings(allNut[dish]["Protein"], meal.dishes[dish]) + "  "}
                                        </Text>
                                        <Text className="text-sm text-gray-600">
                                            Fat: {macroByServings(allNut[dish]["Total Fat"], meal.dishes[dish]) + "    "}
                                        </Text>

                                    
                                    </View>
                                ) : (
                                    <Text className="text-sm text-red-500 italic">
                                        Nutrition Not Available
                                    </Text>
                                )}
                            </View>

                            <Text>{"   Servings: "}</Text>
                            <TextInput 
                                className = "border-b-2 border-gray-500 hover:border-gray-700 border-opacity-50 w-12 mx-2" 
                                placeholder={
                                    Object.keys(meal.dishes).includes(dish) ? meal.dishes[dish]
                                    : 1
                                }
                                keyboardType='decimal-pad'
                                onFocus={() => setShowErr(false)}
                                onChangeText={(e) => {
                                    let nums_in_value = e.match(/[0-9.]+/);
                                    if(nums_in_value.length > 0 && parseFloat(nums_in_value) != 0){
                                        updateMeals(dish, parseFloat(nums_in_value))
                                    }
                                }}
                            ></TextInput>

                            <Text>{"   "}</Text>
                            <TouchableOpacity className='w-auto p-2 bg-red-500 bg-opacity-50 hover:bg-red-800 mx-2'
                            onPress={() => {
                                updateMeals(dish, 0)
                            }}
                            >
                                <Text>Delete</Text>
                            </TouchableOpacity>

                       </View>

                   </View> 
                ))}

                <View className = "flex-row text-xl m-auto">
                    <Text className = "font-bold">Calories: </Text>
                    <Text>{meal.nut ? parseInt(meal.nut.calories_per_serving.amount) : "0"}</Text>
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


                <View className="items-center p-4">
                    <TextInput
                        placeholder="Search for a dish"
                        className="text-xl border-2 border-black w-full p-2"
                        onFocus={() => setShowItemSelection(true)}
                        onChangeText={setSearchTerm}
                        value={searchTerm}
                    />
                    
                    {showItemSelection && (
                        <ScrollView className="border-2 border-gray-300 w-full max-h-64 mt-2">
                            {Object.keys(allNut)
                                .filter(meal => 
                                    (searchTerm === '' || 
                                    meal.toLowerCase().includes(searchTerm.toLowerCase()))
                                    && true
                                )
                                .map((dish, idx) => 
                                    (
                                    <TouchableOpacity key={idx} className="border-b border-gray-200 p-2 hover:bg-gray-400"
                                    onPress={() => {
                                        //Add to meals and nutrition if it's not alr there (1 serving)
                                        let mealCopy = JSON.parse(JSON.stringify(meal))
                                        if(Object.keys(mealCopy).length === 0){
                                            mealCopy = {
                                                "nut" : {},
                                                "dishes" : {}
                                            }
                                        }
                                        if(!Object.keys(mealCopy.dishes).includes(dish)){
                                            mealCopy.dishes[dish] = 1
                                            Object.keys(allNut[dish]).forEach((nutrient) => {

                                                let nutrient_str = allNut[dish][nutrient].match(/[0-9.]+/);
                                                let nutrient_units = allNut[dish][nutrient].replace(nutrient_str, "");
                                                let nutrient_amount = parseFloat(nutrient_str);
                                    
                                                if (!Object.keys(mealCopy.nut).includes(nutrient)) {
                                                    mealCopy.nut[nutrient] = {
                                                        units: nutrient_units,
                                                        amount: 0
                                                    }
                                                }
                                                let currentValues = mealCopy.nut[nutrient];
                                                mealCopy.nut[nutrient] = {
                                                        units: currentValues['units'],
                                                        amount: currentValues['amount'] + nutrient_amount
                                                };

                                            })

                                            //Modifying dining hall if we need to, then finising
                                            if(diningHall == "none"){setDiningHall(allNut[dish].dining_hall)}
                                           
                                            setMeal(mealCopy)
                                        }
                                    }}  
                                    >
                                        <View className = "flex-row items-center text-center">
                                            <Text className="text-lg">
                                                {dish.replace("&amp;", "&")}
                                            </Text>
                                            <Text>{"  "}</Text>
                                            <Text className = "italic text-md">{allNut[dish].dining_hall}</Text>
                                        </View>

                                        {Object.keys(allNut[dish]).includes("calories_per_serving") ? (
                                            <View className = "flex-row">

                                                <Text className="text-sm text-gray-600">
                                                    Calories: {allNut[dish]["calories_per_serving"] + "    "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Carb: {remove_last(allNut[dish]["Total Carbohydrate."]) + "   "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Protein: {remove_last(allNut[dish]["Protein"]) + "  "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Fat: {remove_last(allNut[dish]["Total Fat"]) + "    "}
                                                </Text>

                                            
                                            </View>
                                        ) : (
                                            <Text className="text-sm text-red-500 italic">
                                                Nutrition Not Available
                                            </Text>
                                        )}

                                    </TouchableOpacity>
                                ))
                            }
                        </ScrollView>
                    )}

                </View>


                

               

               
                <Text className = 'text-red-500 m-auto'>{showErr ? "Unable to track error" : ""}</Text>

                <TouchableOpacity className="border-b bg-yellow-500 p-2 hover:bg-yellow-700"
                onPress={async () => {
                    let existing = JSON.parse(JSON.stringify(existingMeals))
                    if(existing[mealName]){
                        delete existing[mealName]
                    }
              
                    existing[mealName] = JSON.parse(JSON.stringify(meal))

                    //Updating cache, DB (TODO), and state
                    await AsyncStorage.setItem("meals", existing)
                    setMeals(existing)
                    onClose()
                }}
                >
                    Add
                </TouchableOpacity>

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
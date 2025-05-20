import { Text, View, ScrollView, TextInput, TouchableOpacity, Image, Touchable } from 'react-native';
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DBAPI_URI } from '@env';
import MealModal from './modals/MealModal';

export default ({ navigation }) => {
    const [nut, setNut] = useState({});
    const [showMealModal, setShowMealModal] = useState(false)
    const [meals, setMeals] = useState({})
    const [meal, setCurrentMeal] = useState({})
    const [mealName, setMealName] = useState("")


    /* 
    Structure of a meal: 
    {
        mealName: 
            nut: {
                nut : {
                    amount : ###,
                    units : "g"|"mg"...
                }
            },
            dishes: {
                dishName : servings
            }
    }
    */




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


   

    useEffect(() => {

        //Here, you should only be able to view a meal, and not track it or get tracking information. 
        async function load() {
            try {
                let cachedData = await AsyncStorage.getItem("nut");
                let lastUpdated = await AsyncStorage.getItem("lastUpdated");
                let currentDay = new Date().getDay();


                if (cachedData && lastUpdated && lastUpdated == currentDay) {
                    setNut(JSON.parse(cachedData).macros); 
                } else {
                    // Case of it being a new day
                    let response = await fetch(DBAPI_URI + "/get-nutrition");
                    let nutData = await response.json();

                    setNut(nutData.macros);
                    await AsyncStorage.setItem("nut", JSON.stringify(nutData));
                    await AsyncStorage.setItem("lastUpdated", String(currentDay));
                }

            

            
            } catch (error) {
                console.error("Error loading nutrition data:", error);
            }
        }

        load();
    }, []);

    
    return (
        <View className='h-full'>
           
            <MealModal 
                    visible={showMealModal}
                    onClose={() => setShowMealModal(false)}
                    prevDiningHall = "none"
                    name = {mealName}
                    currentMeal = {meal}
                    allNut = {nut}
                    existingMeals = {meals}
                    setMeals = {setMeals}
            />

          


            <View className={`bg-white ${showMealModal ? "opacity-25" : "opacity-100"}`}>

                <View className="bg-black border-b-4 px-4 py-4">
                    <Text className="text-4xl font-bold text-white mb-4">Your Meals</Text>
                </View>

                
            {Object.keys(meals).map((name, idx) => (
                <TouchableOpacity 
                key = {idx}
                onPress={() => {
                    setMealName(name)
                    setCurrentMeal(meals[name])
                    setShowMealModal(true)
                }}
                >
                  
                    <Text className="text-lg">
                        {name}
                    </Text>

                    {Object.keys(meals[name].nut).includes("calories_per_serving") ? (
                        <View className = "flex-row">

                            <Text className="text-sm text-gray-600">
                                Calories: {Math.round(meals[name].nut["calories_per_serving"].amount * 100) / 100 + "    "}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                Carb: {Math.round(meals[name].nut["Total Carbohydrate."].amount * 100) / 100 + "   "}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                Protein: {Math.round(meals[name].nut["Protein"].amount * 100) / 100 + "  "}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                Fat: {Math.round(meals[name].nut["Total Fat"].amount * 100) / 100 + "    "}
                            </Text>

                        
                        </View>
                    ) : (
                        <Text className="text-sm text-red-500 italic">
                            Nutrition Not Available
                        </Text>
                    )}
                </TouchableOpacity>
            ))}



                <TouchableOpacity
                onPress={() => {
                    setCurrentMeal({
                        "nut" : {},
                        "dishes" : {}
                    })
                    setMealName("Unnamed Meal")
                    setShowMealModal(true)
                }}
                >
                    <Text>Create a meal</Text>
                </TouchableOpacity>

            </View>

        </View>

    )
}
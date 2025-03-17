import { Text, View, ScrollView, TextInput, TouchableOpacity, Image, Animated } from 'react-native';
import { useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default ({ navigation }) => {
    // States
    const [nut, setNut] = useState({});
    const [trackedNut, setTrackedNut] = useState({});
    const [trackedMeals,setTrackedMeals] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showItemSelection, setShowItemSelection] = useState(false);
    const [preventBlur, setPreventBlur] = useState(false)

    //Custom state for showing preioritized macros for later setting it 
    const [showedMacros, setShowedMacros] = useState({
        "Carb" : "Total Carbohydrate.",
        "Protein" : "Protein",
        "Fat" : "Total Fat" 
    })

    //For matching graph and macro colors
    const [colors, setColors] = useState(["#cf9e2b", "#a82bcf", "#0ab2cc"])

    //For dynamically updating servingsizevalues by key
    const [servingSizes, setServingSizes] = useState({})

     //Sliding animation
    const slideAnim = useRef(new Animated.Value(0)).current
    

    //For updating tracker:
    async function updateItem(item, servings, type) {
      
        if (servings > 0 && Object.keys(nut[item]).includes("calories_per_serving")) {
           
            let updatedTrackedNut = { ...trackedNut };
    
            for (let nutrient of Object.keys(nut[item])) {
                try {
                    let value = nut[item][nutrient];
                    let servings_for_this_item = servings
    
                    if (value.includes("mg")) {
                        value = value.replace("mg", "");
                        servings_for_this_item /= 1000;
                    }
    
                    value = parseFloat(value.replace("g", ""));
                    value = value * servings_for_this_item
    
                    // Updating the local copy of the nutrient
                    let current_value = 0;
                    if (updatedTrackedNut[nutrient]) {
                        current_value = parseFloat(updatedTrackedNut[nutrient]);
                    }
                    current_value += value
                    if(type == "replace"){
                        current_value = value
                       
                    }
                    updatedTrackedNut[nutrient] = current_value;
                } catch (err) {
                    console.log(err); // If there's an error, ignore this nutrient
                }
            }
    
            // State + AsyncStorage update
            setTrackedNut(updatedTrackedNut);
            let meals = {...trackedMeals}
            if(!Object.keys(meals).includes(item)){
                meals[item] = 0 //n servings
            }
            meals[item] = meals[item] + servings
            if(type == 'replace'){
             
                meals[item] = servings
            }

            setTrackedMeals(meals)
            await AsyncStorage.setItem("trackedMeals", JSON.stringify(meals))
            await AsyncStorage.setItem("trackedNut", JSON.stringify(updatedTrackedNut));
        }

        //Re-running animation 
        slideAnim.setValue(0)
        Animated.timing(slideAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false, 
        }).start()
    }

    //For Removing an item
    async function removeItem(meal){
        let meal_servings = trackedMeals[meal]

        //Subtracting from trackedNut
        let updatedTrackedNut = {...trackedNut}
        Object.keys(updatedTrackedNut).forEach(key => {
            updatedTrackedNut[key] = updatedTrackedNut[key] - (meal_servings * nut[meal][key])
        })

        //Removing key & updating everything 
        let updatedTrackedMeals = {...trackedMeals}
        updatedTrackedMeals[meal] = 0
        setTrackedMeals(updatedTrackedMeals)
        setTrackedNut(updatedTrackedNut)
        await AsyncStorage.setItem("trackedMeals", JSON.stringify(updatedTrackedMeals))
        await AsyncStorage.setItem("trackedNut", JSON.stringify(updatedTrackedNut))
    }

    // Loading data on page reload
    useEffect(() => {
        async function load() {
            try {
                let cachedData = await AsyncStorage.getItem("nut");
                let lastUpdated = await AsyncStorage.getItem("lastUpdated");
                let cachedNutrition = await AsyncStorage.getItem("trackedNut");
                let cachedMeals = await AsyncStorage.getItem("trackedMeals");
                let currentDay = new Date().getDay();

                if (
                    cachedMeals && cachedNutrition && lastUpdated && cachedData &&
                    lastUpdated !== "null" && cachedData !== "null" && lastUpdated == currentDay
                ) {
                    setNut(JSON.parse(cachedData).macros);
                    setTrackedNut(JSON.parse(cachedNutrition));
                    setTrackedMeals(JSON.parse(cachedMeals));
                } else {
                    // Fetch new data if outdated
                    let response = await fetch("http://localhost:2022/api/get-nutrition");
                    let nutData = await response.json();

                    setNut(nutData.macros);
                    setTrackedNut({});
                    setTrackedMeals({});

                    await AsyncStorage.setItem("nut", JSON.stringify(nutData));
                    await AsyncStorage.setItem("lastUpdated", String(currentDay));
                    await AsyncStorage.setItem("trackedNut", JSON.stringify({}));
                    await AsyncStorage.setItem("trackedMeals", JSON.stringify({}));
                }
            } catch (error) {
                console.error("Error loading nutrition data:", error);
            }
        }

        load();

        //anim 
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false, 
    }).start()

    }, []);

    return (
        <ScrollView className = "bg-white">
            <View className="bg-red-500 border-b-4 border-red-800 px-4 py-4">
                <Text className="text-4xl font-bold text-white mb-4">Today's Nutrition</Text>
            </View>

            <View className="items-center">
                <Text className="text-3xl text-red-600 font-bold">
                    {trackedNut?.calories_per_serving ?? 0} total calories
                </Text>

                {Object.keys(trackedNut).includes("calories_per_serving") && 
                <View className = "graphs flex-row align-bottom">
                    {Object.keys(showedMacros).map((label, id) => {
                        const key = showedMacros[label]
                        const color = colors[id]

                        //Calculating a scale for each element so that 
                        let attrs = Object.values(showedMacros).map(key => 10 + (50 * Math.log(1 + trackedNut[key])))
                        let max_attr = Math.max(...attrs)
                        let factor = 1
                        if(max_attr > 275){
                            factor = 275 / max_attr
                        }
                        console.log(factor)

                        return (<View key = {id} className = "flex-col-reverse h-86 w-28 items-center float-bottom">

                            <Text className = "font-bold text-lg rotate-30">{label}</Text>
                            
                            <Animated.View style = {{
                                width: "75px",
                               backgroundColor: color,
                                border: "2px solid black",
                                height: slideAnim.interpolate({
                                    inputRange : [0, 1],
                                    outputRange : [0, 
                                        factor * (10 + (50 * Math.log(1 + trackedNut[key])))
                                    ]
                                })
                            }}>
                            </Animated.View>

                            <Text style = {{"color" : color}} className = "font-bold text-lg">{Math.round(trackedNut[key] * 1000) / 1000}</Text>
                            
                        </View>)
                    })}
                </View>
                }


                <TextInput
                    placeholder="Search for a dish to track it"
                    className="text-xl border-2 border-black w-5/6"
                    onFocus={() => setShowItemSelection(true)}
                    
                    onChangeText={setSearchTerm}
                />
                
                <ScrollView className={`border-black transition-all w-5/6 ${showItemSelection ? ' border-2 h-fit max-h-48' : ' border-0 h-0'}`}>
                {Object.keys(nut).map((meal, idx) => {
                    if(searchTerm == '' || meal.toLowerCase().includes(searchTerm.toLowerCase())){
                        if(!Object.keys(servingSizes).includes(idx.toString())){
                            let serving_sizes = servingSizes
                            serving_sizes[idx.toString()] = '1'
                            setServingSizes(serving_sizes)
                        }
                        return (
                            <View className="border-2 border-black w-full h-12 flex-row items-center px-4 justify-between pointer-events-auto">

                            <View className="flex-row">
                                    <Text className="italic font-bold text-xl">{meal.replace("&amp;", "")} </Text>
                                    {Object.keys(nut[meal]).includes("calories_per_serving") ? (
                                    <View className="flex-row">

                                            <Text className="text-white font-bold text-center bg-red-600 w-10 h-8 mx-1">
                                            {servingSizes[idx.toString()] == "" ? nut[meal]["calories_per_serving"].replace("g", "") : 
                                            Math.round(parseInt(nut[meal]["calories_per_serving"].replace("g", "")) * parseFloat(servingSizes[idx.toString()]) * 1000) / 1000
                                            }
                                            </Text>


                                            {Object.values(showedMacros).map((key, idy) => {
                                                return (
                                                <Text key = {idy} style = {{
                                                    "backgroundColor" : colors[idy]
                                                }}
                                                className = "text-white font-bold text-center w-8 h-8 mx-1"
                                                >
                                                {servingSizes[idx.toString()] == "" ? nut[meal][key].replace("g", "") : 
                                                Math.round(parseInt(nut[meal][key].replace("g", "")) * parseFloat(servingSizes[idx.toString()]) * 1000) / 1000
                                                }
                                                </Text>)
                                            })}

                                    </View>
                                    ) : (
                                    <Text className="text-lg text-red-500 italic">Nutrition Not Available</Text>
                                    )}
                            </View>

                            {/* Right Section */}
                            <View className="flex-row items-center">
                                <Text className="text-xl font-bold italic">Servings: </Text>

                                <TextInput
                                className="w-8 h-8"
                                value = {servingSizes[idx.toString()]}
                                onChangeText={(val) => {
                                    let nums = val.match("[0-9]*(.[0-9]*)?")[0]
                                    let serving_sizes = { ...servingSizes }
                                    serving_sizes[idx.toString()] = nums
                                    setServingSizes(serving_sizes)
                                }}
                                />

                                <TouchableOpacity
                                className="text-5xl bold italic text-gray-400 my-2"
                                onPress={() => {
                                    let servings = servingSizes[idx.toString()]
                                    servings = servings.match("[0-9]*(.[0-9]*)?")[0]
                                    if(servings == ""){
                                        servings = "1"
                                    }
                                    servings = parseFloat(servings)
                                    updateItem(meal, servings, "add")
                                }}
                                >
                                <Image source={require("assets/add.png")} />
                                </TouchableOpacity>
                            </View>
                            </View>

                        )
                    }
                    else{ return <View></View> }
                })}
                </ScrollView>
            </View>

            <View className = "mt-8">
                <Text className = "font-bold text-2xl italic px-4">Tracked Meals</Text>
                {Object.keys(trackedMeals).filter(meal => trackedMeals[meal] > 0).map((meal, idx) => {
                    return (
                        <View className="flex-row border-b-4 py-2 mx-4 border-red-500 rounded-xl justify-between pointer-events-auto" key = {idx}>
                                        
                                    <View className = "flex-row">
                                        <Text className="italic font-bold text-xl">{meal.replace("&amp;", "")} </Text>
                                        {Object.keys(nut[meal]).includes("calories_per_serving") ? (
                                        <View className="flex-row">

                                                <Text className="text-white font-bold text-center bg-red-600 w-10 h-8 mx-1">
                                                {
                                                Math.round(parseInt(nut[meal]["calories_per_serving"].replace("g", "")) * trackedMeals[meal] * 1000) / 1000
                                                }
                                                </Text>


                                                {Object.values(showedMacros).map((key, idy) => {
                                                    return (
                                                    <Text key = {idy} style = {{
                                                        "backgroundColor" : colors[idy]
                                                    }}
                                                    className = "text-white font-bold text-center w-8 h-8 mx-1"
                                                    >
                                                    {
                                                    Math.round(parseInt(nut[meal][key].replace("g", "")) * trackedMeals[meal] * 1000) / 1000
                                                    }
                                                    </Text>)
                                                })}

                                        </View>
                                        ) : (
                                        <Text className="text-lg text-red-500 italic">Nutrition Not Available</Text>
                                        )}
                                    </View>


                                    <View className="flex-row items-center">
                                        <Text className="text-xl font-bold italic">Servings: </Text>

                                        <TextInput
                                        className="w-8 h-8"
                                        placeholder = {trackedMeals[meal]}
                                        onChangeText={(val) => {
                                            let servings = val.match("[0-9]*(.[0-9]*)?")[0]
                                            if(servings != "" && servings != "." && servings != 0){
                                                servings = parseFloat(servings)
                                                updateItem(meal, servings, "replace")
                                            }
                                        }}
                                        />

                                        <TouchableOpacity
                                        className="text-5xl bold italic text-gray-400 my-2"
                                        onPress={() => {
                                            removeItem(meal)
                                        }}
                                        >
                                        <Image source={require("assets/remove.png")} />
                                        </TouchableOpacity>

                                    </View>
                        </View>
                    )
                })}
            </View>
        </ScrollView>
    );
};

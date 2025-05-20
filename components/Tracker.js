import { Text, View, ScrollView, TextInput, TouchableOpacity, Touchable } from 'react-native';
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DBAPI_URI } from '@env';
import FoodModal from './modals/FoodModal';
import { BarChart } from "react-native-gifted-charts";


export default ({ navigation }) => {
    // States
    const [nut, setNut] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showItemSelection, setShowItemSelection] = useState(false);
    const [selectedItem, setSelectedItem] = useState({})
    const [showFoodModal, setShowFoodModal] = useState(false)

    const [trackedNut, setTrackedNut] = useState({})
    const [trackedMeals, setTrackedMeals] = useState({})

    const [modalMode, setModalMode] = useState('add') //Either 'add' or 'replace' if we're adding a meal or completely changing meals

    const [graphData, setGraphData] = useState([])
    const [prevServings, setPrevServings] = useState(1)



    //String utils :)
    const wrapLabel = (label, maxLen = 6) => {
        if (label.length <= maxLen) return label;
        const words = label.split(' ');
        if (words.length > 1) {
          const mid = Math.floor(words.length / 2);
          return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
        } else {
          return label.slice(0, maxLen) + '\n' + label.slice(maxLen);
        }
      };
    function remove_last(str){
        return str.substring(0, str.length - 1)
    }


    //Updating graphData whenever nutrition data is updated
    useEffect(() => {
        let newGraphData = []
        Object.keys(trackedNut).forEach(nutrientName => {
            let nutrient = trackedNut[nutrientName]
            if(nutrient['units'].includes("g") && nutrientName != "Carbohydrate" && nutrientName != "Fat"){
                let amnt = nutrient['amount']
                if(nutrient['units'].includes("mg")){
                    amnt /= 1000
                }
                if (amnt > 0.001) { 
                    newGraphData.push({
                        value: Math.abs(Math.log(amnt)) * 10, //Scaling for graph
                        labelComponent: () => (
                            <Text style={{fontSize: 10, textAlign: 'center', color: 'black'}}>
                              {wrapLabel(nutrientName)}
                            </Text>
                          ), //Adding newlines,
                        frontColor: '#177AD5',
                        topLabelComponent: () => (
                            <Text style={{color: 'black', fontSize: 12}}>{ Math.round(amnt * 100) / 100}</Text> // actual amount
                          ),
                    });
                }
            }
        })

        setGraphData(newGraphData)
    }, [trackedNut])

    // Loading data on page reload
    useEffect(() => {
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

                    await AsyncStorage.setItem("trackedNut", "{}")
                    await AsyncStorage.setItem("trackedMeals", "{}")
                }

                //Handling cache separately 
                let trackedNut = await AsyncStorage.getItem("trackedNut")
                let trackedMeals = await AsyncStorage.getItem('trackedMeals')
                trackedNut =  trackedNut ? JSON.parse(trackedNut) : {}
                trackedMeals = trackedMeals ? JSON.parse(trackedMeals) : {}
                setTrackedNut(trackedNut)
                setTrackedMeals(trackedMeals)

            
            } catch (error) {
                console.error("Error loading nutrition data:", error);
            }
        }

        load();
    }, []);

    return (
        <View className='h-full'>
            <FoodModal 
                    visible={showFoodModal}
                    data={selectedItem}
                    onClose={() => setShowFoodModal(false)}
                    mode={modalMode}
                    nutState={setTrackedNut}
                    mealsState={setTrackedMeals}
                    previousServings={prevServings}
            />
            
            <ScrollView className={`bg-white ${showFoodModal ? "opacity-25" : "opacity-100"}`}>
                <View className="bg-black border-b-4 px-4 py-4">
                    <Text className="text-4xl font-bold text-white mb-4">Tracked meals</Text>
                </View>

                    


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
                            {Object.keys(nut)
                                .filter(meal => 
                                    searchTerm === '' || 
                                    meal.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((meal, idx) => (
                                    <TouchableOpacity key={idx} className="border-b border-gray-200 p-2 hover:bg-gray-400"
                                    onPress={() => {
                                        setSelectedItem({
                                            "name" : meal,
                                            "data" : nut[meal]
                                        })
                                        setModalMode("add")
                                        setPrevServings(1)
                                        setShowFoodModal(true)
                                    }}
                                    >
                                        <Text className="text-lg">
                                            {meal.replace("&amp;", "&")}
                                        </Text>

                                        {Object.keys(nut[meal]).includes("calories_per_serving") ? (
                                            <View className = "flex-row">

                                                <Text className="text-sm text-gray-600">
                                                    Calories: {nut[meal]["calories_per_serving"] + "    "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Carb: {remove_last(nut[meal]["Total Carbohydrate."]) + "   "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Protein: {remove_last(nut[meal]["Protein"]) + "  "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Fat: {remove_last(nut[meal]["Total Fat"]) + "    "}
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


                {Object.keys(trackedNut).includes("calories_per_serving") && 
                        <Text className = "text-2xl font-bold m-auto">Total Calories: {trackedNut['calories_per_serving']['amount']}</Text>
                    }

                <View style = {{ transform: [{ scale: 0.8 }] }}>
                    {graphData.length > 0 ? (
                                    <ScrollView horizontal vertical className = "m-auto w-auto" style = {{container: {
                                        flex: 1,
                                        justifyContent: 'center', // Centers vertically
                                        alignItems: 'center', // Centers horizontally
                                      }}}>

                                       <BarChart
                                        data={graphData}
                                        height={graphData.length * 75} // keep this
                                        barWidth={40}
                                        spacing={40}
                                        initialSpacing={0} // removes extra space at the start
                                        endSpacing={0}     // removes extra space at the end
                                        roundedTop
                                        roundedBottom
                                        hideRules
                                        yAxisThickness={0}
                                        yAxisTextStyle={{color: 'gray'}}
                                        noOfSections={4}
                                        xAxisLabelsVerticalShift={0}  // Adjusted to 0 for better alignment
                                        labelsExtraHeight={10}         // Reduced height to avoid pushing labels too far
                                        labelWidth={50}               // Ensure enough space for the longest label
                                        xAxisLabelTextStyle={{
                                            fontSize: 10,
                                        
                                            color: 'black',
                                            paddingBottom: 5,            // Optional: adjust vertical alignment
                                        }}
                                        xAxisLength={graphData.length * 50}  // Adjust length to fit all labels properly
                                        />

                    
                                    </ScrollView>
                                    ) : (
                                        <Text >No nutrition data available</Text>
                                    )}
                </View>


            <Text className = "font-bold text-xl">Today's Meals:</Text>
            {Object.keys(trackedMeals).map(food => {
    
                return (
                    <TouchableOpacity key = {food} className="border-b border-gray-200 p-2 hover:bg-gray-400"
                    onPress={() => {
                        setSelectedItem({
                            "name" : food,
                            "data" : nut[food]
                        })
                        setModalMode("edit")
                        setPrevServings(trackedMeals[food])
                        setShowFoodModal(true)
                    }}
                    >
                                        <View className='flex-row'>
                                            <Text className="text-lg">
                                                {food.replace("&amp;", "&") + "   "}
                                            </Text>
                                            <Text className="italic text-md">
                                                Servings: {trackedMeals[food]} 
                                            </Text>
                                        </View>

                                        {Object.keys(nut[food]).includes("calories_per_serving") ? (
                                            <View className = "flex-row">

                                                <Text className="text-sm text-gray-600">
                                                    Calories: {nut[food]["calories_per_serving"] + "    "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Carb: {remove_last(nut[food]["Total Carbohydrate."]) + "   "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Protein: {remove_last(nut[food]["Protein"]) + "  "}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    Fat: {remove_last(nut[food]["Total Fat"]) + "    "}
                                                </Text>

                                            
                                            </View>
                                        ) : (
                                            <Text className="text-sm text-red-500 italic">
                                                Nutrition Not Available
                                            </Text>
                                        )}

                    </TouchableOpacity>
                )
            })}

                
            </ScrollView>


            
        </View>
    );
};
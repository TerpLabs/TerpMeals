import { Text, View, ScrollView, TextInput, TouchableOpacity, Image, Touchable } from 'react-native';
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DBAPI_URI } from '@env';
import FoodModal from './modals/FoodModal';
import { getMenu, getNutrition } from 'utils/cache_and_data';

export default ({ navigation }) => {
    // State
    const [data, setData] = useState({});
    const [selectedHall, setSelectedHall] = useState("Y");
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedItem, setSelectedItem] = useState({})

    const [showFoodModal, setShowFoodModal] = useState(false)
    const [nut, setNut] = useState({});

    // Filter function for search
    const filteredItems = [];
    if (data[selectedHall]) {
        Object.keys(data[selectedHall]).forEach(meal => {
            if (meal !== "name" && meal !== "link") {
                Object.keys(data[selectedHall][meal]).forEach(dish => {
                    Object.keys(data[selectedHall][meal][dish]).forEach(item => {
                        if (item.toLowerCase().includes(searchTerm.toLowerCase())) {
                            filteredItems.push({
                                meal,
                                dish,
                                item,
                                tags: data[selectedHall][meal][dish][item]
                            });
                        }
                    });
                });
            }
        });
    }

    // Loading data
    useEffect(() => {


        async function load() {
            setData(await getMenu())
            setNut(await getNutrition())
        }
        load();
    }, []);

    return (
        <ScrollView>
            
            <FoodModal 
                            visible={showFoodModal}
                            data={selectedItem}
                            onClose={() => setShowFoodModal(false)}
                            mode = 'add'
            />

            <ScrollView className={`bg-white ${showFoodModal ? "opacity-25" : "opacity-100"}`}>
               
                <View className="bg-black border-b-4 px-4 py-4">
                    <Text className="text-4xl font-bold text-white mb-4">Today's Menu</Text>
                    
                    <TextInput
                        placeholder="Search menu items..."
                        className="text-xl border-2 border-black w-full p-2 bg-white"
                        onChangeText={setSearchTerm}
                        onFocus={() => setShowSearchResults(true)}
                        onBlur={() => setShowSearchResults(false)}
                        value={searchTerm}
                    />
                </View>

                
                <View className="flex-row justify-center my-4">
                    {[
                        { label: 'Yahentamitsi', value: 'Y' },
                        { label: 'North', value: 'North' },
                        { label: 'South', value: 'South' },
                    ].map((diningHall, id) => (
                        <TouchableOpacity
                            key={id}
                            className={`px-4 py-2 mx-2 rounded-lg ${
                                selectedHall === diningHall.value 
                                    ? "bg-black text-white" 
                                    : "bg-gray-200"
                            }`}
                            onPress={() => setSelectedHall(diningHall.value)}
                        >
                            <Text className={selectedHall === diningHall.value ? "text-white" : "text-black"}>
                                {diningHall.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Search results (when searching) */}
                {showSearchResults && searchTerm && (
                    <ScrollView className="border-2 border-gray-300 mx-4 mb-4 max-h-64">
                        {filteredItems.length > 0 ? (
                            filteredItems.map(({ item, tags }, idx) => (

                                <TouchableOpacity key={idx} className="border-b border-gray-200 p-3 hover:bg-gray-400"
                                onPress={() => {
                                    setSelectedItem({
                                        "name" : item,
                                        "data" : nut[item]
                                    })
                                    setShowFoodModal(true)
                                }}
                                >
                                    <Text className="text-lg font-semibold">{item.replace("&amp;", "&")}</Text>
                                    <View className="flex-row flex-wrap mt-2">
                                        {tags.map((tag, idz) => (
                                            <Image 
                                                key={idz}
                                                source={tag[1]} 
                                                className="w-6 h-6 mx-1"
                                            />
                                        ))}
                                    </View>
                                </TouchableOpacity>

                            ))
                        ) : (
                            <Text className="p-3 text-gray-500">No items found</Text>
                        )}
                    </ScrollView>
                )}

                {/* Regular menu display (when not searching) */}
                {!showSearchResults && data[selectedHall] && (
                    <ScrollView className="px-4">
                        <Text className="text-2xl font-bold my-2">{data[selectedHall].name}</Text>
                        
                        {Object.keys(data[selectedHall]).map((meal, i) => {
                            if (meal !== "name" && meal !== "link") {
                                return (
                                    <View key={i} className="mb-6">
                                        <Text className="text-xl font-bold my-2">{meal}</Text>
                                        
                                        {Object.keys(data[selectedHall][meal]).map((dish, idx) => (
                                            <View key={idx} className="mb-4">
                                                <Text className="text-lg italic text-gray-600">{dish}</Text>
                                                
                                                {Object.keys(data[selectedHall][meal][dish]).map((item, idy) => (
                                                    
                                                    <TouchableOpacity
                                                        key={idy} 
                                                        className="border-b border-gray-200 py-3 hover:bg-gray-400"
                                                        onPress={() => {
                                                            setSelectedItem({
                                                                "name" : item,
                                                                "data" : nut[item]
                                                            })
                                                            setShowFoodModal(true)
                                                        }}
                                                    >
                                                        <Text className="text-lg font-semibold">
                                                            {item.replace("&amp;", "&")}
                                                        </Text>
                                                        <View className="flex-row flex-wrap mt-2">
                                                            {data[selectedHall][meal][dish][item].map((tag, idz) => (
                                                                <Image 
                                                                    key={idz}
                                                                    source={tag[1]} 
                                                                    className="w-6 h-6 mx-1"
                                                                />
                                                            ))}
                                                        </View>
                                                    </TouchableOpacity>

                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                );
                            }
                        })}
                    </ScrollView>
                )}
            </ScrollView>
        </ScrollView>
    );
};
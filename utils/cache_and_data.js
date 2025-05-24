import AsyncStorage from '@react-native-async-storage/async-storage';
import { DBAPI_URI } from '@env';
import axios from 'axios';

//Utils for cache, db, and api calls

//This is used throughout for re-reteiving info
async function dailyUpdate(){
    let currentDay = new Date().getDay();
    let lastUpdated = await AsyncStorage.getItem("lastUpdated")
    if (lastUpdated != currentDay && true){
        
        let response = await fetch(DBAPI_URI + "/get-meals-info");
        let menuData = await response.json();
        await AsyncStorage.setItem("menu", JSON.stringify(menuData));  
        
        response = await fetch(DBAPI_URI + "/get-nutrition");
        let nutData = await response.json();
        await AsyncStorage.setItem("nut", JSON.stringify(nutData));

        await AsyncStorage.setItem("trackedNut", "{}")
        await AsyncStorage.setItem("trackedMeals", "{}")
    }

}



//These are the meals a user creates and not their tracked meals
export async function getMeals(){
    
    let meals = await AsyncStorage.getItem("meals")
    if(!meals){
        meals = '{}'
        await AsyncStorage.setItem('meals', "{}")
    }
    return JSON.parse(meals)
}


export async function updateMeals(meals){
    await AsyncStorage.setItem('meals', JSON.stringify(meals))
    let userData = JSON.parse(await AsyncStorage.getItem("userData"))['user']
    userData['savedMeals'] = meals
    const { data } = await axios.put(
        DBAPI_URI + "/users/update/" + userData['_id'],
        userData
    );

    if(!data.error){
        await AsyncStorage.setItem("userData", JSON.stringify(userData))
    }
}




//Menu + Nutrition
export async function getMenu(){
    await dailyUpdate()
    let cachedData = await AsyncStorage.getItem("menu");
    return JSON.parse(cachedData).data
}


export async function getNutrition(){
    await dailyUpdate()
    let cachedData = await AsyncStorage.getItem("nut");
    let nut = JSON.parse(cachedData).macros
    //Adding saved meals, which for now aren't in cached Nutrition to avoid unpredictability
    let meals = await getMeals()

    Object.keys(meals).forEach((name) => {
        let data = meals[name]['nut']
        Object.keys(data).forEach((k) => {
            let info = data[k]
            info = `${info.amount} ${info.units}`
            data[k] = info
        })
        nut[name] = data
    })
    console.log(nut)
    return nut
}


export async function getTrackedMeals(){
    await dailyUpdate()
    let trackedMeals = await AsyncStorage.getItem('trackedMeals')
    return JSON.parse(trackedMeals)
}


export async function getTrackedNut(){
    await dailyUpdate()
    let trackedNut = await AsyncStorage.getItem("trackedNut")
    return JSON.parse(trackedNut)
}


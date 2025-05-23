import AsyncStorage from '@react-native-async-storage/async-storage';
import { DBAPI_URI } from '@env';

//Utils to get and daily update cache when needed and retreive specific items

//Used throughout for re-reteiving info
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


export async function getMenu(){
    await dailyUpdate()
    let cachedData = await AsyncStorage.getItem("menu");
    return JSON.parse(cachedData).data
}


export async function getNutrition(){
    await dailyUpdate()
    let cachedData = await AsyncStorage.getItem("nut");
    console.log(JSON.parse(cachedData).macros)
    return JSON.parse(cachedData).macros
}


export async function getTrackedMeals(){
    await dailyUpdate()
    let trackedMeals = await AsyncStorage.getItem('trackedMeals')
    return trackedMeals
}


export async function getTrackedNut(){
    await dailyUpdate()
    let trackedNut = await AsyncStorage.getItem("trackedNut")
    return trackedNut
}


export async function getMeals(){
    //These are the meals a user creates and not their tracked meals
    let meals = JSON.parse(await AsyncStorage.getItem("meals"))
    if(!meals){
        meals = {}
        await AsyncStorage.setItem("{}")
    }
    return meals
}


export async function updateMeals(meals){
    await AsyncStorage.setItem('meals', JSON.stringify(meals))
    console.log(JSON.parse(await AsyncStorage.getItem("userData")))
}


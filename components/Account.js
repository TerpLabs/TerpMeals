import {Text, View, ScrollView, TouchableOpacity} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native";

export default ({navigation}) => {
    
    const [userData, setUserData] = useState({})

    async function getUserData(){
        let data = await AsyncStorage.getItem("userData")
        return data
    }

    async function logout(){
        await AsyncStorage.setItem("userData", '{}')
        navigation.navigate("Login")
    }

    useEffect(() => {
        const set = async () => {
            let x = await getUserData()
            setUserData(x)
        }
        set()
    
    }, [])

    return (
        <View>
            <Text>Account</Text>
            <Text>{JSON.stringify(userData)}</Text>
            

            <TouchableOpacity
            onPress={() => {
                logout()
            }}
            >Logout</TouchableOpacity>
        </View>
    )
}
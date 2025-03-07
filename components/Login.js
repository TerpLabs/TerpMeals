import {Text, View, TextInput, Button} from "react-native"
import { useState } from "react";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import {ACCESS_KEY_ID, SECRET_ACCESS_KEY} from "@env"

export default ({navigation}) => {
    //State
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")

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
        Payload: JSON.stringify(payload) //For get: JSON.stringify({"GET": true})
      };
      const command = new InvokeCommand(input);
      const response = await client.send(command);
      const decodedPayload = new TextDecoder("utf-8").decode(response.Payload);
      return JSON.parse(decodedPayload).body
    }


    async function handleLogin(){
        if(username == "" || password == ""){
            setErr("Invalid Login")
        }
        else{
            let account = await invoke({"command" : "find", "username" : username})
            if(account == '[]'){
                setErr("Account not found")
            }
            else{
                let split = account.split('password')[1].split(",")[0].split('":"')[1]
                if(split == password + '"'){
                    setErr("Successfully logged in")
                }
                else{
                    setErr("Invalid Username or Password")
                }
            }
        }
    }

    return (
        <View className = "items-center">
            <Text className = "text-xl font-bold">Welcome Back!</Text>
            <Text>Login to your TerpMeals account to get started</Text>

            <View>
            <Text aria-label="username" nativeID="username">Username</Text>
            <TextInput aria-label="username" aria-labelledby="username" onChangeText={setUsername} />
            </View>

            <View>
            <Text aria-label="pswd" nativeID="pswd">Password</Text>
            <TextInput aria-label="pswd" aria-labelledby="pswd" onChangeText={setPassword} />
            </View>

            <Button title = "Login" onPress={handleLogin}></Button>

            <Text className = "text-red-500 font-bold">{err}</Text>



            <Text className = "font-italic" onPress={() => {
                navigation.navigate("Create")
            }}>Don't have an account?</Text>
            <Text className = "font-italic">Forgot Password?</Text>
            <Text className = "font-italic">Enter as guest</Text>

        </View>
    )
}
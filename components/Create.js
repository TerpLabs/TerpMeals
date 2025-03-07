import {Text, View, TextInput, Button} from "react-native"
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import {ACCESS_KEY_ID, SECRET_ACCESS_KEY} from "@env"
import { useState } from "react";


export default ({navigation}) => {

    //State
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
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

    async function handleCreate() {
        if (username == "" || password == "") {
          setErr("Username and Password can't be empty");
        }else{
            const existing = await invoke({ command: "find", email: email })
            if(existing != '[]'){
                setErr("Email alreay in use")
            }
            else{
                await invoke({command: "add", username: username, password: password, email: email, targets: []})
                setErr("Successfully created account")
            }
        }
    }
    


    return (
        <View className = "items-center">
            <Text className = "text-xl font-bold">Get started with TerpMeals!</Text>
            <Text>Create an account to get started</Text>
            
            <View>
            <Text aria-label="email" nativeID="email">Email</Text>
            <TextInput aria-label="email" aria-labelledby="email" onChangeText={setEmail} />
            </View>

            <View>
            <Text aria-label="username" nativeID="username">Username</Text>
            <TextInput aria-label="username" aria-labelledby="username" onChangeText={setUsername} />
            </View>

            <View>
            <Text aria-label="pswd" nativeID="pswd">Password</Text>
            <TextInput aria-label="pswd" aria-labelledby="pswd" onChangeText={setPassword} />
            </View>

            <Button title = "Create" onPress={handleCreate}></Button>

            <Text className = "text-red-500 font-bold">{err}</Text>


            <Text className = "font-italic" onPress={() => {
                navigation.navigate("Login")
            }}>Already have an account?</Text>
            <Text className = "font-italic">Enter as guest</Text>

        </View>
    )
}
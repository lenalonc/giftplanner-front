import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./constants";
import { HomeScreen } from "./page/HomePage.jsx";
import { Gifts } from "./page/Gifts.jsx";
import { EditFriendScreen } from "./components/EditFriendScreen.jsx";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ROUTES.HOME}>
        <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
        <Stack.Screen name={ROUTES.GIFTS} component={Gifts} />
        <Stack.Screen name= {ROUTES.FRIEND_EDIT} component={EditFriendScreen} options={{ title: "Izmeni prijatelja" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

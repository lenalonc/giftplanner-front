import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./constants";
import { HomeScreen } from "./page/HomePage.jsx";
import { Gifts } from "./page/Gifts.jsx";
import { EditFriendScreen } from "./page/EditFriendScreen.jsx";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AddFriendScreen } from "./page/AddFriendScreen.jsx";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ROUTES.HOME}>
        <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
        <Stack.Screen name={ROUTES.GIFTS} component={Gifts} />
        <Stack.Screen
          name={ROUTES.FRIEND_EDIT}
          component={EditFriendScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name={ROUTES.FRIEND_ADD}
          component={AddFriendScreen}
          options={{ title: "" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

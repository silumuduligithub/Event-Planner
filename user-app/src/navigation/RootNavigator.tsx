import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { VendorListingScreen } from "../screens/VendorListingScreen";
import { VendorDetailScreen } from "../screens/VendorDetailScreen";
import { DynamicEstimateScreen } from "../screens/DynamicEstimateScreen";
import { MyBookingsScreen } from "../screens/MyBookingsScreen";
import { EventsScreen } from "../screens/EventsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { EventDetailScreen } from "../screens/EventDetailScreen";
import { BookingDetailScreen } from "../screens/BookingDetailScreen";
import { SavedVendorsScreen } from "../screens/SavedVendorsScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../screens/ResetPasswordScreen";
import { PlanEventScreen } from "../screens/PlanEventScreen";

export type AuthStackParams = { Welcome: undefined; Login: undefined; Register: undefined; ForgotPassword: undefined; ResetPassword: { token: string } };
export type TabParams = {
  Home: undefined;
  Search: undefined;
  Events: undefined;
  Bookings: undefined;
  Profile: undefined;
};
export type MainStackParams = {
  Tabs: NavigatorScreenParams<TabParams>;
  PlanEvent: { occasion?: string } | undefined;
  VendorListing: { category?: string; occasion?: string; eventId?: string; city?: string; search?: string; intent?: 'single_service' | 'full_event_package' };
  VendorDetail: { vendorId: string; occasion?: string; eventId?: string; intent?: 'single_service' | 'full_event_package' };
  DynamicEstimate: { vendorId: string; occasion?: string; eventId?: string; intent?: 'single_service' | 'full_event_package'; serviceId?: string; artistId?: string };
  EventDetail: { eventId: string };
  BookingDetail: { bookingId: string };
  SavedVendors: undefined;
  EditProfile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const MainStack = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.indigo,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 64,
          paddingTop: 7,
          paddingBottom: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<keyof TabParams, keyof typeof Ionicons.glyphMap> =
            {
              Home: "home-outline",
              Search: "search-outline",
              Events: "calendar-outline",
              Bookings: "receipt-outline",
              Profile: "person-outline",
            };
          return (
            <Ionicons
              name={
                focused
                  ? (
                      {
                        Home: "home",
                        Search: "search",
                        Events: "calendar",
                        Bookings: "receipt",
                        Profile: "person",
                      } as Record<
                        keyof TabParams,
                        keyof typeof Ionicons.glyphMap
                      >
                    )[route.name]
                  : icons[route.name]
              }
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Search" component={SearchScreen} />
      <Tabs.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: "My Events" }} />
      <Tabs.Screen name="Bookings" component={MyBookingsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.soft,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.indigo} size="large" />
      </View>
    );
  return (
    <NavigationContainer linking={{ prefixes: ['eventlycustomer://'], config: { screens: { ResetPassword: 'reset-password' } } }}>
      {user ? (
        <MainStack.Navigator
          screenOptions={{
            headerTintColor: colors.slate,
            headerStyle: { backgroundColor: colors.soft },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.soft },
          }}
        >
          <MainStack.Screen
            name="Tabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <MainStack.Screen
            name="VendorListing"
            component={VendorListingScreen}
            options={{ headerShown: false }}
          />
          <MainStack.Screen name="PlanEvent" component={PlanEventScreen} options={{ title: "Plan an event" }} />
          <MainStack.Screen
            name="VendorDetail"
            component={VendorDetailScreen}
            options={{ headerShown: false }}
          />
          <MainStack.Screen
            name="DynamicEstimate"
            component={DynamicEstimateScreen}
            options={{ title: "Get Your Estimate" }}
          />
          <MainStack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "My Event" }} />
          <MainStack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: "Booking Details" }} />
          <MainStack.Screen name="SavedVendors" component={SavedVendorsScreen} options={{ title: "Saved Vendors" }} />
          <MainStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
        </MainStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

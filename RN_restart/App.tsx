import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// tyep ----
// 로케이션 데이터
interface LocationData {
  country: string | null;
  city: string | null;
  district: string | null;
}

// 날씨 데이터
interface Data {
  weather: { description: string }[];
}
// ---------

const App = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [ok, setOk] = useState<boolean>(true);
  const [days, setDays] = useState<Array<string> | null>(null);

  const { EXPO_PUBLIC_WEATHER_API_KEY } = process.env;

  // 위치 API요청 // useEffect Hook
  useEffect(() => {
    const ask = async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setOk(false);
      }
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({ accuracy: 5 });

      const locationData = await Location.reverseGeocodeAsync(
        { latitude, longitude },
        { useGoogleMaps: false }
      );

      if (locationData) {
        let locationDataMake = {
          country: locationData[0].country,
          city: locationData[0].city,
          district: locationData[0].district,
        };

        // setLocation(locationDataMake);
      }

      // 5일치, 3시간 간격의 날씨정보 API 요청
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${EXPO_PUBLIC_WEATHER_API_KEY}`
      );

      // 필요한건 3시간 간격의 날씨가 아니라 데일리 날씨라 00시 기준으로
      // 데이터 필터링
      let pre = 0;
      const filterData = await response.data.list
        .filter((_: Data, index: number) => {
          if (index === 0) {
            return true;
          } else if (index === 4) {
            pre = index;
            return true;
          } else if (index === pre + 8) {
            pre = index;
            return true;
          }
        })
        .map((el: Data) => el.weather[0].description);

      setDays(filterData);
    };
    ask();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.city}>
        <Text style={styles.cityName}>
          {location === null ? (
            <ActivityIndicator />
          ) : (
            `${location.country} ${location.city} ${location.district}`
          )}
        </Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        <View style={styles.day}>
          <Text style={styles.temp}>27</Text>
          <Text style={styles.desc}>sunny</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fce7dc",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 25,
    fontWeight: "500",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp: { marginTop: 30, fontSize: 178 },
  desc: { marginTop: -30, fontSize: 60 },
});

export default App;

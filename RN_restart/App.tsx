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
  main: { temp: number };
}

// 필터링한 데이터
interface ArrData {
  temp: number;
  weather: string;
}
// ---------

const App = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [ok, setOk] = useState<boolean>(true);
  const [days, setDays] = useState<Array<ArrData>>([]);

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

        setLocation(locationDataMake);
      }

      // 5일치, 3시간 간격의 날씨정보 API 요청
      const changeMeasurement = "metric";
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${EXPO_PUBLIC_WEATHER_API_KEY}&units=${changeMeasurement}`
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
        .map((el: Data) => {
          return { weather: el.weather[0].description, temp: el.main.temp };
        });

      setDays(filterData);
    };
    ask();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.city}>
        {location === null ? (
          <ActivityIndicator size="large" color="red" />
        ) : (
          <>
            <Text style={styles.countryName}>
              {location.country} {location.city}
            </Text>
            <Text style={styles.distName}> {location.district}</Text>
          </>
        )}
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              size="large"
              color="red"
              style={{ marginTop: 30 }}
            />
          </View>
        ) : (
          days.map((el, index) => (
            <View style={styles.day} key={index}>
              <Text style={styles.temp}>{el.temp.toFixed(1)}</Text>
              <Text style={styles.desc}>{el.weather}</Text>
            </View>
          ))
        )}
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
  countryName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 5,
  },
  distName: {
    fontSize: 38,
    fontWeight: "500",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    // backgroundColor: "red",
  },
  temp: { fontSize: 140, paddingLeft: 20 },
  desc: { marginTop: -20, fontSize: 25, paddingLeft: 40 },
});

export default App;

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

const App = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [ok, setOk] = useState<boolean>(true);
  const [days, setDays] = useState<Array<DatesObject>>([]);

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

      const dates: string[] = await response.data.list.map((el: Data) =>
        el.dt_txt.slice(0, 10)
      );

      const datesArr: Array<DatesObject> = [...new Set(dates)].map(
        (date: string) => {
          let elements = response.data.list
            .filter((rawData: Data) => rawData.dt_txt.slice(0, 10) === date)
            .map((rawData: Data) => {
              let [hour] = rawData.dt_txt.slice(11).split(":");

              let newData: NewData = {
                time: Number(hour),
                weather: rawData.weather[0].description,
                temp: rawData.main.temp,
              };

              return newData;
            });

          let obj: DatesObject = { date, elements };
          return obj;
        }
      );

      console.log(datesArr);

      setDays(datesArr);
    };
    ask();
  }, []);

  console.log(new Date());

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
              <Text style={styles.date}>{el.date}</Text>
              {el.elements.map((time) => (
                <Text style={styles.desc}>{time.time}</Text>
              ))}
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
  date: { fontSize: 20, paddingLeft: 20 },
  temp: { fontSize: 140, paddingLeft: 20 },
  desc: { marginTop: -20, fontSize: 25, paddingLeft: 40 },
});

export default App;

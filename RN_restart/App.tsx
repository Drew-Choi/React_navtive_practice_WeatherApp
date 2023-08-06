import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
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
  const [currentTime, setCurrentTime] = useState<any | null>(null);

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

      const [{ country, city, district, timezone }] =
        await Location.reverseGeocodeAsync(
          { latitude, longitude },
          { useGoogleMaps: false }
        );

      if (country && timezone) {
        // 사용자 국가 & 도시 & 동네 등
        let locationDataMake = {
          country,
          city,
          district,
        };
        // 시간대별 날씨를 보여주기 위한 사용자 현재 시각 구하기
        const nowUTC = new Date();
        // UTC형식을 timezone기준으로 바꾸기, timezone은 reverseGeocodeAsync API에서 얻을 수 있음
        const formatting = new Intl.DateTimeFormat("default", {
          timeZone: timezone,
          hour: "numeric",
          hourCycle: "h23",
        });
        // UTC형식을 사용자 locale에 맞춰 바꾸기
        const currentTime = formatting.format(nowUTC);

        // 모든 데이터를 state로 보관
        setLocation(locationDataMake);
        setCurrentTime(currentTime);
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
      setDays(datesArr);
    };
    ask();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.cityContainer}>
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
              {el.elements.map((item, idx) =>
                index === 0 ? (
                  <View key={idx}>
                    <Text style={styles.temp}>
                      {currentTime >= item.time && item.time + 3 > currentTime
                        ? item.temp.toFixed(1)
                        : null}
                    </Text>
                    <Text style={styles.desc}>
                      {currentTime >= item.time && item.time + 3 > currentTime
                        ? item.weather
                        : null}
                    </Text>
                  </View>
                ) : (
                  <View key={idx}>
                    <Text style={styles.temp}>
                      {item.time === 9 ? item.temp.toFixed(1) : null}
                    </Text>
                    <Text style={styles.desc}>
                      {item.time === 9 ? item.weather : null}
                    </Text>
                  </View>
                )
              )}
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
  cityContainer: {
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
  day: {
    width: SCREEN_WIDTH,
    // backgroundColor: "red",
  },
  tempContainer: {
    backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center",
  },
  date: { fontSize: 20, paddingLeft: 20 },
  temp: { fontSize: 140, paddingLeft: 20 },
  desc: { marginTop: -20, fontSize: 25, paddingLeft: 30, color: "gray" },
});

export default App;

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
  dt_txt: string;
}

// 날씨 데이터 날짜 필터용
interface DatesObject {
  date: string;
  elements: NewData[];
}

interface NewData {
  time: number,
  weather: string,
  temp: number,
}

// ---------
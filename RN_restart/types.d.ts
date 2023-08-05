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
  time: number[];
  weather?: string;
  temp?: number;
}

interface NewData {
  times: number[],
  weather: string[],
  temp: number[],
}

// 필터링한 데이터
interface ArrData {
  temp: number;
  weather: string;
}
// ---------
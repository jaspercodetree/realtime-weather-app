// 引入React才能使用component  引入useState來使用hooks
import React, { useEffect, useState } from 'react';

// 引入emotion套件
import styled from '@emotion/styled';
// 引入ThemeProvider
import { ThemeProvider } from '@emotion/react';

// 透過react建立時提供的元件名稱ReactComponent  逐一將要引入的svg檔案改成component  並修改成想要的名字 ex:DayCloudyIcon
import { ReactComponent as DayCloudyIcon } from './images/day-cloudy.svg';
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RefreshIcon } from './images/refresh.svg';
import { ReactComponent as LoadingIcon } from './images/loading.svg';

//引入dayjs解決Safari 不支援 new Date('2021-12-12 10:10:00') 字串的問題
import dayjs from 'dayjs';

// 透過emotion把JSX改成component, 此處都是div
const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.backgroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`;

// 可以把下面code移進去``  透過觀察props 看到從父層傳來的 theme資料
// ${(props) => console.log(props)}
const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};
  svg {
    width: 15px;
    height: 15px;
    margin-left: 10px;
    cursor: pointer;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};
  }

  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`;

// 將原本存在的svg  新增樣式 DayCloudy
const DayCloudy = styled(DayCloudyIcon)`
  flex-basis: 30%;
`;

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const AUTHORIZATION_KEY = 'CWB-3D1D7CD4-71F0-4ED6-8753-0EA6A7ED379F';
const LOCATION_NAME = '臺北';
const LOCATION_NAME_FORECAST = '臺北市';

const fetchCurrentWeather = function () {
  // console.log(123);

  // 為了要讓除了一開始載入外，當按下refresh時也要去顯示loading狀態的圖示，因此要再按下按鈕時，重設isLoading=true，更改setState
  // 此外，setState如果帶入function，可以取得前一次的資料狀態
  // 先利用解構賦值和展開...拿到整個物件prevState，再讓後面引入的屬性蓋掉前面重複的部分
  // 小括弧（） 不用會報錯，要小心

  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);

      const locationData = data.records.location[0];
      // console.log(locationData);

      //比較困難的，整理array後去拿裡面的 WDSD 和 TEMP
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['WDSD', 'TEMP'].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );
      // console.log(weatherElements);

      // 因為有兩支API 每次拉下來都要先保留原先的資料 再補資料  利用setState裡面放function 即可先接資料
      return {
        locationName: locationData.locationName,
        windSpeed: weatherElements.WDSD,
        temperature: Math.round(weatherElements.TEMP),
        observationTime: locationData.time.obsTime,
      };
    });
};

const fetchWeatherForecast = function () {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME_FORECAST}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      // console.log(locationData);

      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

const App = () => {
  console.log('invoke function component');
  //設定可變動的主題樣式
  const [currentTheme, setCurrentTheme] = useState('light');

  //設定可變動的資料
  //first：先把資料寫死來測試
  //當兩支ＡＰＩ都寫好時  就可以把它清空
  const [weatherElement, setWeatherElement] = useState({
    locationName: '',
    description: '',
    windSpeed: 0,
    temperature: 0,
    rainPossibility: 0,
    observationTime: new Date(),
    comfortability: '0',
    weatherCode: '0',
    isLoading: true,
  });

  //可以透過解構賦值，讓JSX可以寫得更精簡 weatherElement.locationName 改成只要寫locationName
  const {
    locationName,
    description,
    comfortability,
    windSpeed,
    temperature,
    rainPossibility,
    observationTime,
    isLoading,
  } = weatherElement;

  //second: 即將利用setWeatherElement去接下面fetch來的資料

  // 利用useEffect 讓畫面一載入 以及按refresh時都更新

  //透過async 去等 回傳回來的兩個promise function
  useEffect(() => {
    console.log('execute function in useEffect');

    // const fetchData = async () => {
    //   const data = await Promise.all([
    //     fetchCurrentWeather(),
    //     fetchWeatherForecast(),
    //   ]);

    //   console.log(data);
    // };

    // 改寫成解構賦值  等到兩個值都拿到後再setState
    const fetchData = async () => {
      //拉取資料前先設定isLoading:false 因為現在沒有預設值
      //箭頭函式 如果有return必須包小括號
      setWeatherElement((prevState) => ({ ...prevState, isLoading: false }));

      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false,
      });
    };

    fetchData();
  }, []);

  return (
    // 透過ThemeProvider 可以將 theme=theme.dark 放進其包住的每一個component
    // 如同 <Container theme=theme.dark> <WeatherCard theme=theme.dark>...每一個都建好 可傳值props給子層
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log('render')}
        <WeatherCard>
          {/* 因為解構賦值所以改為下面<Location>{currentWeather.locationName}</Location> */}
          <Location>{locationName}</Location>
          <Description>
            {description} {comfortability}
          </Description>
          <CurrentWeather>
            <Temperature>
              {temperature}
              <Celsius>°C</Celsius>
            </Temperature>
            <DayCloudy />
          </CurrentWeather>
          <AirFlow>
            <AirFlowIcon />
            {windSpeed} m/h
          </AirFlow>
          <Rain>
            <RainIcon />
            {rainPossibility} %
          </Rain>
          {/* 按下refresh 去啟動 function handleClick 去fetch 氣象局的資料 */}
          {/* 後面加入 useEffect 讓畫面一載入 以及按refresh時都更新 因此改handleClick名為fetchCurrentWeather */}
          {/* 透過將isLoading現在的狀態傳給子層，裡用css in js的特性可以直接處理判斷 */}

          {/* 多了要拉第二支ＡＰＩ後 記得onclick要再加上fetchWeatherForecast */}
          <Refresh
            onClick={() => {
              fetchCurrentWeather();
              fetchWeatherForecast();
            }}
            isLoading={isLoading}
          >
            {/* 我們只想顯示小時與分鐘  因此做以下改寫  
                1.利用intl換成台灣顯示 2.並且使用dayjs修復safari無法顯示字串時間的問題 */}
            {/* 原先寫法 */}
            {/* 最後觀測時間：{observationTime} */}
            最後觀測時間：
            {new Intl.DateTimeFormat('zh-TW', {
              hour: 'numeric',
              minute: 'numeric',
            }).format(dayjs(observationTime))}
            {/* 用三元不等式判斷目前狀態要用哪個icon */}
            {isLoading ? <LoadingIcon /> : <RefreshIcon />}
          </Refresh>
        </WeatherCard>
      </Container>
    </ThemeProvider>
  );
};

export default App;

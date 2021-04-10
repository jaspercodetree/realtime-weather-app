// 引入React才能使用component  引入useState來使用hooks
import React, { useState } from 'react';

// 引入emotion套件
import styled from '@emotion/styled';
// 引入ThemeProvider
import { ThemeProvider } from '@emotion/react';

// 透過react建立時提供的元件名稱ReactComponent  逐一將要引入的svg檔案改成component  並修改成想要的名字 ex:DayCloudyIcon
import { ReactComponent as DayCloudyIcon } from './images/day-cloudy.svg';
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RefreshIcon } from './images/refresh.svg';

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

// 可以透過觀察props 看到從父層傳來的 theme資料
const Location = styled.div`
  ${(props) => console.log(props)}
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

const App = () => {
  //設定可變動的主題樣式
  const [currentTheme, setCurrentTheme] = useState('light');

  //設定可變動的資料
  //first：先把資料寫死來測試
  const [currentWeather, setCurrentWeather] = useState({
    locationName: '臺北市',
    description: '多雲時晴',
    windSpeed: 1.1,
    temperature: Math.round(22.9),
    rainPossibility: 48.3,
    observationTime: '2020-12-12 22:10:00',
  });
  //second: 即將利用setCurrentWeather去接下面fetch來的資料

  //設定按鈕refresh 的fetch function
  const AUTHORIZATION_KEY = 'CWB-3D1D7CD4-71F0-4ED6-8753-0EA6A7ED379F';
  const LOCATION_NAME = '臺北';

  const handleClick = function () {
    // console.log(123);
    fetch(
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

        setCurrentWeather({
          locationName: locationData.locationName,
          description: '多雲時晴',
          windSpeed: weatherElements.WDSD,
          temperature: Math.round(weatherElements.TEMP) ,
          rainPossibility: 48.3,
          observationTime: locationData.time.obsTime,
        });
      });
  };

  return (
    // 透過ThemeProvider 可以將 theme=theme.dark 放進其包住的每一個component
    // 如同 <Container theme=theme.dark> <WeatherCard theme=theme.dark>...每一個都建好 可傳值props給子層
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        <WeatherCard>
          <Location>{currentWeather.locationName}</Location>
          <Description>{currentWeather.description}</Description>
          <CurrentWeather>
            <Temperature>
              {currentWeather.temperature}
              <Celsius>°C</Celsius>
            </Temperature>
            <DayCloudy />
          </CurrentWeather>
          <AirFlow>
            <AirFlowIcon />
            {currentWeather.windSpeed} m/h
          </AirFlow>
          <Rain>
            <RainIcon />
            {currentWeather.rainPossibility} %
          </Rain>
          {/* 按下refresh 去啟動 function handleClick 去fetch 氣象局的資料 */}
          <Refresh onClick={handleClick}>
            {/* 我們只想顯示小時與分鐘  因此做以下改寫  1.利用intl換成台灣顯示 2.並且使用dayjs修復safari無法顯示字串時間的問題 */}
            {/* 原先寫法 */}
            {/* 最後觀測時間：{currentWeather.observationTime} */}
            最後觀測時間：
            {new Intl.DateTimeFormat('zh-TW', {
              hour: 'numeric',
              minute: 'numeric',
            }).format(dayjs(currentWeather.observationTime))}
            <RefreshIcon />
          </Refresh>
        </WeatherCard>
      </Container>
    </ThemeProvider>
  );
};

export default App;

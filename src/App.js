import React, { useState } from 'react';
import { Input, Typography, Space, Progress, useEffect } from 'antd';
import 'antd/dist/antd.css';
import styles from './styles/app.module.css';
import syncApi from './api/api.class';
import xpath from 'xpath';
import { DOMParser } from 'xmldom';

const serverList = {
  bera: '베라',
  scania: '스카니아',
  luna: '루나',
  elysium: '엘리시움',
  croa: '크로아',
  aurora: '오로라',
  red: '레드',
  union: '유니온',
  enosis: '이노시스',
  zenith: '제니스',
  arcane: '아케인',
  nova: '노바',
  reboot: '리부트',
  reboot2: '리부트2'
}

function App() {
  const [name, setName] = useState();
  const [foundedResult, setFoundedResult] = useState([])
  const [notFoundedResult, setNotFoundedResult] = useState([]);
  const [successTask, setSuccessTask] = useState(false);

  const [initPercent, setInitPercent] = useState(0);
  const [detailPercent, setDetailPercent] = useState(0);

  const getServerXPath = `//*[@id="user-profile"]/section/div//img[contains(@src, 'world')]`;
  const getUserLevelXPath = `//ul[@class="user-summary-list"]/li[1]/text()`;
  const getUserOverallJobXPath = `//ul[@class="user-summary-list"]/li[2]/text()`;
  const getUserTimeLineXPath = `//span[@class="font-size-12 text-gray"]/text()`;



  const syncMaple = async (value) => {
    let calcHelperInit = 0;
    setName(value);

    const values = value.split(' ');
    const initValuesLength = values.length;

    const returnValue = await Promise.all(values.map(async v => {
      const params = {
        name: v
      };

      const apiValue = await syncApi.syncMaple(params).then(({ data }) => data);

      calcHelperInit += parseInt((initPercent + (1 / initValuesLength * 100)).toFixed(2));

      console.log(calcHelperInit);

      setInitPercent(calcHelperInit);

      return { name: v, res: apiValue };
    }));

    const noErrorResult = returnValue.filter(v => !v.res.error);
    const errorResult = returnValue.filter(v => v.res.error);


    const detailValuesLength = noErrorResult.length;

    let calcHelperDetail = 0;

    const noErrorAdditionalValue = await Promise.all(noErrorResult.map(async v => {
      const params = {
        name: v.name
      }

      try {
        const apiValue = await syncApi.searchMaple(params).then(({ data }) => data);

        const doc = new DOMParser().parseFromString(apiValue);
        const serverImg = xpath.select1(getServerXPath, doc).attributes.getNamedItem('src').nodeValue;
        const serverName = serverList[Object.keys(serverList).find(v => serverImg.includes(v))];
        const userLevel = xpath.select1(getUserLevelXPath, doc).data;
        const userOverallJob = xpath.select1(getUserOverallJobXPath, doc).data;
        const userTimeLine = xpath.select1(getUserTimeLineXPath, doc).data;

        // console.log('-------------------------------');
        // console.log(serverImg);
        // console.log(serverName);
        // console.log(userLevel);
        // console.log(userOverallJob);
        // console.log(userTimeLine);
        // console.log('------------------------------- \n');

        calcHelperDetail += parseInt((detailPercent + (1 / detailValuesLength * 100)).toFixed(2));

        setDetailPercent(calcHelperDetail);

        return { name: v.name, res: {
          serverImg,
          serverName,
          userLevel,
          userOverallJob,
          userTimeLine
        } }
      } catch (e) {
        console.log(e);
      }


    }));

    setFoundedResult(noErrorAdditionalValue);
    setNotFoundedResult(errorResult);

    setInitPercent(100);
    setDetailPercent(100);

    console.log(errorResult)
    console.log(noErrorAdditionalValue);

    setSuccessTask(true);
  }

  const decodeUnicode = (unicodeString) => {
    const r = /\\u([\d\w]{4})/gi;

    unicodeString = unicodeString.replace(r, (match, grp) => String.fromCharCode(parseInt(grp, 16)));

    return unescape(unicodeString);
  }

  return (
    <div className="App">
      <Space className={styles['container-fluid']}>
        <div>
          <Typography>닉네임 검색</Typography>
          <Input.Search
            placeholder="input search text"
            onSearch={value => syncMaple(value.trim())}
            style={{ width: 200, height: 30 }}
          />
          <Typography>전체 스캔</Typography>
          <Progress
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            percent={initPercent}
          />
          <Typography>세부 정보 스캔</Typography>
          <Progress
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            percent={detailPercent}
          />
        </div>
        <Space className={styles.flexible}>
          <div>
            <p>검색 된 캐릭터 정보 <span className={styles['text-bold']}>{foundedResult.length}</span></p>
            {
              successTask ? (
                <div className={styles['printing-search-result']}>
                  {
                    foundedResult.map(v => (
                      <Space>
                        <img src={v.res.serverImg} />
                        <span>{v.res.serverName}</span>
                        <span class={styles['printing-name']}>{v.name}</span>
                        <span class={parseInt(v.res.userLevel.split('Lv.')[1]) > 61 ? styles['font-warning'] : ''}>{v.res.userLevel}</span>
                        <span>{v.res.userOverallJob}</span>
                        <span>{v.res.userTimeLine}</span>
                      </Space>
                    ))
                  }
                </div>
              ) : null
            }
          </div>
          <div>
            <p>검색되지 않은 정보 <span className={styles['text-bold']}>{notFoundedResult.length}</span></p>
            {
              successTask ? (
                <div className={styles['printing-search-result']}>
                  {
                    notFoundedResult.map(v => (
                      <Space>
                        <span class={styles['printing-name']}>{v.name}</span>
                        <span>{v.res.message}</span>
                      </Space>
                    ))
                  }
                </div>
              ) : null
            }
          </div>
        </Space>
      </Space>
    </div>
  );
}

export default App;

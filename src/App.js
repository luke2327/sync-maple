import React, { useState } from 'react';
import { Input, Typography, Space, Progress } from 'antd';
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
  reboot2: '리부트2',
  burning: '버닝',
  burning2: '버닝2'
}

function App() {
  const [name, setName] = useState([]);
  const [foundedResult, setFoundedResult] = useState([])
  const [notFoundedResult, setNotFoundedResult] = useState([]);
  const [successTask, setSuccessTask] = useState(false);
  const [prevErrResult, setPrevErrResult] = useState([]);
  const [errResult, setErrResult] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const [performance, setPerformance] = useState(0);

  const [initPercent, setInitPercent] = useState(0);
  const [detailPercent, setDetailPercent] = useState(0);

  const getServerXPath = `//*[@id="user-profile"]/section/div//img[contains(@src, 'world')]`;
  const getUserLevelXPath = `//ul[@class="user-summary-list"]/li[1]/text()`;
  const getUserOverallJobXPath = `//ul[@class="user-summary-list"]/li[2]/text()`;
  const getUserTimeLineXPath = `//span[@class="font-size-12 text-gray"]/text()`;

  const init = () => {
    setName([]);
    setFoundedResult([]);
    setNotFoundedResult([]);
    setInitPercent(0);
    setDetailPercent(0);
    setErrMsg('');
    setPrevErrResult([]);
    setErrResult([]);
    setSuccessTask(false);
    setPerformance(0);
  }

  const syncMaple = async (value) => {
      const start = window.performance.now();
      init();

      let calcHelperInit = 0;
      let calcHelperDetail = 0;

      const values = value.split(' ').filter(v => v);

      setName(values);

      console.log(values);

      const initValuesLength = values.length;

      const errResultValue = [];
      const prevErrResultValue = [];

      const returnValue = await Promise.all(values.map(async v => {
        const params = {
          name: v
        };

        try {
          const apiValue = await syncApi.syncMaple(params).then(({ data }) => data);

          calcHelperInit += parseInt((initPercent + (1 / initValuesLength * 100)).toFixed(2));

          setInitPercent(calcHelperInit);

          if (!apiValue) {
            throw new Error('Empty Result.');
          }

          return { name: v, res: apiValue };
        } catch (e) {
          prevErrResultValue.push({
            name: v,
            errMsg : '에러가 발생하였습니다. ' + e.toString()
          });
        }

      }));

      const noErrorResult = returnValue.filter(v => {
        if (v && v.res) {
          return !v.res.error
        }
      });
      const errorResult = returnValue.filter(v => {
        if (v && v.res) {
          return v.res.error
        }
      });

      const detailValuesLength = noErrorResult.length;

      console.log('step 1');

      const noErrorAdditionalValue = await Promise.all(noErrorResult.map(async v => {
        const params = {
          name: v.name
        }

        try {
          const apiValue = await syncApi.searchMaple(params).then(({ data }) => data);

          const doc = new DOMParser().parseFromString(apiValue);
          const serverImg = xpath.select1(getServerXPath, doc).attributes.getNamedItem('src').nodeValue || '';
          const serverName = serverList[Object.keys(serverList).find(v => serverImg.includes(v))] || '';
          const userLevel = xpath.select1(getUserLevelXPath, doc).data || '';
          const userOverallJob = xpath.select1(getUserOverallJobXPath, doc).data || '';
          const userTimeLine = xpath.select1(getUserTimeLineXPath, doc).data || '';

          calcHelperDetail += parseInt((detailPercent + (1 / detailValuesLength * 100)).toFixed(2));

          setDetailPercent(calcHelperDetail);

          console.log(v);

          if (
            serverImg &&
            serverName &&
            userLevel &&
            userOverallJob &&
            userTimeLine
          ) {
            return { name: v.name, res: {
              serverImg,
              serverName,
              userLevel,
              userOverallJob,
              userTimeLine
            } }
          } else {
            throw new Error('Empty Result.');
          }
        } catch (e) {
          errResultValue.push({
            name: v.name,
            errMsg: e.toString()
          });
        }
      }));

      setFoundedResult(noErrorAdditionalValue.filter(v => v));
      setNotFoundedResult(errorResult.filter(v => v));
      setErrResult(errResultValue);
      setPrevErrResult(prevErrResultValue);

      setInitPercent(100);
      setDetailPercent(100);

      setSuccessTask(true);

      const end = window.performance.now();

      setPerformance(((end - start) / 1000).toFixed(2));
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
          <Typography>갯수 : {name.length}</Typography>
          <Typography>실행 시간 : {performance}</Typography>
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
          {
            errMsg ? <Typography type="danger" className={styles['resolve-white-space']}>{errMsg}</Typography> : null
          }
        </div>
        <Space className={styles.flexible}>
          <div>
            <p>검색 된 캐릭터 정보 <span className={styles['text-bold']}>{foundedResult.length}</span></p>
            {
              successTask ? (
                <div className={styles['printing-search-result']}>
                  {
                    foundedResult.map((v, i) => (
                      <Space key={i}>
                        <img src={v.res.serverImg} />
                        <span>{v.res.serverName}</span>
                        <span className={styles['printing-name']}>{v.name}</span>
                        <span className={parseInt(v.res.userLevel.split('Lv.')[1]) > 61 ? styles['font-warning'] : ''}>{v.res.userLevel}</span>
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
                    notFoundedResult.map((v, i) => (
                      <Space key={i}>
                        <span className={styles['printing-name']}>{v.name}</span>
                        <span>{v.res.message}</span>
                      </Space>
                    ))
                  }
                </div>
              ) : null
            }
          </div>
          <div>
            <p>세부 스캔 전 에러 정보 <span className={styles['text-bold']}>{prevErrResult.length}</span></p>
            {
              successTask ? (
                <div className={styles['printing-search-result']}>
                  {
                    errResult.map((v, i) => (
                      <Space key={i}>
                        <span className={styles['printing-name']}>{v.name}</span>
                        <span>{v.errMsg}</span>
                      </Space>
                    ))
                  }
                </div>
              ) : null
            }
          </div>
          <div>
            <p>세부 스캔 후 에러 정보 <span className={styles['text-bold']}>{errResult.length}</span></p>
            {
              successTask ? (
                <div className={styles['printing-search-result']}>
                  {
                    errResult.map((v, i) => (
                      <Space key={i}>
                        <span className={styles['printing-name']}>{v.name}</span>
                        <span>{v.errMsg}</span>
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

/* eslint-disable react/jsx-indent */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Row,
  ToggleButton,
} from 'react-bootstrap';
import { ArrowClockwise } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';
import { endOfDay, startOfDay } from 'date-fns';
import { toast } from 'react-toastify';

import ContentWithTitle from 'components/ContentWithTitle';
import { getPatientInfo } from 'apis/patients';
import { getFrequencybyPeriod, getLengthbyPeriod } from 'apis/modules';
import { getDiarybyPeriod, getDiaryList } from 'apis/diary';
import { DatetoUnixTimeStamp, toStringDateByFormatting } from 'utils/date';
import { PatientInfo } from 'types/patient';
import { DiaryInfo } from 'types/diary';
import { ModuleData } from 'types/modules';
import {
  DateRangePicker,
  Diary,
  Tabs,
  TimeLine,
  CustomWordCloud,
  DisplayTooltip,
} from './components';

interface Data {
  sesssionEnd: number;
  operator: string;
  duration: number;
  length: number;
}

const radios = [
  { name: '3일 전', value: '3', id: 1 },
  { name: '7일 전', value: '7', id: 2 },
  { name: '14일 전', value: '14', id: 3 },
];

function Dashboard() {
  const [radioValue, setRadioValue] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<(null | Date)[]>([null, null]);
  const [show, setShow] = useState(true);
  const [countedNum, setCountedNum] = useState<number>(0);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>();
  const target = useRef<HTMLDivElement | null>(null);
  const [diaryList, setdiaryList] = useState<DiaryInfo[]>();
  const [tabData, setTabData] = useState<ModuleData>();

  const location = useLocation();
  const userId = location.pathname.split('/')[2];

  const fetchByPeriod = async (startDate: number, endDate: number) => {
    try {
      const diaryData = await getDiarybyPeriod(userId, startDate, endDate);
      const modulesData = await getLengthbyPeriod(userId, startDate, endDate);
      const frequencyData = await getFrequencybyPeriod(
        userId,
        startDate,
        endDate,
      ).then((data) => data.num.map((date: number) => new Date(date * 1000)));

      const lengthData = modulesData.diary.map((d: Data) => {
        const { operator, duration, ...data } = d;
        return data;
      });

      const durationdata = modulesData.diary.map((d: Data) => {
        const { operator, length, ...data } = d;
        return data;
      });

      const tab = {
        frequency: frequencyData,
        duration: durationdata,
        length: lengthData,
      };

      toast.success('데이터를 불러왔습니다.');

      setTabData(() => tab);
      setdiaryList(() => diaryData.diary);
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다.');
      console.error(error);
    }
  };

  const fetch = async () => {
    try {
      const userData = await getPatientInfo(userId);
      const diaryData = await getDiaryList(userId);

      setPatientInfo(() => userData);
      setdiaryList(() => diaryData.diary);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const onClick = () => {
    if (dateRange[0] === null || dateRange[1] === null) {
      return;
    }
    const startDate = DatetoUnixTimeStamp(dateRange[0]);
    const endDate = DatetoUnixTimeStamp(endOfDay(dateRange[1]));

    fetchByPeriod(startDate, endDate);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const today = new Date();
    const tartgetDay = startOfDay(
      new Date(
        today.setDate(
          today.getDate() - parseInt(e.currentTarget.value, 10) + 1,
        ),
      ),
    );

    setDateRange(() => [tartgetDay, endOfDay(new Date())]);
    setRadioValue(e.currentTarget.value);
  };

  const data = useMemo(
    () => [
      { text: '자해', value: 2 },
      { text: '생각', value: 2 },
      { text: '부모님', value: 2 },
      { text: '고마운', value: 1 },
      { text: '면도', value: 1 },
      { text: '그럴', value: 1 },
      { text: '나', value: 1 },
      { text: '스스로가', value: 1 },
      { text: '한심하고', value: 1 },
      { text: '모습', value: 1 },
      { text: '남들이', value: 1 },
      { text: '더더욱', value: 1 },
      { text: '바보로', value: 1 },
      { text: '자기들은', value: 1 },
      { text: '잘났나', value: 1 },
      { text: '생각도', value: 1 },
      { text: '들지만', value: 1 },
      { text: '정작', value: 1 },
      { text: '사람들', value: 1 },
      { text: '앞에서면', value: 1 },
      { text: '한', value: 1 },
      { text: '마디도', value: 1 },
      { text: '못하니까', value: 1 },
    ],
    [],
  );

  const isDateSelected =
    radioValue !== null || (dateRange[0] !== null && dateRange[1] !== null);

  return (
    <div>
      <Container>
        <Row className="gx-5">
          <Col xs={4}>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div className="fs-2 mt-2">
                {`${patientInfo?.name ?? ''} 환자의`}
                <br />
                <b>마음챙김 다이어리</b>
              </div>
            </div>
          </Col>
          <Col xs={8} className="ps-4">
            <Row className="mt-2">
              <Col xs={3}>
                <p className="fs-5 fw-bold text-primary">최근 기간 선택</p>
              </Col>
              <Col xs={9}>
                <ButtonGroup size="sm">
                  {radios.map((radio, idx) => (
                    <ToggleButton
                      key={radio.id}
                      id={`radio-${idx}`}
                      type="radio"
                      variant="outline-primary"
                      name="radio"
                      value={radio.value}
                      checked={radioValue === radio.value}
                      onChange={onChange}
                    >
                      {radio.name}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </Col>
              <Col xs={3}>
                <div className="fs-5 fw-bold text-primary my-auto">
                  분석할 날짜 지정
                </div>
              </Col>
              <Col xs={9} className="d-flex justify-content-between ">
                <DateRangePicker
                  dateRange={dateRange}
                  setDateRange={(v) => {
                    setDateRange(v);
                    setRadioValue(null);
                  }}
                />
                <Button
                  variant="primary"
                  className="my-auto"
                  disabled={!isDateSelected}
                  onClick={onClick}
                >
                  <ArrowClockwise className="ml-4" />
                  <span className="px-2 fw-bold"> 적용 </span>
                </Button>
              </Col>
            </Row>
          </Col>

          <Col xs={4} className="border-end">
            <ContentWithTitle title="환자 정보">
              <Card bg="light" border="light">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between py-2">
                    <div className="text-secondary">성별/나이</div>
                    <div className="fs-6 me-2">
                      {`${patientInfo?.gender ?? ''}/${patientInfo?.age ?? ''}`}
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between py-2">
                    <div className="text-secondary">최근 진료일</div>
                    <div className="fs-6 me-2">
                      {toStringDateByFormatting(
                        patientInfo?.recentVisitedDay
                          ? patientInfo.recentVisitedDay[
                              patientInfo.recentVisitedDay.length - 1
                            ]
                          : 0,
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </ContentWithTitle>
            <ContentWithTitle title="작성 일기 보기">
              {diaryList
                ? diaryList.map((diary) => (
                    <Diary key={diary.sessionNumber} diary={diary} />
                  ))
                : null}
            </ContentWithTitle>
          </Col>

          {tabData === undefined ? (
            <Col xs={8}>
              <div> 기간을 선택해 주세요 </div>
            </Col>
          ) : (
            <Col xs={8}>
              <ContentWithTitle title="참여 수준">
                <Tabs tabData={tabData} />
              </ContentWithTitle>
              <ContentWithTitle title="핵심 감정">
                <CustomWordCloud
                  data={data}
                  target={target}
                  setShow={setShow}
                  setCountedNum={setCountedNum}
                />
                <DisplayTooltip
                  target={target}
                  show={show}
                  countedNum={countedNum}
                />
                <Card body>핵심 감정의 나열</Card>
              </ContentWithTitle>
              <ContentWithTitle title="주요 사건">
                <Card body>
                  <TimeLine />
                </Card>
              </ContentWithTitle>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;

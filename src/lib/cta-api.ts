const BUS_API_KEY = process.env.CTA_BUS_API_KEY;
const TRAIN_API_KEY = process.env.CTA_TRAIN_API_KEY;

const BUS_BASE_URL = 'http://www.ctabustracker.com/bustime/api/v2';
const TRAIN_BASE_URL = 'http://lapi.transitchicago.com/api/1.0';
const ALERTS_BASE_URL = 'https://www.transitchicago.com/api/1.0';

export interface ArrivalPrediction {
  stopName: string;
  route: string;
  destination: string;
  arrivalTime: string;
  delay: boolean;
}

export async function getBusArrivals(stpid: string): Promise<ArrivalPrediction[]> {
  const url = `${BUS_BASE_URL}/getpredictions?key=${BUS_API_KEY}&stpid=${stpid}&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data['bustime-response'] || !data['bustime-response'].prd) {
    return [];
  }

  return data['bustime-response'].prd.map((p: any) => ({
    stopName: p.stpnm,
    route: p.rt,
    destination: p.des,
    arrivalTime: p.prdtm,
    delay: p.dly === 'true'
  }));
}

export async function getTrainArrivals(mapid: string): Promise<ArrivalPrediction[]> {
  const url = `${TRAIN_BASE_URL}/ttarrivals.aspx?key=${TRAIN_API_KEY}&mapid=${mapid}&outputType=JSON`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.ctatt || !data.ctatt.eta) {
    return [];
  }

  return data.ctatt.eta.map((e: any) => ({
    stopName: e.staNm,
    route: e.rt,
    destination: e.destNm,
    arrivalTime: e.arrT,
    delay: e.isDly === '1'
  }));
}

export async function getServiceAlerts(route?: string): Promise<any[]> {
  let url = `${ALERTS_BASE_URL}/alerts.aspx?outputType=JSON`;
  if (route) {
    url += `&routeid=${route}`;
  }
  const response = await fetch(url);
  const data = await response.json();

  if (!data.CTAAlerts || !data.CTAAlerts.Alert) {
    return [];
  }

  return data.CTAAlerts.Alert;
}

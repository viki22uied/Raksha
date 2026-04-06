export const siteClusters = [
  { name: 'Virupaksha Temple', center: [15.3358, 76.4606] as [number, number], count: 34, color: '#2f9b67' },
  { name: 'Krishna Bazaar', center: [15.3339, 76.4587] as [number, number], count: 22, color: '#3350bf' },
  { name: 'Elephant Stables', center: [15.3386, 76.4621] as [number, number], count: 19, color: '#f59e0b' },
  { name: 'Lotus Mahal', center: [15.3394, 76.4616] as [number, number], count: 14, color: '#2f9b67' },
  { name: 'Vittala Temple', center: [15.3443, 76.4752] as [number, number], count: 27, color: '#3350bf' },
  { name: 'Matanga Hill', center: [15.3317, 76.4598] as [number, number], count: 11, color: '#ef4444' },
  { name: 'Achyutaraya Temple', center: [15.3367, 76.4682] as [number, number], count: 16, color: '#f59e0b' },
  { name: 'Hemakuta Hill', center: [15.3342, 76.4573] as [number, number], count: 13, color: '#2f9b67' },
];

export const zones = [
  { name: 'Zone A · Virupaksha Core', coords: [[15.3388,76.4568],[15.3418,76.4604],[15.3394,76.4648],[15.3359,76.4632],[15.3349,76.4588]] as [number,number][], color: '#2f9b67' },
  { name: 'Zone B · Krishna Bazaar', coords: [[15.3333,76.4581],[15.3357,76.4558],[15.3382,76.4584],[15.3362,76.4614],[15.3331,76.4607]] as [number,number][], color: '#3350bf' },
  { name: 'Zone C · Royal Enclosure', coords: [[15.3376,76.4608],[15.3408,76.4607],[15.3411,76.4642],[15.3375,76.4640]] as [number,number][], color: '#2f9b67' },
  { name: 'Zone D · Riverside Edge', coords: [[15.3389,76.4638],[15.3417,76.4655],[15.3395,76.4688],[15.3368,76.4671]] as [number,number][], color: '#f59e0b', dashed: true },
  { name: 'Zone E · Vittala Corridor', coords: [[15.3434,76.4722],[15.3468,76.4734],[15.3459,76.4778],[15.3424,76.4761]] as [number,number][], color: '#3350bf' },
  { name: 'Zone F · Hemakuta Hill', coords: [[15.3327,76.4557],[15.3356,76.4554],[15.3354,76.4581],[15.3325,76.4579]] as [number,number][], color: '#2f9b67' },
];

export const routePath: [number, number][] = [
  [15.3314,76.4638],[15.3339,76.4587],[15.3358,76.4606],
  [15.3372,76.4568],[15.3386,76.4621],[15.3401,76.4654],[15.3443,76.4752],
];

export const responderPositions: [number, number][] = [
  [15.3364,76.4614],[15.3381,76.4598],[15.3448,76.4743],[15.3337,76.4572],
];

const indianNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Krishna','Ishaan','Reyansh','Atharv','Aanya','Diya','Anaya','Ira','Saanvi','Myra','Meera','Anika','Riya','Kavya','Rahul','Priya','Neha','Rohan','Kiran','Sneha','Pooja','Nikhil','Varun','Akash','Harsha','Sakshi','Tanvi','Aditi','Manav','Tara','Nisha','Dev','Yash','Aryan'];

export interface MockTourist {
  id: string;
  name: string;
  coords: [number, number];
  status: 'safe' | 'warning' | 'danger';
  speed: string;
  zone: string;
}

export function generateMockTourists(): MockTourist[] {
  const tourists: MockTourist[] = [];
  let seq = 1001;
  siteClusters.forEach((cluster, idx) => {
    for (let i = 0; i < cluster.count; i++) {
      const latJ = (Math.random() - 0.5) * 0.0026;
      const lngJ = (Math.random() - 0.5) * 0.0026;
      const state: 'safe' | 'warning' | 'danger' = i % 17 === 0 ? 'danger' : i % 7 === 0 ? 'warning' : 'safe';
      tourists.push({
        id: `T-${seq++}`,
        name: indianNames[(i + idx * 3) % indianNames.length],
        coords: [cluster.center[0] + latJ, cluster.center[1] + lngJ],
        status: state,
        speed: `${(1.2 + Math.random() * 4.8).toFixed(1)} km/h`,
        zone: cluster.name,
      });
    }
  });
  return tourists;
}

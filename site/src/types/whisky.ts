export interface RadarDataset {
  name: string;
  data: number[];
  color: string;
}

export interface RadarChartData {
  labels: string[];
  datasets: RadarDataset[];
}

export const DEFAULT_RADAR_AXES = [
  'ピート',
  '甘さ',
  'フルーティ',
  'スパイシー',
  'オーク',
  'スモーキー',
  '複雑さ',
  'コスパ',
] as const;

export interface WhiskySummary {
  name: string;
  distillery: string;
  type: string;
  age?: number;
  abv: number;
  priceYen?: number;
  whiskybaseScore?: number;
  peatLevel: 0 | 1 | 2 | 3 | 4 | 5;
}

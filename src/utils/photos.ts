import photos from '../data/whisky-photos.json';

export interface WhiskyPhoto {
  id: string;
  image: string;
  title: string;
  license: string;
  artist: string;
  sourceUrl: string;
  width?: number;
  height?: number;
  thumbWidth?: number;
}

const photoMap = new Map<string, WhiskyPhoto>((photos as WhiskyPhoto[]).map((p) => [p.id, p]));

/** その銘柄の写真（Wikimedia Commons）。無ければ undefined */
export function getWhiskyPhoto(id: string): WhiskyPhoto | undefined {
  return photoMap.get(id);
}

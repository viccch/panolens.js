export class BaiduStreetviewPanorama extends ImagePanorama {
  panoId: string;
  gsvLoader: BaiduStreetviewLoader;
  loadRequested: boolean;

  constructor(panoId: string);

  load(panoId: string): void;

  setGSVLoader(): object;

  getGSVLoader(): object;

  loadGSVLoader(panoId: string): void;

  reset(): void;

}

import {TextureLoader} from './TextureLoader';

/**
 * @classdesc Baidu Street View Loader
 * @constructor
 * @param {object} parameters
 */
function BaiduStreetviewLoader(parameters = {}) {
    this._parameters = parameters;
    this._zoom = null;
    this._panoId = null;
    this._count = 0;
    this._total = 0;
    this._canvas = [];
    this._ctx = [];
    this._wc = 0;
    this._hc = 0;
    this.result = null;
    this.rotation = 0;
    this.copyright = '';
    this.onSizeChange = null;
    this.onPanoramaLoad = null;

    this.levelsW = [1, 1, 2, 4, 8, 16];
    this.levelsH = [1, 1, 1, 2, 4, 8];

    this.widths = [100, 512, 1024, 2048, 4096, 8192];
    this.heights = [75, 256, 512, 1024, 2048, 4096];

    this.maxW = 4096;
    this.maxH = 4096;

    let gl;

    try {
        const canvas = document.createElement('canvas');

        gl = canvas.getContext('experimental-webgl');

        if (!gl) {
            gl = canvas.getContext('webgl');
        }
    } catch (error) {}

    this.maxW = Math.max(gl.getParameter(gl.MAX_TEXTURE_SIZE), this.maxW);
    this.maxH = Math.max(gl.getParameter(gl.MAX_TEXTURE_SIZE), this.maxH);
}

Object.assign(BaiduStreetviewLoader.prototype, {
    constructor: BaiduStreetviewLoader,

    /**
     * Set progress
     * @param {number} loaded
     * @param {number} total
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    setProgress: function (loaded, total) {
        if (this.onProgress) {
            this.onProgress({loaded: loaded, total: total});
        }
    },

    /**
     * Adapt texture to zoom
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    adaptTextureToZoom: function () {
        const w = this.widths[this._zoom];
        const h = this.heights[this._zoom];

        const maxW = this.maxW;
        const maxH = this.maxH;

        this._wc = Math.ceil(w / maxW);
        this._hc = Math.ceil(h / maxH);

        for (let y = 0; y < this._hc; y++) {
            for (let x = 0; x < this._wc; x++) {
                const c = document.createElement('canvas');
                if (x < this._wc - 1) c.width = maxW;
                else c.width = w - maxW * x;
                if (y < this._hc - 1) c.height = maxH;
                else c.height = h - maxH * y;
                this._canvas.push(c);
                this._ctx.push(c.getContext('2d'));
            }
        }
    },

    /**
     * Compose from tile
     * @param {number} x
     * @param {number} y
     * @param {*} texture
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    composeFromTile: function (x, y, texture) {
        const maxW = this.maxW;
        const maxH = this.maxH;

        x *= 512;
        y *= 512;

        const px = Math.floor(x / maxW);
        const py = Math.floor(y / maxH);

        x -= px * maxW;
        y -= py * maxH;

        this._ctx[py * this._wc + px].drawImage(texture, 0, 0, texture.width, texture.height, x, y, 512, 512);

        this.progress();
    },

    /**
     * Progress
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    progress: function () {
        this._count++;

        this.setProgress(this._count, this._total);

        if (this._count === this._total) {
            this.canvas = this._canvas;
            this.panoId = this._panoId;
            this.zoom = this._zoom;

            if (this.onPanoramaLoad) {
                this.onPanoramaLoad(this._canvas[0]);
            }
        }
    },

    /**
     * Compose panorama
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    composePanorama: function () {
        this.setProgress(0, 1);

        const w = this.levelsW[this._zoom];
        const h = this.levelsH[this._zoom];
        const self = this;

        this._count = 0;
        this._total = w * h;

        const {useWebGL} = this._parameters;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                // const url = "http://127.0.0.1:3000/pdata?sid={sid}&pos={pos}&z={z}".replace("{sid}", this._panoId).replace("${pos}", y + "_" + x).replace('{z}',this._zoom);
                const url = 'https://mapsv0.bdimg.com/scape/?qt=pdata&sid={sid}&pos={pos}&z={z}'
                    .replace('{sid}', this._panoId)
                    .replace('{pos}', y + '_' + x)
                    .replace('{z}', this._zoom);
                /*
                 * const url = 'https://mapsv0.bdimg.com/scape/?qt=pdata&sid=' + this._panoId + '&pos=' + y + '_' + x + '&z=' + this._zoom;
                 * https://mapsv0.bdimg.com/scape/?qt=pdata&sid=22444400132009081807459086XX&pos=2_4&z=4&udt=&from=H5
                 * const url = 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=tile&zoom=' + this._zoom + '&x=' + x + '&y=' + y + '&panoid=' + this._panoId + '&nbt&fover=2';
                 */
                (function (x, y) {
                    if (useWebGL) {
                        const texture = TextureLoader.load(url, null, function () {
                            self.composeFromTile(x, y, texture);
                        });
                    } else {
                        const img = new Image();
                        img.addEventListener('load', function () {
                            self.composeFromTile(x, y, this);
                        });
                        img.crossOrigin = '';
                        img.src = url;
                    }
                })(x, y);
            }
        }
    },

    /**
     * Load
     * @param {string} panoid
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    load: function (panoid) {
        this.loadPano(panoid);
    },

    /**
     * Load panorama
     * @param {string} id
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    loadPano: function (id) {
        const self = this;

        self._panoId = id;
        self.composePanorama();
    },

    /**
     * Set zoom level
     * @param {number} z
     * @memberOf BaiduStreetviewLoader
     * @instance
     */
    setZoom: function (z) {
        this._zoom = z;
        this.adaptTextureToZoom();
    },
});

export {BaiduStreetviewLoader};

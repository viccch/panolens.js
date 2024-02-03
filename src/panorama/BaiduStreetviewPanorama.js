import { ImagePanorama } from './ImagePanorama';
import { BaiduStreetviewLoader } from '../loaders/BaiduStreetviewLoader';
import * as THREE from 'three';

/**
 * @classdesc Baidu streetview panorama
 * @description [How to get Panorama ID]{@link http://stackoverflow.com/questions/29916149/google-maps-streetview-how-to-get-panorama-id}
 * @constructor
 * @param {string} panoId - Panorama id from Baidu Streetview 
 */
function BaiduStreetviewPanorama ( panoId ) {

    ImagePanorama.call( this );

    this.panoId = panoId;

    this.gsvLoader = null;

    this.loadRequested = false;

    window.onload = this.setGSVLoader.bind( this );

}

BaiduStreetviewPanorama.prototype = Object.assign( Object.create( ImagePanorama.prototype ), {

    constructor: BaiduStreetviewPanorama,

    /**
     * Load Baidu Street View by panorama id
     * @param {string} panoId - Gogogle Street View panorama id
     * @memberOf BaiduStreetviewPanorama
     * @instance
     */
    load: function ( panoId ) {

        this.loadRequested = true;

        panoId = ( panoId || this.panoId ) || {};

        if ( panoId && this.gsvLoader ) {

            this.loadGSVLoader( panoId );

        }

    },

    /**
     * Set GSV Loader
     * @memberOf BaiduStreetviewPanorama
     * @instance
     */
    setGSVLoader: function () {

        this.gsvLoader = new BaiduStreetviewLoader();

        if ( this.loadRequested ) {

            this.load();

        }

    },

    /**
     * Get GSV Loader
     * @memberOf BaiduStreetviewPanorama
     * @instance
     * @return {BaiduStreetviewLoader} GSV Loader instance
     */
    getGSVLoader: function () {

        return this.gsvLoader;

    },

    /**
     * Load GSV Loader
     * @param  {string} panoId - Gogogle Street View panorama id
     * @memberOf BaiduStreetviewPanorama
     * @instance
     */
    loadGSVLoader: function ( panoId ) {

        this.loadRequested = false;

        this.gsvLoader.onProgress = this.onProgress.bind( this );

        this.gsvLoader.onPanoramaLoad = this.onLoad.bind( this );

        this.gsvLoader.setZoom( this.getZoomLevel() );

        this.gsvLoader.load( panoId );

        this.gsvLoader.loaded = true;
    },

    /**
     * This will be called when panorama is loaded
     * @param  {HTMLCanvasElement} canvas - Canvas where the tiles have been drawn
     * @memberOf BaiduStreetviewPanorama
     * @instance
     */
    onLoad: function ( canvas ) {

        ImagePanorama.prototype.onLoad.call( this, new THREE.Texture( canvas ) );

    },

    /**
     * Reset
     * @memberOf BaiduStreetviewPanorama
     * @instance
     */
    reset: function () {

        this.gsvLoader = undefined;

        ImagePanorama.prototype.reset.call( this );

    }

} );

export { BaiduStreetviewPanorama };
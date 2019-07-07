"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vgm_header_1 = require("./vgm-header");
var VGM = /** @class */ (function () {
    function VGM(header, buffer) {
        this._header = vgm_header_1.clone(header);
        this._data = new DataView(buffer);
    }
    VGM.parse = function (vgm) {
        var header = vgm_header_1.parse(vgm);
        return new VGM(header, vgm.slice(header.offsets.data));
    };
    Object.defineProperty(VGM.prototype, "header", {
        get: function () {
            return this._header;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VGM.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    VGM.prototype.build = function () {
        var hbuf = new Uint8Array(vgm_header_1.build(this._header));
        var dbuf = new Uint8Array(this._data.buffer, this._data.byteOffset, this._data.byteLength);
        var res = new ArrayBuffer(hbuf.byteLength + dbuf.byteLength);
        var hv = new Uint8Array(res, 0, hbuf.byteLength);
        var dv = new Uint8Array(res, hbuf.byteLength, dbuf.byteLength);
        hv.set(hbuf);
        dv.set(dbuf);
        return res;
    };
    VGM.prototype.clone = function () {
        return new VGM(this._header, this._data.buffer);
    };
    return VGM;
}());
exports.default = VGM;

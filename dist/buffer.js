"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InputBuffer = /** @class */ (function () {
    function InputBuffer(buffer) {
        this._rp = 0;
        this._view = new DataView(buffer);
    }
    Object.defineProperty(InputBuffer.prototype, "eod", {
        get: function () {
            return this._view.byteLength <= this._rp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputBuffer.prototype, "readOffset", {
        get: function () {
            return this._rp;
        },
        set: function (offset) {
            this._rp = offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputBuffer.prototype, "buffer", {
        get: function () {
            return this._view.buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputBuffer.prototype, "byteOffset", {
        get: function () {
            return this._view.byteLength;
        },
        enumerable: true,
        configurable: true
    });
    InputBuffer.prototype.peekByte = function () {
        return this._view.getUint8(this._rp);
    };
    InputBuffer.prototype.readByte = function () {
        return this._view.getUint8(this._rp++);
    };
    InputBuffer.prototype.peekWord = function () {
        return this._view.getUint16(this._rp, true);
    };
    InputBuffer.prototype.readWord = function () {
        var ret = this._view.getUint16(this._rp, true);
        this._rp += 2;
        return ret;
    };
    InputBuffer.prototype.peekDword = function () {
        return this._view.getUint32(this._rp, true);
    };
    InputBuffer.prototype.readDword = function () {
        var ret = this._view.getUint32(this._rp, true);
        this._rp += 4;
        return ret;
    };
    return InputBuffer;
}());
exports.InputBuffer = InputBuffer;
var OutputBuffer = /** @class */ (function () {
    function OutputBuffer(buffer) {
        this._wp = 0;
        this._view = new DataView(buffer);
    }
    Object.defineProperty(OutputBuffer.prototype, "writeOffset", {
        get: function () {
            return this._wp;
        },
        set: function (offset) {
            this._wp = offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OutputBuffer.prototype, "buffer", {
        get: function () {
            return this._view.buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OutputBuffer.prototype, "byteOffset", {
        get: function () {
            return this._view.byteLength;
        },
        enumerable: true,
        configurable: true
    });
    OutputBuffer.prototype._stretchBuffer = function () {
        var newBuf = new ArrayBuffer(this._view.byteLength * 2);
        var view = new Uint8Array(newBuf);
        view.set(new Uint8Array(this._view.buffer));
        this._view = new DataView(newBuf);
    };
    OutputBuffer.prototype.writeByte = function (value) {
        if (this._view.byteLength < this._wp + 1) {
            this._stretchBuffer();
        }
        this._view.setUint8(this._wp, value);
        this._wp += 1;
    };
    OutputBuffer.prototype.writeWord = function (value) {
        if (this._view.byteLength < this._wp + 2) {
            this._stretchBuffer();
        }
        this._view.setUint16(this._wp, value, true);
        this._wp += 2;
    };
    OutputBuffer.prototype.writeDword = function (value) {
        if (this._view.byteLength < this._wp + 4) {
            this._stretchBuffer();
        }
        this._view.setUint32(this._wp, value, true);
        this._wp += 4;
    };
    return OutputBuffer;
}());
exports.OutputBuffer = OutputBuffer;

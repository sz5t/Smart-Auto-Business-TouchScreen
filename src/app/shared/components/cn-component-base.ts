export class CnComponentBase {
    // 临时变量，所有组件中进行业务处理所保存的操作数据
    private _tempValue;
    get tempValue() {
        if (!this._tempValue) {
            this._tempValue = {};
        }
        return this._tempValue;
    }

    set tempValue(value) {
        this._tempValue = value;
    }

    private _initValue;
    get initValue() {
        return this._initValue;
    }
    set initValue(value) {
        this._initValue = value;
    }

    private _cacheValue;
    public get cacheValue() {
        return this._cacheValue;
    }
    public set cacheValue(value) {
        this._cacheValue = value;
    }

    private _statusSubscriptions;
    public get statusSubscriptions() {
        return this._statusSubscriptions;
    }
    public set statusSubscriptions(value) {
        this._statusSubscriptions = value;
    }

    private _cascadeSubscriptions;
    public get cascadeSubscriptions() {
        return this._cascadeSubscriptions;
    }
    public set cascadeSubscriptions(value) {
        this._cascadeSubscriptions = value;
    }

    private _baseMessage;
    public get baseMessage() {
        return this._baseMessage;
    }
    public set baseMessage(value) {
        this._baseMessage = value;
    }

    private _baseModal;
    public get baseModal() {
        return this._baseModal;
    }
    public set baseModal(value) {
        this._baseModal = value;
    }

    private _baseDrawer;
    public get baseDrawer() {
        return this._baseDrawer;
    }
    public set baseDrawer(value) {
        this._baseDrawer = value;
    }

    private _apiResource;
    public get apiResource() {
        return this._apiResource;
    }
    public set apiResource(value) {
        this._apiResource = value;
    }

    private _returnValue;
    public get returnValue() {
        return this._returnValue;
    }
    public set returnValue(value) {
        this._returnValue = value;
    }

    public unsubscribe() {
        if (this._statusSubscriptions) {
            this.statusSubscriptions.unsubscribe();
        }

        if (this._cascadeSubscriptions) {
            this._cascadeSubscriptions.unsubscribe();
        }
    }

    public before(target, method, advice) {
        const original = target[method];
        target[method] = function() {
            const result = advice(arguments);
            if (result) {
                original.apply(target, arguments);
            }
        };
        return target;
    }
    public after(target, method, advice) {
        const original = target[method];
        target[method] = function() {
            original.apply(target, arguments);
            advice(arguments);
        };
        return target;
    }
    public around(target, method, advice) {
        const original = target[method];
        target[method] = function() {
            advice(arguments);
            original.apply(target, arguments);
            advice(arguments);
        };
        return target;
    }
}

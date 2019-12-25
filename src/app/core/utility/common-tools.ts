import { BSN_PARAMETER_TYPE } from '@core/relative-Service/BsnTableStatus';
import { getISOYear, getMonth, getISOWeek, getDate } from 'date-fns';
export interface ParametersResolverModel {
    params;
    tempValue?;
    item?;
    componentValue?;
    initValue?;
    cacheValue?;
    cardValue?;
    cascadeValue?;
    returnValue?;
    routerValue?;
    routeCheckedIds?;
}
export class CommonTools {
    public static uuID(w) {
        let s = '';
        const str =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < w; i++) {
            s += str.charAt(Math.round(Math.random() * (str.length - 1)));
        }
        return s;
    }

    public static deepCopy(data) {
        return JSON.parse(JSON.stringify(data));
    }

    public static parametersResolver(model: ParametersResolverModel) {
        const result = {};
        if (Array.isArray(model.params)) {
            model.params.forEach(param => {
                const paramType = param['type'];
                if (paramType) {
                    switch (paramType) {
                        case BSN_PARAMETER_TYPE.TEMP_VALUE:
                            if (
                                model.tempValue &&
                                model.tempValue[param['valueName']]
                            ) {
                                result[param['name']] =
                                    model.tempValue[param['valueName']];
                            } else {
                                if (
                                    param['value'] === null ||
                                    param['value'] === '' ||
                                    param['value'] === 0
                                ) {
                                    // result[param['name']] = param.value;
                                    if (param['datatype']) {
                                        result[param['name']] = this.getParameters(param['datatype'], param.value);
                                    } else {
                                        result[param['name']] = param.value;
                                    }
                                }
                            }
                            break;
                        case BSN_PARAMETER_TYPE.ITEM:
                            if (model.item) {
                                if (model.item) {
                                    // 判断组件取值是否为null
                                    if (
                                        model.item[param['valueName']] ===
                                        null ||
                                        model.item[param['valueName']] ===
                                        undefined
                                    ) {
                                        if (param['value'] !== undefined) {
                                            if (param['datatype']) {
                                                result[param['name']] = this.getParameters(param['datatype'], param['value']);
                                            } else if (param['defaultDate']) {
                                                const dateType = param['defaultDate'];
                                                let dValue;
                                                switch (dateType) {
                                                    case 'defaultWeek':
                                                        dValue = `${getISOYear(Date.now())}-${getISOWeek(Date.now())}`;
                                                        break;
                                                    case 'defaultDay':
                                                        dValue = `${getISOYear(Date.now())}-${getMonth(Date.now()) + 1}-${getDate(Date.now())}`;
                                                        break;
                                                    case 'defaultMonth':
                                                        dValue = `${getISOYear(Date.now())}-${getMonth(Date.now()) + 1}`;
                                                        break;
                                                    case 'defaultYear':
                                                        dValue = `${getISOYear(Date.now())}`;
                                                        break;
                                                }
                                                result[param['name']] = dValue;
                                            } else {
                                                result[param['name']] = param['value'];
                                            }
                                        }
                                    } else {
                                        if (param['datatype']) {
                                            result[param['name']] = this.getParameters(param['datatype'], model.item[param['valueName']]);
                                        } else {
                                            result[param['name']] = model.item[param['valueName']];
                                        }
                                    }
                                }
                            }
                            break;
                        case BSN_PARAMETER_TYPE.VALUE:
                            if (param['value'] === 'null') {
                                param['value'] = null;
                            }
                            result[param['name']] = param.value;
                            break;
                        case BSN_PARAMETER_TYPE.COMPONENT_VALUE:
                            if (model.componentValue) {
                                // 判断组件取值是否为null
                                if (
                                    model.componentValue[param['valueName']] ===
                                    null ||
                                    model.componentValue[param['valueName']] ===
                                    undefined
                                ) {
                                    if (param['value'] !== undefined) {
                                        if (param['datatype']) {
                                            result[param['name']] = this.getParameters(param['datatype'], param['value']);
                                        } else {
                                            result[param['name']] = param['value'];
                                        }
                                    }
                                } else {
                                    if (param['datatype']) {
                                        result[param['name']] = this.getParameters(param['datatype'], model.componentValue[param['valueName']]);
                                    } else {
                                        result[param['name']] = model.componentValue[param['valueName']];
                                    }
                                }

                                // if (
                                //     model.componentValue[param["valueName"]] !==
                                //     undefined
                                // ) {
                                //     result[param["name"]] =
                                //         model.componentValue[
                                //             param["valueName"]
                                //         ];
                                // } else {
                                //     if (
                                //         param["value"] === null ||
                                //         param["value"] === "" ||
                                //         param["value"] === 0
                                //     ) {
                                //         result[param["name"]] = param["value"];
                                //     }
                                // }
                            }
                            break;
                        case BSN_PARAMETER_TYPE.GUID:
                            result[param['name']] = CommonTools.uuID(32);
                            break;
                        case BSN_PARAMETER_TYPE.CHECKED:
                            if (model.item) {
                                result[param['name']] =
                                    model.item[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.SELECTED:
                            if (model.item) {
                                result[param['name']] =
                                    model.item[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.CHECKED_ID:
                            if (model.item) {
                                result[param['name']] = model.item;
                            }
                            break;
                        case BSN_PARAMETER_TYPE.CHECKED_ROW: // 后续替换为 CHECKED
                            if (model.item) {
                                result[param['name']] =
                                    model.item[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.SELECTED_ROW: // 后续替换 SELECTED
                            if (model.item) {
                                result[param['name']] =
                                    model.item[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.INIT_VALUE:
                            if (model.initValue) {
                                result[param['name']] =
                                    model.initValue[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.CACHE_VALUE:
                            if (model.cacheValue) {
                                const cache = model.cacheValue.getNone('userInfo');
                                result[param['name']] =
                                    cache[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.CARD_VALUE:
                            if (model.cardValue) {
                                const card = model.cardValue.getNone('cardInfo');
                                result[param['name']] =
                                    card[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.CASCADE_VALUE:
                            if (model.cascadeValue) {
                                result[param['name']] =
                                    model.cascadeValue[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.RETURN_VALUE:
                            if (model.returnValue) {
                                // if (model.returnValue.length) {
                                    // result[param['name']] =
                                        // [
                                        //     { 'opcname': '1', 'opctime': '2019-12-19 17:45' , 'opcvalue': '1' , 'opcvaluetype': 'number' },
                                        //     { 'opcname': '1', 'opctime': '2019-12-19 17:46' , 'opcvalue': '2' , 'opcvaluetype': 'number' },
                                        //     { 'opcname': '1', 'opctime': '2019-12-19 17:47' , 'opcvalue': '3' , 'opcvaluetype': 'number' },
                                        //     { 'opcname': '1', 'opctime': '2019-12-19 17:48' , 'opcvalue': '4' , 'opcvaluetype': 'number' }
                                        // ]
                                        model.returnValue
                                // } else {
                                    // if (param['valueName']) {
                                        result[param['name']] =
                                            model.returnValue[param['valueName']];
                                    // } else {
                                        // result[param['name']] = { 'opcname': '1', 'opctime': '2019-12-19 17:45' , 'opcvalue': '1' , 'opcvaluetype': 'number' }
                                        // model.returnValue
                                    // }
                                // }

                            }
                            break;
                        case BSN_PARAMETER_TYPE.ROUTER_VALUE:
                            if (model.cacheValue) {
                                const cache = model.cacheValue.getNone('routerValue');
                                result[param['name']] =
                                    cache[param['valueName']];
                            }
                            break;
                        case BSN_PARAMETER_TYPE.ROUTER_CHECKED_IDS:
                            if (model.routeCheckedIds) {
                                result[param['name']] =
                                    model.routeCheckedIds[param['valueName']];
                            }
                            break;
                    }
                }
            });
        }
        return result;
    }


    public static isString(obj) {
        // 判断对象是否是字符串
        return Object.prototype.toString.call(obj) === '[object String]';
    }

    // liu 20181213  参数简析[可适配后台多条件查询]
    public static getParameters(datatype?, inputValue?) {
        let strQ;
        if (!inputValue) {
            // return strQ;
        }
        switch (datatype) {
            case 'eq': // =
                strQ = strQ + 'eq(' + inputValue + ')';
                break;
            case 'neq': // !=
                strQ = strQ + '!eq(' + inputValue + ')';
                break;
            case 'ctn': // like
                strQ = strQ + 'ctn(\'%' + inputValue + '%\')';
                break;
            case 'nctn': // not like
                strQ = strQ + '!ctn(\'%' + inputValue + '%\')';
                break;
            case 'in': // in  如果是input 是这样取值，其他则是多选取值
                strQ = strQ + 'in(' + inputValue + ')';
                break;
            case 'nin': // not in  如果是input 是这样取值，其他则是多选取值
                strQ = strQ + '!in(' + inputValue + ')';
                break;
            case 'btn': // between
                strQ = strQ + 'btn(' + inputValue + ')';
                break;
            case 'ge': // >=
                strQ = strQ + 'ge(' + inputValue + ')';
                break;
            case 'gt': // >
                strQ = strQ + 'gt(' + inputValue + ')';
                break;
            case 'le': // <=
                strQ = strQ + 'le(' + inputValue + ')';
                break;
            case 'lt': // <
                strQ = strQ + 'lt(' + inputValue + ')';
                break;
            default:
                strQ = inputValue;
                break;
        }

        if (!inputValue) {
            strQ = null;
        }
        console.log('liu查询参数：', strQ);
        return strQ;
    }
}

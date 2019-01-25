import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'tree-transfer',
    templateUrl: './tree-transfer.component.html'
})
export class TreeTransferComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
        // console.log(JSON.stringify(this.config));
    }

    config = {
        rows: [
            {
                row: {
                    cols: [
                        {
                            id: 'area1',
                            title: '结构树',
                            bodyStyle: {
                                height: '800px',
                                padding: '8px'
                            },
                            span: 5,
                            size: {
                                nzXs: 24,
                                nzSm: 24,
                                nzMd: 5,
                                nzLg: 5,
                                ngXl: 5
                            },
                            viewCfg: [
                                {
                                    config: {
                                        'viewId': 'tree_and_table_tree',
                                        'keyId': 'Id',
                                        'component': 'bsnTree',
                                        'asyncData': true, //
                                        'expandAll': true, //
                                        'checkable': true,  //    在节点之前添加一个复选框 false
                                        'showLine': true,  //   显示连接线 fal
                                        'columns': [ // 字段映射，映射成树结构所需
                                            {title: '主键', field: 'key', valueName: 'Id'},
                                            {title: '父节点', field: 'parentId', valueName: 'parentId'},
                                            {title: '标题', field: 'title', valueName: 'caseName'},
                                        ],
                                        'checkedMapping': [
                                            {
                                                name: 'enabled', value: true
                                            }
                                        ],
                                        'toolbar': [
                                            {
                                                group: [
                                                    {
                                                        'name': 'refresh',
                                                        'text': '刷新',
                                                        'action': 'REFRESH',
                                                        'icon': 'anticon anticon-sync',
                                                        'color': 'text-success-light'
                                                    },
                                                    {
                                                        'name': 'save',
                                                        'text': '保存',
                                                        'action': 'SAVE_NODE',
                                                        'icon': 'anticon anticon-save',
                                                        'color': 'text-success-light',
                                                        'ajaxConfig': [{
                                                            'url': 'common/SetShowCaseEnable',
                                                            'ajaxType': 'post',
                                                            'action': 'EXECUTE_NODES_CHECKED_KEY',
                                                            'title': '',
                                                            'message': '是否保存选中结点数据',
                                                            'params': [
                                                                {
                                                                    name: 'Ids',
                                                                    type: 'tempValue',
                                                                    valueName: '_checkedIds',
                                                                    value: ''
                                                                }
                                                            ]
                                                        }]
                                                    }
                                                ]
                                            }
                                        ],
                                        'componentType': {
                                            'parent': true,
                                            'child': true,
                                            'own': false
                                        },
                                        'parent': [
                                            {
                                                name: 'parentId', type: 'value', valueName: '', value: null
                                            }
                                        ],
                                        'ajaxConfig': {
                                            'url': 'common/ShowCase',
                                            'ajaxType': 'get',
                                            'params': [
                                                // { name: 'LayoutId', type: 'tempValue', valueName: '_LayoutId', value: '' }
                                            ]
                                        },
                                        'relations': [
                                            {
                                                'relationViewId': 'tree_and_form_form',
                                                'cascadeMode': 'REFRESH',
                                                'params': []
                                            }
                                        ]
                                    },
                                    dataList: []
                                }
                            ]
                        },
                        {
                            id: 'area2',
                            title: '右表',
                            span: 19,
                            size: {
                                nzXs: 24,
                                nzSm: 24,
                                nzMd: 19,
                                nzLg: 19,
                                ngXl: 19
                            },
                            rows: [
                                {
                                    row: {
                                        cols: [
                                            {
                                                id: 'area2_1',
                                                title: '表单',
                                                span: 24,
                                                bodyStyle: {
                                                    height: '800px',
                                                    padding: '8px'
                                                },
                                                size: {
                                                    nzXs: 24,
                                                    nzSm: 24,
                                                    nzMd: 24,
                                                    nzLg: 24,
                                                    ngXl: 24
                                                },
                                                viewCfg: [
                                                    {
                                                        config: {
                                                            'viewId': 'tree_and_transfer',
                                                            'component': 'bsnTransfer',
                                                            'keyId': 'Id',
                                                            'bodyStyle': {'width.px': 300, 'height.%': 42},
                                                            'transformButtons': ['禁用', '启用'],
                                                            'ajaxConfig': {
                                                                'url': 'common/GetCase',
                                                                'ajaxType': 'get',
                                                                'params': []
                                                            },
                                                            'componentType': {
                                                                'parent': true,
                                                                'child': true,
                                                                'own': false
                                                            },
                                                            'columns': [
                                                                {
                                                                    'name': 'title', 'field': 'caseName', 'icon': ''
                                                                },
                                                                {
                                                                    'name': 'description', 'field': 'enableText', 'icon': ''
                                                                }
                                                            ],
                                                            'separator': {
                                                              'left': [
                                                                  {
                                                                      'field': 'enabled', 'value': '1'
                                                                  }
                                                              ],
                                                              'right': [
                                                                  {
                                                                      'field': 'enabled', 'value': '0'
                                                                  }
                                                              ]
                                                            },
                                                            'leftToRight': {
                                                                'ajaxConfig': [
                                                                    {
                                                                        'url': 'common/ShowCase',
                                                                        'ajaxType': 'put',
                                                                        'params': [
                                                                            {
                                                                                'name': 'Id', 'type': 'checked', 'valueName': 'Id'
                                                                            },
                                                                            {
                                                                                'name': 'enabled', 'type': 'value', 'value': '0'
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            },
                                                            'rightToLeft': {
                                                                'ajaxConfig': [
                                                                    {
                                                                        'url': 'common/ShowCase',
                                                                        'ajaxType': 'put',
                                                                        'params': [
                                                                            {
                                                                                'name': 'Id', 'type': 'checked', 'valueName': 'Id'
                                                                            },
                                                                            {
                                                                                'name': 'enabled', 'type': 'value', 'value': '1'
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            },
                                                            'relations': [{
                                                                'relationViewId': 'tree_singleTable',
                                                                'cascadeMode': 'REFRESH_AS_CHILD',
                                                                'params': [
                                                                    {
                                                                        pid: 'Id', cid: '_id'
                                                                    },
                                                                    {
                                                                        pid: 'parentId', cid: '_parentId'
                                                                    }
                                                                ]
                                                            }]
                                                        },
                                                        dataList: []
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }

                            ]
                        }
                    ]
                }
            }

        ]
    };
}

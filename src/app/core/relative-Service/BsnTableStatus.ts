import { Injectable, InjectionToken } from '@angular/core';

export class ComponentModes {
    // grid
    public CREATE: string;
    public CREATE_CHILD: string;
    public EDIT: string;
    public DELETE: string
    public DELETE_SELECTED: string;
    public DIALOG: string;
    public WINDOW: string;
    public SAVE: string;
    public CANCEL: string;
    public CANCEL_SELECTED: string;
    public FORM: string;
    public EXECUTE_SELECTED: string;
    public EXECUTE_CHECKED: string;
    public SEARCH: string;
    public UPLOAD: string;
    public REFRESH: string;
    public ADD_ROW_DATA: string;
    public FORM_BATCH: string;
    public LINK: string;
    public EXECUTE_SELECTED_LINK: string;
    public EXECUTE_SELECTED_ID_LINK: string;
    public EXECUTE_CHECKED_ID_LINK: string;
    public LOGIN_OUT: string;
    public WORK_CENTER: string;
    public AUTO_PLAY: string;
    public CALL_INTERFACE: string;
    public OPEN_VIDEO: string;
    
    // tree
    public ADD_NODE: string;
    public EDIT_NODE: string;
    public DELETE_NODE: string;
    public SAVE_NODE: string;
    public EXECUTE: string;
    
    // form
    public FORM_ADD: string;
    public FORM_EDIT: string;
    public FORM_LOAD: string;
    public FORM_TECTA_TEST: string;
    public EXECUTE_AND_LINK: string;
    public EXECUTE_FOCUS: string;
};

export const BSN_COMPONENT_MODES: ComponentModes = {
    // grid
    CREATE: 'create',
    CREATE_CHILD: 'create_child',
    EDIT: 'edit',
    DELETE: 'delete',
    DELETE_SELECTED: 'delete_select',
    DIALOG: 'dialog',
    WINDOW: 'window',
    SAVE: 'save',
    CANCEL: 'cancel',
    CANCEL_SELECTED: 'cancel_select',
    FORM: 'form',
    EXECUTE_SELECTED: 'execute_select',
    EXECUTE_CHECKED: 'execute_checked',
    SEARCH: 'Search',
    UPLOAD: 'upload',
    REFRESH: 'refresh',
    ADD_ROW_DATA: 'add_row_data',
    FORM_BATCH: 'formBatch',
    LINK: 'link',
    EXECUTE_SELECTED_LINK: 'link_selected_item',
    EXECUTE_SELECTED_ID_LINK: 'link_selected_id_item',
    EXECUTE_CHECKED_ID_LINK: 'link_checked_items',
    LOGIN_OUT: 'login_out',
    WORK_CENTER: 'work_center',
    AUTO_PLAY: 'auto_play',
    CALL_INTERFACE: 'call_interface',
    OPEN_VIDEO: 'open_video',
    
    // tree
    ADD_NODE: 'addNode',
    EDIT_NODE: 'editNode',
    DELETE_NODE: 'deleteNode',
    SAVE_NODE: 'saveNode',
    EXECUTE: 'execute',

    // form
    FORM_ADD: 'formAdd',
    FORM_EDIT: 'formEdit',
    FORM_LOAD: 'formLoad',
    FORM_TECTA_TEST: 'tectaTest',
    EXECUTE_AND_LINK: 'execute_and_link',
    EXECUTE_FOCUS: 'execute_focus'
};

export const BSN_FORM_STATUS = {
    CREATE: 'post',
    EDIT: 'put',
    TEXT: 'text'
};

export const BSN_PARAMETER_TYPE = {
    TEMP_VALUE: 'tempValue',
    VALUE: 'value',
    GUID: 'GUID',
    COMPONENT_VALUE: 'componentValue',
    CHECKED_ROW: 'checkedRow',
    SELECTED_ROW: 'selectedRow',
    CHECKED: 'checked',
    SELECTED: 'selected',
    CHECKED_ID: 'checkedId',
    INIT_VALUE: 'initValue',
    CACHE_VALUE: 'cacheValue',
    CARD_VALUE: 'cardValue',
    CASCADE_VALUE: 'cascadeValue',
    RETURN_VALUE: 'returnValue',
    ROUTER_VALUE: 'routerValue',
    ITEM: 'item',
    ROUTER_CHECKED_IDS: 'routeCheckedIds'
};

export const BSN_EXECUTE_ACTION = {
    EXECUTE_ADD_ROW_DATA: 'EXECUTE_ADD_ROW_DATA',
    EXECUTE_SAVE_ROW: 'EXECUTE_SAVE_ROW',
    EXECUTE_EDIT_ROW: 'EXECUTE_EDIT_ROW',
    EXECUTE_SELECTED: 'EXECUTE_SELECTED',
    EXECUTE_CHECKED: 'EXECUTE_CHECKED',
    EXECUTE_CHECKED_ID: 'EXECUTE_CHECKED_ID',
    EXECUTE_NODE_SELECTED: 'EXECUTE_NODE_SELECTED',
    EXECUTE_NODE_CHECKED: 'EXECUTE_NODE_CHECKED',
    EXECUTE_NODES_CHECKED_KEY: 'EXECUTE_NODES_CHECKED_KEY',
    EXECUTE_SAVE_TREE_ROW: 'EXECUTE_SAVE_TREE_ROW',
    EXECUTE_EDIT_TREE_ROW: 'EXECUTE_EDIT_TREE_ROW',
    EXECUTE_LINK: 'EXECUTE_LINK',
    EXECUTE_EDIT_SELECTED_ROW: 'EXECUTE_EDIT_SELECTED_ROW',
    EXECUTE_CHECKED_ID_LINK: 'EXECUTE_CHECKED_ID_LINK',
    EXECUTE_SELECTED_LINK: 'EXECUTE_SELECTED_LINK',
    EXECUTE_AND_LOAD: 'EXECUTE_AND_LOAD',
    EXECUTE_EDIT_ALL_ROW: 'EXECUTE_EDIT_ALL_ROW'
};

export const BSN_OUTPOUT_PARAMETER_TYPE = {
    TABLE: 'table',
    VALUE: 'value',
    MESSAGE: 'message',
    NEXT: 'next'
};

export const BSN_COMPONENT_CASCADE_MODES = {
    AUTO_RESIZE: 'autoResize',
    // grid, tree
    REFRESH_AS_CHILD: 'refreshAsChild',
    RELOAD: 'reload',
    REFRESH: 'refresh',
    REPLACE_AS_CHILD: 'replaceAsChild',
    REFRESH_AS_CHILDREN: 'refreshAsChildren',
    REFRESH_AS_SELECT: 'refreshAsSelect',
    REPLACE_AS_SUBMAPPING: 'replaceAsSubMapping',

    // grid
    SELECTED_ROW: 'selectRow',
    CHECKED_ROWS: 'checkRow',
    Scan_Code_ROW: 'scanCodeROW',
    Scan_Code_Locate_ROW: 'scanCodeLocateROW',
    START_AUTO_PLAY: 'startAutoPlay',

    // tree
    CLICK_NODE: 'clickNode',
    SELECTED_NODE: 'selectNode',
    CHEKCED_NODES: 'checkNode',
    CHECKED_NODES_ID: 'checkNodesId',

    // form
    LOAD_FORM: 'loadForm',

    // data
    RECEIVE_DATA: 'receive_data'
};

export const BSN_COMPONENT_MODE = new InjectionToken<string>(
    'bsnComponentModes'
);

export const BSN_COMPONENT_CASCADE = new InjectionToken<string>(
    'bsnComponentCascade'
);

export class BsnComponentMessage {
    constructor(
        public _mode: string,
        public _viewId: string,
        public option?: any
    ) {}
}

/*
// region: table models
export const BSN_TABLE_STATUS = new InjectionToken<string>('bsnTable_status');
export class BsnTableStatus {
    constructor(public _mode: string, public _viewId: string, public option?: any) {}
}
// endregion

// region: table cascade
export const BSN_TABLE_CASCADE = new InjectionToken<string>('bsnTable_cascade');
export class BsnTableCascade {
    constructor(public _mode: string, public _viewId: string, public option: any) {}
}
// endregion

// region: tree status
export const BSN_TREE_STATUS = new InjectionToken<string>('bsnTreeStatus');
export class BsnTreeStatus {
    constructor(public _mode: string, public _viewId: string, public option: any) {}
}
// endregion

// region: tree cascade
export const BSN_TREE_CASCADE = new InjectionToken<string>('bsnTree_cascade');
export class BsnTreeCascade {
    constructor(public _mode: string, public _viewId: string, public option: any) {}
}

// endregion
*/

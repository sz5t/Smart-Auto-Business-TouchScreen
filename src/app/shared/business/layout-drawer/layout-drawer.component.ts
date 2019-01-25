import { CnComponentBase } from '../../components/cn-component-base';
import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    Type,
    Inject
} from '@angular/core';
import { instantiateDefaultStyleNormalizer } from '@angular/platform-browser/animations/src/providers';
import { Subscription, Observable, Observer } from 'rxjs';
import { BSN_COMPONENT_MODES, BsnComponentMessage, BSN_COMPONENT_CASCADE_MODES, BSN_COMPONENT_CASCADE } from '@core/relative-Service/BsnTableStatus';
import { NzTabComponent, NzTabChangeEvent } from 'ng-zorro-antd';
import {current} from 'codelyzer/util/syntaxKind';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'layout-drawer',
    templateUrl: './layout-drawer.component.html',
    styles: [``]
})
export class LayoutDrawerComponent extends CnComponentBase implements OnInit, OnDestroy {
    @Input()
    public config;
    @Input()
    public viewId;
    @Input()
    public permissions = [];
    @Input()
    public initData;
    private visible = false;
    constructor(
        @Inject(BSN_COMPONENT_MODES)
        private stateEvents: Observable<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascade: Observer<BsnComponentMessage>,
        @Inject(BSN_COMPONENT_CASCADE)
        private cascadeEvents: Observable<BsnComponentMessage>
    ) {
        super();
    }

    public ngOnInit() {
        this.initValue = this.initData ? this.initData : {};
        this.resolverRelation();
    }

    public ngOnDestroy(): void {
        this.unsubscribe();
    }

    private resolverRelation() {
        // 通过配置中的组件关系类型设置对应的事件接受者
        // 表格内部状态触发接收器console.log(this.config);
        if (
            this.config.componentType &&
            this.config.componentType.child === true
        ) {
            this.cascadeSubscriptions = this.cascadeEvents.subscribe(
                cascadeEvent => {
                    // 解析子表消息配置
                    if (
                        this.config.relations &&
                        this.config.relations.length > 0
                    ) {
                        this.config.relations.forEach(relation => {
                            if (
                                relation.relationViewId === cascadeEvent._viewId
                            ) {
                                // 获取当前设置的级联的模式
                                const mode =
                                    BSN_COMPONENT_CASCADE_MODES[
                                        relation.cascadeMode
                                    ];
                                // 获取传递的消息数据
                                const option = cascadeEvent.option;
                                switch (mode) {
                                    case BSN_COMPONENT_CASCADE_MODES.REFRESH_AS_CHILD:
                                        if (option) {
                                            // 解析参数
                                            if (
                                                relation.params &&
                                                relation.params.length > 0
                                            ) {
                                                const t = {};
                                                relation.params.forEach(param => {
                                                    t[param['cid']] =
                                                        option.data[param['pid']];
                                                });
                                                this.tempValue = t;
                                            }

                                        }
                                    setTimeout(() => {
                                        this.visible = true;
                                    });
                                    
                                    break;
                                    case BSN_COMPONENT_CASCADE_MODES.REPLACE_AS_CHILD:

                                    break;
                                }
                            }
                        });
                    }
                }
            );
        }
    }

    private close() {
        setTimeout(() => {
            this.visible = false;   
        });
    }
}

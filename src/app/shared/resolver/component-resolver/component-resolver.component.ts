import { BsnTagComponent } from './../../business/bsn-tag/bsn-tag.component';
import { BsnTagSelectComponent } from './../../business/bsn-tag-select/bsn-tag-select.component';
import { BsnDetailListComponent } from './../../business/ts-detail-list/bsn-detail-list.component';
import { TsDataTableComponent } from './../../business/ts-data-table/ts-data-table.component';
import { BsnToolbarComponent } from './../../business/bsn-toolbar/bsn-toolbar.component';
import { BsnCardListComponent } from './../../business/bsn-card-list/bsn-card-list.component';
import { BsnDataStepComponent } from './../../business/bsn-data-step/bsn-data-step.component';
import { LineChartComponent } from '@shared/chart/line-chart/line-chart.component';
import { BsnStepComponent } from '@shared/business/bsn-step/bsn-step.component';
import { BsnAsyncTreeComponent } from '@shared/business/bsn-async-tree/bsn-async-tree.component';
import { SearchResolverComponent } from '@shared/resolver/form-resolver/search-resolver.component';
import { BsnTableComponent } from '@shared/business/bsn-data-table/bsn-table.component';
import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    Output,
    EventEmitter
} from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { BsnDataTableComponent } from '@shared/business/bsn-data-table/bsn-data-table.component';
import { FormResolverComponent } from '@shared/resolver/form-resolver/form-resolver.component';
import { CnCodeEditComponent } from '@shared/components/cn-code-edit/cn-code-edit.component';
import { CnBsnTreeComponent } from '@shared/business/bsn-tree/bsn-tree.component';
import { BarChartComponent } from '@shared/chart/bar-chart/bar-chart.component';
import { BsnAccordionComponent } from '@shared/business/bsn-accordion/bsn-accordion.component';
import { BsnTabsComponent } from '@shared/business/bsn-tabs/bsn-tabs.component';
import { BsnTransferComponent } from '@shared/business/bsn-transfer/bsn-transfer.component';
import { BsnTreeTableComponent } from '@shared/business/bsn-tree-table/bsn-tree-table.component';
import { WfDesignComponent } from '@shared/work-flow/wf-design/wf-design.component';
import { BsnCarouselComponent } from '@shared/business/bsn-carousel/bsn-carousel';
import { BsnAsyncTreeTableComponent } from '@shared/business/bsn-treeTable/bsn-treeTable.component';
import { TsToolbarComponent } from '@shared/business/ts-toolbar/ts-toolbar.component';
import { BsnScreenShotComponent } from '@shared/business/bsn-screen-shot/bsn-screen-shot.component';
import { BsnReportComponent } from '@shared/business/bsn-report/bsn-report.component';
import { BsnShowImageComponent } from '@shared/business/bsn-show-image/bsn-show-image.component';
import { BsnInlineCardSwipeComponent } from '@shared/business/bsn-inline-card-swipe/bsn-inline-card-swipe.component';
import { BsnInlineFaceRecognitionComponent } from '@shared/business/bsn-inline-face-recognition/bsn-inline-face-recognition.component';
const components: { [type: string]: Type<any> } = {
    code_edit: CnCodeEditComponent,
    bsnTable: BsnTableComponent,
    bsnTreeTable: BsnTreeTableComponent,
    form_view: FormResolverComponent,
    search_view: SearchResolverComponent,
    bsnTree: CnBsnTreeComponent,
    bsnAsyncTree: BsnAsyncTreeComponent,
    bsnAsyncTreeTable: BsnAsyncTreeTableComponent,
    bsnStep: BsnStepComponent,
    lineChart: LineChartComponent,
    barChart: BarChartComponent,
    bsnAccordion: BsnAccordionComponent,
    bsnTabs: BsnTabsComponent,
    bsnTransfer: BsnTransferComponent,
    dataSteps: BsnDataStepComponent,
    wf_design: WfDesignComponent,
    bsnCarousel: BsnCarouselComponent,
    bsnCardList: BsnCardListComponent,
    bsnToolbar: BsnToolbarComponent,
    tsToolbar: TsToolbarComponent,
    tsTable: TsDataTableComponent,
    bsnDetailList: BsnDetailListComponent,
    bsnTagSelect: BsnTagSelectComponent,
    bsnTag: BsnTagComponent,
    bsnScreenShot: BsnScreenShotComponent,
    bsnReport: BsnReportComponent,
    bsnShowImage: BsnShowImageComponent,
    bsnInlineswipe: BsnInlineCardSwipeComponent,
    bsnInlinesface: BsnInlineFaceRecognitionComponent
};
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cn-component-resolver',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './component-resolver.component.html'
})
export class ComponentResolverComponent
    implements OnInit, OnChanges, OnDestroy {
    @Input()
    public config;
    @Input()
    public permissions;
    @Input()
    public blockId;
    @Input()
    public layoutId;
    @Input()
    public tempValue;
    @Input()
    public initData;
    @Input()
    public editable = true;
    @Output()
    public updateValue = new EventEmitter();
    public componentRef: ComponentRef<any>;
    @ViewChild('dynamicComponent', { read: ViewContainerRef })
    public container: ViewContainerRef;

    constructor(
        private http: _HttpClient,
        private resolver: ComponentFactoryResolver
    ) {}

    public ngOnInit() {
        if (this.config) {
            this.createBsnComponent();
        }
    }

    public ngOnChanges() {
        if (this.componentRef && this.config) {
            this.container.clear();
            this.createBsnComponent();
        }
    }

    public createBsnComponent() {
        if (this.config.config) {
            if (!components[this.config.config.component]) {
                const supportedTypes = Object.keys(components).join(', ');
                throw new Error(
                    `Trying to use an unsupported types (${
                        this.config.config.component
                    }).Supported types: ${supportedTypes}`
                );
            }
            const comp = this.resolver.resolveComponentFactory<any>(
                components[this.config.config.component]
            );
            this.componentRef = this.container.createComponent(comp);
            this.componentRef.instance.config = this.config.config;
            if (this.tempValue && this.componentRef.instance.tempValue) {
                this.componentRef.instance.tempValue = this.tempValue;
            }
            if (this.initData) {
                this.componentRef.instance.initData = this.initData;
            }
            if (this.componentRef.instance.hasOwnProperty('permissions')) {
                this.componentRef.instance.permissions = this.permissions;
            }
            // if (this.componentRef.instance.dataList) {
            //     this.componentRef.instance.dataList = this.config.dataList;
            // }
            if (this.componentRef.instance.updateValue) {
                this.componentRef.instance.updateValue.subscribe(value => {
                    this.setValue(value);
                });
            }
            this.componentRef.instance.layoutId = this.layoutId;
            this.componentRef.instance.blockId = this.blockId;
        }
    }

    public setValue(data?) {
        this.updateValue.emit(data);
    }

    public ngOnDestroy() {
        this.componentRef.destroy();
    }
}

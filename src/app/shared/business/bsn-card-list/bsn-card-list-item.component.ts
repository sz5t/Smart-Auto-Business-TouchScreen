import {
    Component,
    OnInit,
    Input,
    AfterViewInit
} from '@angular/core';
import { CnComponentBase } from '@shared/components/cn-component-base';
import { FormGroup } from '@angular/forms';
@Component({
    selector: 'bsn-card-list-item',
    templateUrl: './bsn-card-list-item.component.html',
    styles: [``]
})
export class BsnCardListItemComponent extends CnComponentBase
    implements OnInit, AfterViewInit {
    @Input()
    public config;
    @Input()
    public value;
    public form: FormGroup;
    public isLoading = true;
    public data;
    public _statusSubscription;
    public _cascadeSubscription;
    constructor(
            ) {
        super();
    }

    public ngOnInit() {}

    public ngAfterViewInit() {
        // debugger;
        if (this.value) {
            this.form.setValue(this.value);
        }
    }
}

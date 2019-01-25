import { Component } from '@angular/core';

@Component({
    selector: 'ts-layout-passport',
    templateUrl: './ts-passport.component.html',
    styleUrls: ['./ts-passport.component.less']
})
export class TsLayoutPassportComponent {
    links = [
        {
            title: '帮助',
            href: ''
        },
        {
            title: '隐私',
            href: ''
        },
        {
            title: '条款',
            href: ''
        }
    ];
}

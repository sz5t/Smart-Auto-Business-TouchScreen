import { Component, ViewChild } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { CacheService } from '@delon/cache';

@Component({
    selector: 'app-ts-header',
    templateUrl: './ts-header.component.html',
    styles: [
        `
            .title {
            color: whitesmoke;
            font-size: 25px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 600;
            letter-spacing: 0.1em;
            position: relative;
            top: 5px;  
            }
            .menu-bg{
                background-color: #00c4ff;
            }
            .menu-item {
                margin-right:15px;
                line-height:65px;
            }
            .menu-item  a {
                color:#fff !important;
                display:block;
                padding-left:5px;
                padding-right:5px;
                font-size:14px;
            }
            .menu-item  a:hover {
               background-color:#77aaff !important;  
                transition: background-color 300ms;
            }
        `

    ]
})
export class TsHeaderComponent {
    public searchToggleStatus: boolean;
    public projectName: string;

    constructor(private cacheService: CacheService, public settings: SettingsService) {
        this.projectName = this.cacheService.getNone('AppName');
    }

    public toggleCollapsedSidebar() {
        this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
    }

    /**
     * searchToggleChange
     */
    public searchToggleChange() {
        
    }

}

import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { _HttpClient } from '@delon/theme';
declare let CodeMirror: any;

@Component({
  selector: 'cn-form-textarea',
  templateUrl: './cn-form-textarea.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
    .anticon-close-circle {
      cursor: pointer;
      color: #ccc;
      transition: color 0.3s;
      font-size: 12px;
    }

    .anticon-close-circle:hover {
      color: #999;
    }

    .anticon-close-circle:active {
      color: #666;
    }
    `
  ]
})
export class CnFormTextareaComponent implements OnInit, AfterViewInit {
  @Input()
  public config;
  @Input()
  public formGroup: FormGroup;
  @ViewChild('CodeMirror')
  public codeEditor: ElementRef;
  public editor;
  public model;
  constructor(
    private http: _HttpClient
  ) { }

  public ngOnInit() {
  }

  public ngAfterViewInit() {
  //   this.editor = CodeMirror.fromTextArea(this.codeEditor.nativeElement, {
  //     mode: 'text/x-sql',
  //     highlightFormatting: true,
  //     indentWithTabs: true,
  //     smartIndent: true,
  //     lineNumbers: true,
  //     matchBrackets: true,
  //     autofocus: true,
  //     extraKeys: { 'Ctrl-Space': 'autocomplete' },
  //     hintOptions: {
  //       tables: {
  //         users: { name: null, score: null, birthDate: null },
  //         countries: { name: null, population: null, size: null }
  //       }
  //     }
  //   });
  }

  // public getValue() {
  //   return this.editor.getValue();
  // }

  // public setValue(data?) {
  //   this.editor.setValue(data);
  // }

}

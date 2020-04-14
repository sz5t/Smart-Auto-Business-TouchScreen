import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wf-dashboard,[wf-dashboard]',
  templateUrl: './wf-dashboard.component.html',
  styleUrls: ['./wf-dashboard.component.css']
})
export class WfDashboardComponent implements OnInit {

  constructor() { }
  public node_panels;
  public nodeinfo
  edge_panels
  edgeinfo
  ngOnInit() {
  }

}

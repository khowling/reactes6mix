'use strict;'


import React, {Component} from 'react';
import { SvgIcon, Alert } from './components/utils.jsx';
import Sliders from './components/slider.jsx';
import Stats from './components/stats.jsx';

export default class App extends Component {
  constructor (props) {
     super(props);
     console.log ('App: constructor');
     if (props.serverprops.canvas_req)
      this.state = { booted: true };
    else
      this.state = { booted: false, booterr: "Unorthorised, Log a ticket with your salesforce admin to access this app" };
   }

   handleChange (val) {
     alert (val);
   }

   componentDidMount() {
     var client = new XMLHttpRequest();
     client.open('GET', '/data');
     client.withCredentials = true;
     client.send();
     client.onload = (e) => {
       if (client.status == 200) {
         // Performs the function "resolve" when this.status is equal to 200
         //console.log (`componentDidMount got : ${client.response}`);
         this.setState (JSON.parse(client.response));
       } else {
         // Performs the function "reject" when this.status is different than 200
         console.log('error ' + client.response);
       }
     };
     client.onerror = function (e) {
       console.log("Network Error: " + this.statusText);
     };
   }

   _recalc(leavers, versionid, save) {
     var client = new XMLHttpRequest();
     client.open('POST', '/recalc' + (save && '?save=1' || ''));
     client.withCredentials = true;
     client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
     let body = leavers ? {leavers: Object.assign({}, this.state.leavers, leavers)} : {version: versionid};
     client.send(JSON.stringify(body));
     client.onload = (e) => {
       if (client.status == 200) {
         // Performs the function "resolve" when this.status is equal to 200
         let data = JSON.parse(client.response);
        console.log (`app setState leavers : ${JSON.stringify(data.leavers)}`);
         this.setState ({pnl: data.pnl, leavers: data.leavers, leavers_current: data.leavers_current });
       } else {
         // Performs the function "reject" when this.status is different than 200
         console.log('error ' + client.response);
       }
     };
     client.onerror = function (e) {
       console.log("Network Error: " + this.statusText);
     };
   }

   _saveFlex() {
     this._recalc(this.state.leavers, null, true);
   }

   _loadVersion(id) {
     this._recalc (null, id, false);
   }

   render () {
    console.log ("App: render");
    if (this.state.booted)
      return (
        <div className="slds">
           <div style={{height: "1.5rem"}}></div>
           <div className="container">
              <div className="slds-grid slds-wrap">
                <div className="slds-col--padded slds-size--2-of-5 slds-medium-size--2-of-5">
                  <Stats pnl={this.state.pnl} versions={this.state.versions} leavers_current={this.state.leavers_current} saveFlex={this._saveFlex.bind(this)} loadVersion={this._loadVersion.bind(this)}/>
                </div>
                <div className="slds-col--padded slds-size--3-of-5 slds-medium-size--3-of-5">
                  <Sliders initials={this.state.leavers} recalcFn={this._recalc.bind(this)}/>
                </div>
             </div>
           </div>
        </div>
      );
    else if (this.state.booterr)
      return (
         <Alert message={this.state.booterr}/>
       );
    }
}

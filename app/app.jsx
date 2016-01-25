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
         console.log (`got records : ${client.response}`);
         let data = JSON.parse(client.response);
         this.setState ({pnl: data.pnl, leavers: data.leavers});
       } else {
         // Performs the function "reject" when this.status is different than 200
         reject(client.response);
       }
     };
     client.onerror = function (e) {
       reject("Network Error: " + this.statusText);
     };
   }

   _recalc(leavers) {
     var client = new XMLHttpRequest();
     client.open('POST', '/recalc');
     client.withCredentials = true;
     client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
     client.send(JSON.stringify(leavers));
     client.onload = (e) => {
       if (client.status == 200) {
         // Performs the function "resolve" when this.status is equal to 200
         let data = JSON.parse(client.response);
        console.log (`app setState leavers : ${data.leavers}`);
         this.setState ({pnl: data.pnl, leavers: data.leavers});
       } else {
         // Performs the function "reject" when this.status is different than 200
         reject(client.response);
       }
     };
     client.onerror = function (e) {
       reject("Network Error: " + this.statusText);
     };
   }

   render () {
    console.log ("App: render");
    if (this.state.booted)
      return (
        <div className="slds">
           <div style={{height: "3.5rem"}}></div>
           <div className="container">
              <div className="slds-grid slds-wrap">
                <div className="slds-col--padded slds-size--1-of-2 slds-medium-size--1-of-2">
                  <Stats pnl={this.state.pnl}/>
                </div>
                <div className="slds-col--padded slds-size--1-of-2 slds-medium-size--1-of-2">
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

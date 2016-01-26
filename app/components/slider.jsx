'use strict;'

import React, {Component} from 'react';
import {SvgIcon} from './utils.jsx';

export default class Sliders extends React.Component {
  constructor(props) {
    super(props);
    this._newSliderValue = this._newSliderValue.bind(this);
    this.state = {newvalues: {}, sliders: [
      {key: "term", name: "Term (months)", min: 6, max: 36, step: 6},
      {key: "port_discount", name: "Port Discount (%)", min: 0, max: 100, step: 10},
      {key: "access_markup", name: "Access Markup (%)", min: 0, max: 100, step: 5},
      {key: "cpe_hardware", name: "CPE Hardware (Y/N)", min: 0, max: 1, step: 1},
      {key: "amort_oneoff", name: "Amortise Charges (Y/N)", min: 0, max: 1, step: 1}
    ]};
  }

  _newSliderValue(val) {
    this.setState({newvalues: Object.assign(this.state.newvalues, val)}, () => {
        console.log (`got new slider val ${JSON.stringify(this.state.newvalues)}`);
        this.props.recalcFn (this.state.newvalues, false);
    });
  }

  render() {
    console.log ('Sliders render() with values ' + JSON.stringify(this.props.initials));
    let that = this;
    return (
      <div className="slds-card">
        <div className="slds-card__header slds-grid">
          <div className="slds-media slds-media--center slds-has-flexi-truncate">
            <div className="slds-media__figure">
              <SvgIcon  spriteType="action" spriteName="share_poll" />
            </div>
            <div className="slds-media__body">
              <h2 className="slds-text-heading--small slds-truncate">Flex</h2>
            </div>
          </div>
        </div>
        <div className="slds-card__body">
          <table className="slds-table slds-table--bordered slds-max-medium-table--stacked-horizontal slds-no-row-hover">

            <tbody>
              { this.state.sliders.map(s => { return (
                <tr key={s.key} className="slds-hint-parent">
                  <td className="slds-size--1-of-4" data-label="Name">{s.name}</td>
                  <td className="slds-size--3-of-4" data-label="Name"><Slider id={s.key} initial={that.props.initials && that.props.initials[s.key] || 0} min={s.min} max={s.max}  step={s.step} updateValueFn={that._newSliderValue}/></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
        <div className="slds-card__footer"><a href="#">View All <span className="slds-assistive-text">entity type</span></a></div>
      </div>
    );
  }
}


export class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {current: props.initial};
  }
  componentWillReceiveProps(nextProps) {
    //console.log (`Slider nextProps ${JSON.stringify(nextProps)}`);
    if (typeof nextProps.initial !== "undefined" && (nextProps.initial !== this.state.current && nextProps.initial !== this.props.initial )) {
      console.log (`Slider componentWillReceiveProps prop ${nextProps.initial} state ${this.state.current}`);
      this.setState({current: nextProps.initial});
    }
  }

  _changeVal(e) {
    let inval = e.target.value;
    console.log (inval);
    this.setState ({current: inval});
  }
  _recalc (e) {
    let inval = new Number(e.target.value);
    console.log ('recal with: ' + this.state.current);
    this.props.updateValueFn ({[this.props.id] : inval});
  }

  render() {
    let steps = [];
    if (this.props.step > 1 || this.props.max <= 10)
      for (let i = this.props.min; i <= this.props.max; i = i+this.props.step)
        steps.push(i);

    return (
      <div style={{width: "270px"}}>
        <div style={{width: "220px", display: "inline-block"}}>
          { (this.props.step > 1 || this.props.max <= 10) &&
            <div>
              <input className="tickonly" min={this.props.min} max={this.props.max} step={this.props.step} type="range" list={"list"+this.props.id}/>
              <datalist id={"list"+this.props.id}>
                {
                  steps.map(i => <option key={i}>{i}</option>)
                }
              </datalist>
            </div>
          }
          <div style={{marginTop: (this.props.step > 1 || this.props.max <= 10) && "-8px" || "+15px"}}>
            <input className="flex"  min={this.props.min} max={this.props.max}  value={this.state.current} step={this.props.step} onMouseUp={this._recalc.bind(this)} onChange={this._changeVal.bind(this)} type="range" />
          </div>
        </div>
        <div className="slds-pill" style={{float: "right", width: "40px", marginTop: "8px"}}>
          <span className="slds-pill__label">{this.state.current}</span>
        </div>
        <div style={{clear: "both"}}/>
      </div>
    );
  }
}
Slider.propTypes = { initial: React.PropTypes.number, min: React.PropTypes.number, max: React.PropTypes.number, step: React.PropTypes.number};
Slider.defaultProps = { initial: 50, min: 0, max: 100,  step: 20};

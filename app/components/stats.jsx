'use strict;'

import React, {Component} from 'react';
import {SvgIcon} from './utils.jsx';

export default class Stats extends React.Component {

  _saveFlex() {
    this.props.saveFlex();
  }

  _loadVersion(id) {
    this.props.loadVersion(id);
  }

  render() {
    let that = this;
    return (
      <div className="slds-card">
        <div className="slds-card__header slds-grid">
          <div className="slds-media slds-media--center slds-has-flexi-truncate">
            <div className="slds-media__figure">
              <SvgIcon  spriteType="standard" spriteName="investment_account" />
            </div>
            <div className="slds-media__body">
              <h2 className="slds-text-heading--small slds-truncate">Financial Summary</h2>
            </div>
          </div>
          <div className="slds-no-flex">
            <div className="slds-button-group">

              <button className="slds-button slds-button--neutral slds-button--small" onClick={this._saveFlex.bind(this)}>Save new Version</button>
              <div className="slds-dropdown-trigger">
                <button className="slds-button slds-button--icon-border-filled slds-toggle-visibility">
                  <SvgIcon  spriteType="utility" spriteName="down" classOverride="slds-icon-utility" />
                  <span className="slds-assistive-text">Show More</span>
                </button>
                <div className="slds-dropdown slds-dropdown--left slds-dropdown--actions slds-dropdown--menu">
                    <ul className="slds-dropdown__list" role="menu">
                      { this.props.versions && this.props.versions.map(function(v) { return (
                        <li key={v.Id} href="#" className="slds-dropdown__item">
                          <a className="slds-truncate" role="menuitem" onClick={that._loadVersion.bind(that, v.Id)}>{v.Name}</a>
                        </li>
                      )})}
                    </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="slds-card__body">
          <table className="slds-table slds-table--bordered slds-max-medium-table--stacked-horizontal slds-no-row-hover">
            <tbody>
              <tr className="slds-hint-parent">
                <td >Revenue</td>
                <td><p className="slds-text-heading--medium" style={{textAlign: "right"}}>£{this.props.pnl && (Math.round(this.props.pnl.revenue*100)/100).toLocaleString() || 'updating..'}</p></td>

              </tr>
              <tr className="slds-hint-parent">
                <td >Gross Margin</td>
                <td><p className="slds-text-heading--medium" style={{textAlign: "right"}}>£{this.props.pnl && (Math.round(this.props.pnl.grossmargin*100)/100).toLocaleString() || 'updating..'}</p></td>

              </tr>
              <tr className="slds-hint-parent">
                <td>Gross Margin %</td>
                <td><p className="slds-text-heading--medium" style={{textAlign: "right"}}>{this.props.pnl && this.props.pnl.marginage.toFixed(2) || 'updating..'}%</p></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="slds-card__footer"><a href="#">View All <span className="slds-assistive-text">entity type</span></a></div>
      </div>
    );
  }
}

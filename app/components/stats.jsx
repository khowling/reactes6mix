'use strict;'

import React, {Component} from 'react';
import {SvgIcon} from './utils.jsx';

export default class Stats extends React.Component {


    render() {
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
                <button className="slds-button slds-button--neutral slds-button--small">Button</button>
                <button className="slds-button slds-button--icon-border-filled slds-toggle-visibility">
                  <SvgIcon  spriteType="utility" spriteName="down" classOverride="slds-icon-utility" />
                  <span className="slds-assistive-text">Show More</span>
                </button>
              </div>
            </div>
          </div>
          <div className="slds-card__body">
            <table className="slds-table slds-table--bordered slds-max-medium-table--stacked-horizontal slds-no-row-hover">
              <tbody>
                <tr className="slds-hint-parent">
                  <td className="slds-size--1-of-4" data-label="Name">Revenue</td>
                  <td className="slds-size--1-of-4" data-label="Company"><p className="slds-text-heading--medium">£{this.props.pnl && this.props.pnl.revenue || '????'}</p></td>
                  <td className="slds-size--1-of-4" data-label="Title">45%</td>
                </tr>
                <tr className="slds-hint-parent">
                  <td className="slds-size--1-of-4" data-label="Name">Gross Margin</td>
                  <td className="slds-size--1-of-4" data-label="Company"><p className="slds-text-heading--medium">£{this.props.pnl && this.props.pnl.grossmargin || '????'}</p></td>
                  <td className="slds-size--1-of-4" data-label="Title">0</td>
                </tr>
                <tr className="slds-hint-parent">
                  <td className="slds-size--1-of-4" data-label="Name">Gross Margin %</td>
                  <td className="slds-size--1-of-4" data-label="Company"><p className="slds-text-heading--medium">{this.props.pnl && this.props.pnl.marginage || '????'}%</p></td>
                  <td className="slds-size--1-of-4" data-label="Title"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="slds-card__footer"><a href="#">View All <span className="slds-assistive-text">entity type</span></a></div>
        </div>
      );
    }
}

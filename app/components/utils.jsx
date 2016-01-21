'use strict;'

import React, {Component} from 'react';

export  class SvgIcon extends Component {
  render() {
    // this.props.spriteType = [action, custom, doctype, standard, utility]
    // this.props.spriteName = description
    // this.props.small = true/false
    // this.props.large = true
    // this.props.classOverride = 'slds-input__icon'

    return (
        <svg className={(this.props.classOverride  || "") + ((this.props.spriteType === "utility" && !this.props.classOverride) && " icon-utility "  ||  " slds-icon ")  + (this.props.small && "slds-icon--small" || "") + (this.props.large && "slds-icon--large" || "") + " slds-icon-" + this.props.spriteType+ "-" +this.props.spriteName.replace(/_/g,"-")}
          dangerouslySetInnerHTML={{__html: "<use xlink:href='/assets/icons/"+this.props.spriteType+"-sprite/svg/symbols.svg#"+this.props.spriteName+"' />"}}>
        </svg>
  )}
}
SvgIcon.propTypes = { spriteType: React.PropTypes.string.isRequired, spriteName: React.PropTypes.string.isRequired, small: React.PropTypes.bool, large: React.PropTypes.bool  };
SvgIcon.defaultProps = { spriteType: "", spriteName: "", small: false, large: false };



export class Alert extends Component {

  render () {
    return (
      <div className={"slds-notify slds-notify--alert slds-theme--"+this.props.type+" -texture"}>
       <span className="slds-assistive-text">{this.props.type}</span>
       <h2>
         <SvgIcon spriteType="utility" small={true} spriteName="ban" classOverride="slds-icon"/>
         <span>{this.props.message}</span>
       </h2>
     </div>

    )
  }
}
Alert.propTypes = {message: React.PropTypes.string.isRequired, type: React.PropTypes.string };
Alert.defaultProps = { type: "alert"};


export class Modal extends Component {
  render() {
    return (
    <div>
      <div aria-hidden="false" role="dialog" className="slds-modal slds-modal--large slds-fade-in-open">
        <div className="slds-modal__container"  style={{width: "95%"}}>
            {this.props.children}
        </div>
      </div>
      <div className="slds-modal-backdrop slds-modal-backdrop--open"></div>
    </div>
    );
  }
}

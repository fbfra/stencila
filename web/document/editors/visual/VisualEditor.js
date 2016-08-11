'use strict';

var AbstractEditor = require('substance/ui/AbstractEditor');
var ScrollPane = require('substance/ui/ScrollPane');
var ContainerEditor = require('substance/ui/ContainerEditor');

var OverallToolset = require('./OverallToolset');
var Overlayer = require('./Overlayer');
var MacroManager = require('../../ui/MacroManager');

/**
 * A editor for a Stencila Document
 *
 * @class      VisualEditor (name)
 */
function VisualEditor() {
  VisualEditor.super.apply(this, arguments);

  // Use custom MacroManager
  this.macroManager.context.documentSession.off(this.macroManager);
  delete this.macroManager;
  this.macroManager = new MacroManager(this.getMacroContext(), this.props.configurator.getMacros());

  // Bind to events
  this.handleActions({
    'reveal-toggle': this._revealToggle,
    'comment-toggle': this._commentToggle,
    'edit-toggle': this._editToggle,
  });
}

VisualEditor.Prototype = function() {

  /**
  * Get the initial state of the editor
  *
  * @return     {Object}  The initial state.
  */
  this.getInitialState = function() {
    // Initially, if in edit mode, then also turn on reveal mode
    // and comment mode (user can turn off these later if they want to)
    // See also `this._editToggle`
    var edit = this.props.edit;
    var reveal = this.props.reveal || edit;
    var comment = this.props.comment || edit;
    return {
      reveal: reveal,
      comment: comment,
      edit: edit
    };
  };

  /**
   * Render this editor
   */
  this.render = function($$) {
    var configurator = this.props.configurator;

    var el = $$('div').addClass('sc-visual-editor');

    // Toggle classes to match state and update
    // the extracted command states so relevant tools are
    // updated accordingly
    ['reveal', 'edit'].forEach(function(item) {
      if (this.state[item]) el.addClass('sm-'+item);
    }.bind(this));

    // A Toolset for whole document commands
    el.append(
      $$(OverallToolset,{
        reveal: this.state.reveal,
        edit: this.state.edit
      }).ref('overallToolset')
    );

    el.append(
      // A `ScrollPane` to manage overlays and other positioning
      $$(ScrollPane, {
        scrollbarType: 'native',
        scrollbarPosition: 'right',
        overlay: Overlayer,
      })
        .ref('scrollPane')
        .append(
          // A  ContainerEditor  for the content of the document
          $$(ContainerEditor, {
            containerId: 'content',
            disabled: !this.state.edit,
            commands: configurator.getSurfaceCommandNames(),
            textTypes: configurator.getTextTypes()
          }).ref('containerEditor')
        )
    );

    return el;
  };

  this.didMount = function() {
    var editor = this.refs.containerEditor;
    if (editor.isEmpty()) editor.onCreateText();
  }

  /**
   * Update editor when document session is updated.
   * 
   * This is an override of `AbstractEditor._documentSessionUpdated`
   * that instead of updating a single toolbar updates our multiple
   * toolsets.
   */
  this._documentSessionUpdated = function() {
    var commandStates = this.commandManager.getCommandStates();
    ['overallToolset'].forEach(function(name) {
      this.refs[name].extendProps({
        commandStates: commandStates
      });
    }.bind(this));
  };

  /**
   * Toggle the `reveal` state
   */
  this._revealToggle = function() {
    this.extendState({
      reveal: !this.state.reveal
    })
  }

  /**
   * Toggle the `comment` state
   */
  this._commentToggle = function() {
    this.extendState({
      comment: !this.state.comment
    })
  }

  /**
   * Toggle the `edit` state. If edit mode is getting turned on
   * then reveal mode is also automatically turned on.
   */
  this._editToggle = function() {
    var edit = !this.state.edit;
    this.extendState({
      reveal: edit || this.state.reveal,
      comment: edit || this.state.comment,
      edit: edit
    })
  }

};

AbstractEditor.extend(VisualEditor);


module.exports = VisualEditor;

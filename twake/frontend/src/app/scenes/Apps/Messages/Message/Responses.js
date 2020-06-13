import React, {Component} from 'react';

import Languages from 'services/languages/languages.js';
import Collections from 'services/Collections/Collections.js';
import Message from './Message.js';
import Icon from 'components/Icon/Icon.js';
import Input from '../Input/Input.js';
import MessagesService from 'services/Apps/Messages/Messages.js';
import WorkspacesApps from 'services/workspaces/workspaces_apps.js';
import Button from 'components/Buttons/Button.js';
import Globals from 'services/Globals.js';

export default class Responses extends Component {
  constructor() {
    super();

    this.state = {
      i18n: Languages,
      messages_repository: Collections.get('messages'),
      app_messages_service: MessagesService,
    };

    Languages.addListener(this);
    Collections.get('messages').addListener(this);
    MessagesService.addListener(this);
  }
  componentWillUnmount() {
    Languages.removeListener(this);
    Collections.get('messages').removeListener(this);
    MessagesService.removeListener(this);
  }
  sendResponse() {
    this.setState({ response_message_raw: '' });
    if (Globals.window.mixpanel_enabled)
      Globals.window.mixpanel.track(Globals.window.mixpanel_prefix + 'Send respond Event');
    MessagesService.sendMessage(
      this.state.response_message_raw,
      {
        parent_message_id: this.props.parentMessage.id,
        channel_id: this.props.parentMessage.channel_id,
      },
      this.props.messagesCollectionKey,
    );
    MessagesService.startRespond(false);
  }
  triggerApp(app, from_icon) {
    if (
      (from_icon &&
        (((app.display || {}).messages_module || {}).right_icon || {}).should_wait_for_popup) ||
      (!from_icon &&
        (((app.display || {}).messages_module || {}).in_plus || {}).should_wait_for_popup)
    ) {
      WorkspacesApps.openAppPopup(app.id);
    }
    var data = {
      channel: Collections.get('channels').find(this.props.channelId),
      parent_message: this.props.parentMessage,
      from_icon: from_icon,
    };
    WorkspacesApps.notifyApp(app.id, 'action', 'open', data);
  }
  render() {
    return (
      <div className="responses">
        {this.props.parentMessage.responses_count > 5 && (
          <a
            className="action_link"
            onClick={() => MessagesService.showMessage(this.props.parentMessage.id)}
          >
            <Icon className="m-icon-small" type="arrow-down" />
            {Languages.t(
              'scenes.apps.messages.message.show_responses_button',
              [],
              'Afficher toutes les réponses',
            )}{' '}
            ({this.props.parentMessage.responses_count})
          </a>
        )}

        {this.state.messages_repository
          .findBy({
            channel_id: this.props.channelId,
            parent_message_id: this.props.parentMessage.id,
            _user_ephemeral: undefined,
          })
          .sort((a, b) => a.creation_date - b.creation_date)
          .slice(-5)
          .map(message => {
            if (!message) {
              return '';
            }
            return (
              <Message
                key={message.front_id}
                messagesCollectionKey={this.props.messagesCollectionKey}
                previousMessage={{}}
                message={message}
                isResponse
              />
            );
          })}

        {this.state.app_messages_service.respondedMessage.parent_message_id ==
          this.props.parentMessage.id && (
          <div
            className="response_edited"
            onDoubleClick={evt => {
              evt.preventDefault();
              evt.stopPropagation();
            }}
          >
            <Input
              className="right-margin"
              localStorageIdentifier={this.props.channelId}
              onResize={this.props.measure}
              disableSend
              disableApps
              ref={node => (this.input = node)}
              value={
                this.state.response_message_raw !== undefined ? this.state.response_message_raw : ''
              }
              onChange={val => this.setState({ response_message_raw: val })}
              onSend={val => {
                this.sendResponse();
              }}
              onEscape={() => {
                MessagesService.startRespond(false);
                this.setState({ response_message_raw: undefined });
              }}
              triggerApp={app => this.triggerApp(app)}
            />
            <Button
              value={Languages.t('scenes.apps.messages.message.save_button', [], 'Enregistrer')}
              className="small right-margin"
              onClick={() => {
                if (this.state.response_message_raw) {
                  if (this.input) {
                    this.input.setValue('');
                  }
                  this.sendResponse();
                }
              }}
            />
            <Button
              value={Languages.t('scenes.apps.messages.message.cancell_button', [], 'Annuler')}
              className="small secondary"
              onClick={() => {
                if (this.input) {
                  this.input.setValue('');
                }
                MessagesService.startRespond(false);
                this.setState({ response_message_raw: undefined });
              }}
            />
          </div>
        )}

        {this.state.app_messages_service.respondedMessage.parent_message_id !=
          this.props.parentMessage.id &&
          (this.props.parentMessage.responses_count > 0 || this.props.isLastMessage) && (
            <a
              className="action_link add_response"
              onClick={() => MessagesService.startRespond(this.props.parentMessage)}
            >
              <Icon className="m-icon-small" type="corner-down-right-alt" />
              {Languages.t('scenes.apps.messages.message.reply_button', [], 'Répondre')}
            </a>
          )}
      </div>
    );
  }
}
import * as React from 'react';
import { render } from 'react-dom';
import { TextLink, EntryCard, Note } from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

interface ItemProps {
  sdk: FieldExtensionSDK;
  idx: number;
  onChange: (state:any, idx: number) => any;
  initState: ItemState | any;
}

export interface ItemState {
  referencedEntity: any;
  label: string;
  url: string;
  type: 'none' | 'internal' | 'external' | 'deleted';
}

export class Item extends React.Component<ItemProps, ItemState> {
  constructor(props: ItemProps) {
    super(props);
    this.state = {
      referencedEntity: props.initState.referencedEntity || null,
      label: props.initState.label || '',
      url: props.initState.url || '',
      type: props.initState.type || 'none'
    };
  }

  // Invoke when data is changed to persist it as json
  onChange = async () => {
    this.props.onChange(this.state, this.props.idx)
  };

  // Functions below handle presentation layer and runtime extension state
  addInternal = async () => {
    const instanceParams: any = this.props.sdk.parameters.instance;
    const linkableTypes = instanceParams.linkableTypes
      ? instanceParams.linkableTypes.split(',')
      : undefined;
    const entity: any = await this.props.sdk.dialogs.selectSingleEntry({
      contentTypes: linkableTypes
    });

    if (!entity) return;

    // Resolve URL
    let url = ''
    if("slug" in entity.fields)
    {
      url = (this.props.sdk.field.locale in entity.fields.slug) ? entity.fields.slug[this.props.sdk.field.locale] : entity.fields.slug[this.props.sdk.locales.default]
    }

    this.setState(
      {
        ...this.state,
        referencedEntity: entity,
        label: entity.fields.title[this.props.sdk.locales.default],
        url: url,
        type: 'internal'
      },
      () => {
        this.onChange();
      }
    );
  };

  isPublished = (entity: any) => {
    return !!entity.sys.publishedVersion && entity.sys.version == entity.sys.publishedVersion + 1;
  };

  addExternal = async () => {
    const url = await this.props.sdk.dialogs.openPrompt({
      title: 'External URL',
      message: 'When user clicks text, this URL will open in a new window.',
      defaultValue: this.state.url || 'https://'
    });

    if (!url) return;

    this.setState(
      { ...this.state, label: url as string, url: url as string, type: 'external' },
      () => {
        this.onChange();
      }
    );
  };

  removeLink = async () => {
    const confirm = await this.props.sdk.dialogs.openConfirm({
      title: 'Are you sure?',
      message: 'Are you sure you want to remove this link?'
    });

    if (!confirm) return;

    this.setState(
      { ...this.state, label: '', referencedEntity: null, url: '', type: 'deleted' },
      () => {
        this.onChange();
      }
    );
  };

  editLabel = async () => {
    const result = await this.props.sdk.dialogs.openPrompt({
      title: 'Label',
      message: 'Shown as link text on the website.',
      defaultValue: this.state.label
    });

    if (!result) return;

    this.setState({ ...this.state, label: result as string }, () => {
      this.onChange();
    });
  };

  editURL = async () => {
    const result = await this.props.sdk.dialogs.openPrompt({
      title: 'External URL',
      message: 'When user clicks text, this URL will open in a new window.',
      defaultValue: this.state.url || 'https://'
    });

    if (!result) return;

    this.setState({ ...this.state, url: result as string }, () => {
      this.onChange();
    });
  };

  renderItemInternal = () => {
    const ctype = this.state.referencedEntity.sys.contentType.sys.id;
    const title = this.state.referencedEntity.fields.title[this.props.sdk.locales.default];
    return (
      <EntryCard
        className=""
        contentType={`Internal`}
        title={this.state.label}
        description={`Link to internal page "${title}"`}
        size="default"
      />
    );
  };

  renderItemExternal = () => {
    return (
      <EntryCard
        className=""
        contentType={'External'}
        title={this.state.label}
        description={this.state.url}
        size="default"
      />
    );
  };

  renderAddControls = () => {
    return (
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <TextLink icon="Link" onClick={this.addInternal}>
          Internal Link
        </TextLink>
        <span style={{ marginRight: '2rem' }}></span>
        <TextLink icon="ExternalLink" onClick={this.addExternal}>
          External Link
        </TextLink>
      </div>
    );
  };

  renderEditControls = () => {
    return (
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <TextLink icon="Edit" onClick={this.editLabel}>
          Change Label
        </TextLink>
        {this.state.type === 'external' && (
          <>
            <span style={{ marginRight: '2rem' }}></span>
            <TextLink icon="ExternalLink" onClick={this.editURL}>
              Change URL
            </TextLink>
          </>
        )}
        {this.state.type === 'internal' && (
          <>
            <span style={{ marginRight: '2rem' }}></span>
            <TextLink icon="Link" onClick={this.addInternal}>
              Change linked entry
            </TextLink>
          </>
        )}
        <span style={{ marginRight: '2rem' }}></span>
        <TextLink icon="Close" linkType="negative" onClick={this.removeLink}>
          Remove Link
        </TextLink>
      </div>
    );
  };

  renderUnpublishedWarning = () => {
    return (
      <div style={{ marginTop: '1rem' }}>
        <Note noteType="warning" testId="cf-ui-note" title="">
          Page you're linking to is not published. Link will not be shown.
        </Note>
      </div>
    );
  };

  render = () => {
    if(this.state.type === 'deleted')
    {
      return null
    }
    return (
      <>
        {this.state.type === 'internal' &&
          !this.isPublished(this.state.referencedEntity) &&
          this.renderUnpublishedWarning()}
        {this.state.type === 'internal' && this.renderItemInternal()}
        {this.state.type === 'external' && this.renderItemExternal()}
        {this.state.type === 'none' && this.renderAddControls()}
        {this.state.type !== 'none' && this.renderEditControls()}
      </>
    );
  };
}

import * as React from 'react';
import { render } from 'react-dom';
import { TextLink, EntryCard, Note } from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

interface AppProps {
  sdk: FieldExtensionSDK;
}

interface AppState {
  referencedEntity: any;
  label: string;
  url: string;
  type: 'none' | 'internal' | 'external';
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      referencedEntity: null,
      label: '',
      url: '',
      type: 'none'
    };
  }

  // Code below handles persistance, serialization and global events

  detachExternalChangeHandler: Function | null = null;

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  onExternalChange = (newState: any) => {
    if (!newState) return;
    this.setState({ ...newState });
  };

  // Invoke when data is changed to persist it as json
  onChange = async () => {
    if (this.state.type === 'none') {
      await this.props.sdk.field.removeValue();
    } else {
      await this.props.sdk.field.setValue(this.state);
    }
  };

  // Functions below handle presentation layer and runtime extension state
  addInternal = async () => {
    const instanceParams: any = this.props.sdk.parameters.instance;
    const linkableTypes = instanceParams.linkableTypes
      ? instanceParams.linkableTypes.split(',')
      : undefined;
    if (instanceParams && instanceParams.linkableTypes) {
    }
    const entity: any = await this.props.sdk.dialogs.selectSingleEntry({
      contentTypes: linkableTypes
    });

    if (!entity) return;

    this.setState(
      {
        ...this.state,
        referencedEntity: entity,
        label: entity.fields.title[this.props.sdk.locales.default],
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
      { ...this.state, label: '', referencedEntity: null, url: '', type: 'none' },
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
      <div style={{ marginTop: '1rem' }}>
        <TextLink icon="Plus" onClick={this.addInternal}>
          Internal Link
        </TextLink>
        <span style={{ marginRight: '2rem' }}></span>
        <TextLink icon="Plus" onClick={this.addExternal}>
          External Link
        </TextLink>
      </div>
    );
  };

  renderEditControls = () => {
    return (
      <div style={{ marginTop: '1rem' }}>
        <TextLink icon="Edit" onClick={this.editLabel}>
          Change Label
        </TextLink>
        {this.state.type === 'external' && (
          <>
            <span style={{ marginRight: '2rem' }}></span>
            <TextLink icon="Link" onClick={this.editURL}>
              Change URL
            </TextLink>
          </>
        )}
        {this.state.type === 'external' && (
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

init(sdk => {
  render(<App sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }

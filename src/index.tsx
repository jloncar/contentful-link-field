import * as React from 'react';
import { render } from 'react-dom';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import './index.css';
import '@contentful/forma-36-react-components/dist/styles.css';
import LinkList from './LinkList';
import { IAppState, IAppProps, ILink } from './typings';

// App: Handleovanje persistance-a i ucitavanja (prosledjivanje state-a wrapperu)
// App: Ucitavnje parametara (sta moze da se linkuje, koliki su minimum i maximum, dal je required -- validacije)

export class App extends React.Component<IAppProps, IAppState> {
  min = 0;
  max = 100;
  message = '';
  allowAssets = false;
  linkableTypes: string[] = [];
  detachExternalChangeHandler: Function | null = null;

  constructor(props: IAppProps) {
    super(props);
    this.state = {
      links: []
    };
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onChange);

    const required = this.props.sdk.field.required;
    const validations = this.props.sdk.field.validations;

    // Extract validation values
    if (validations && validations.length > 0) {
      for (let i = 0; i < validations.length; i++) {
        if ('size' in validations[i]) {
          this.message = (validations[i] as any).message || '';
          this.min = (validations[i] as any).size.min;
          this.max = (validations[i] as any).size.max;
        }
      }
    }
    // Normalize validations to min and max
    if (this.min === 0 && required === true) this.min = 1;

    // Allow asset links?
    this.allowAssets = (this.props.sdk.parameters.instance as any).allowAssets || false;

    // Extract linkable types
    const instanceParams: any = this.props.sdk.parameters.instance;
    this.linkableTypes = instanceParams.linkableTypes
      ? instanceParams.linkableTypes.split(',')
      : [];
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  onChange = (links: ILink[]) => {
    if (!links || links.length === 0) links = [];
    this.setState({ links: [...links] });
  };

  onChangeInternal = (links: ILink[]) => {
    // Persist
    // will "onChange" be inovked automatically to persist in state or nah?
    this.props.sdk.field.setValue(links);
  };

  render = () => {
    return (
      <LinkList
        sdk={this.props.sdk}
        min={this.min}
        max={this.max}
        items={this.state.links}
        linkableTypes={this.linkableTypes}
        allowAssets={this.allowAssets}
        onChange={this.onChangeInternal}
      />
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

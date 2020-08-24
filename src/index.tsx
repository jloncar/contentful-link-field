import * as React from 'react';
import { render } from 'react-dom';
import { TextLink, EntryCard, Note } from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import { Item, ItemState } from './item';

interface AppProps {
  sdk: FieldExtensionSDK;
}

interface AppState {
  links: any[];
}

export class App extends React.Component<AppProps, AppState> {
  min: number;
  max: number;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      links: []
    };

    this.min = 1;
    this.max = 5;
  }

  // Code below handles persistance, serialization and global events

  detachExternalChangeHandler: Function | null = null;

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();
    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
  }

  onItemChange = (state: any, idx: number) => {
    let links = [...this.state.links];
    links[idx] = state;
    this.props.sdk.field.setValue(links);
  };

  addItem(initState?: ItemState) {
    const initS = initState ? initState : {};

    this.setState({
      links: [...this.state.links, initS]
    });
  }

  onExternalChange = (newLinks: any[]) => {
    if (!newLinks || newLinks.length === 0) newLinks = [];

    this.setState({ links: [...newLinks] });
  };

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  render = () => {
    return (
      <>
        {this.state.links.map((state, i) => (
          <Item
            sdk={this.props.sdk}
            initState={state}
            onChange={this.onItemChange}
            key={i}
            idx={i}
          />
        ))}

        <TextLink icon="Plus" linkType="positive" onClick={this.addItem.bind(this, undefined)}>
          Add {this.state.links.length}
        </TextLink>
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

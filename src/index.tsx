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
  items: any[];
}

export class App extends React.Component<AppProps, AppState> {
  min: number;
  max: number;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      links: [],
      items: []
    };

    this.min = 1;
    this.max = 5;
  }

  // Code below handles persistance, serialization and global events

  detachExternalChangeHandler: Function | null = null;

  componentDidMount() {
    console.log('AAA');
    this.props.sdk.window.startAutoResizer();
    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
  }

  onItemChange = (state: any, idx: number) => {
    let links = [...this.state.links]
    links[idx] = state
    this.setState({links: links}, () => {
      const value = links
      this.props.sdk.field.setValue(value);
      console.log('COMMITED', value);
      console.log('STATS', this.state.links, this.state.items);
    })
  };

  addItem(initState?: ItemState) {
    console.log('ADD ITEM', initState);
    const idx = this.state.items.length;
    const initS = initState ? initState : {};
    const newItem = (
      <Item
        sdk={this.props.sdk}
        initState={initS}
        onChange={this.onItemChange}
        key={idx}
        idx={idx}
      />
    );

    this.setState({
      items: [...this.state.items, newItem],
      links: [...this.state.links, initS]
    });
  }

  onExternalChange = (newLinks: any[]) => {
    console.log('ON EXTERNAL CHANGE', newLinks);
    if (!newLinks || newLinks.length === 0) return;

    const items = newLinks.map(
      (initS, idx) =>
        initS && (
          <Item
            sdk={this.props.sdk}
            initState={initS}
            onChange={this.onItemChange}
            key={idx}
            idx={idx}
          />
        )
    );
    console.log("NEW ITEMS", items, "NEW LINKS", newLinks)
    this.setState({ items: items, links: newLinks });
  };

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  render = () => {
    return (
      <>
        {this.state.items.length > 0 && this.state.items.map((It, i) => It)}

        <TextLink icon="Plus" linkType="positive" onClick={this.addItem.bind(this, undefined)}>
          Add Link
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
